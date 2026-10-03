# Condensé

SaaS pour streamers : on importe la rediffusion d'un live (fichier ou VOD Twitch) et on obtient un best-of ou des épisodes montés automatiquement.

## Site

- **Langues** : français et anglais, une URL par langue (`/fr/...`, `/en/...`). Le proxy redirige vers la langue mémorisée (cookie) ou celle du navigateur. Les textes sont dans `src/i18n/dictionaries` : ajouter une langue = ajouter un dictionnaire et l'entrée dans `src/i18n/config.ts`.
- **Pages publiques** (pré-générées) : accueil, fonctionnalités, tarifs, à propos, contact, pages légales. Auth : connexion, inscription, mot de passe oublié/réinitialisation. App : projets, éditeur, réglages du compte.
- **SEO** : métadonnées par page et par langue, canonical + hreflang, `sitemap.xml`, `robots.txt`, manifest, images Open Graph générées par langue, données structurées (Organization, SoftwareApplication, FAQPage).
- **Thème** clair / sombre / système (next-themes).
- Avant la mise en ligne : renseigner `NEXT_PUBLIC_SITE_URL`, l'e-mail de contact, les mentions légales et `SMTP_URL` (voir `.env.example`).

## Architecture

- **App Next.js** (`src/`) : UI, auth (Better Auth), API. Les vidéos sont envoyées directement du navigateur vers le stockage S3 via des URLs signées (upload multipart), sans passer par le serveur.
- **Worker Python** (`worker/`) : consomme la file BullMQ `pipeline` (Redis), traite les vidéos avec ffmpeg / yt-dlp et écrit l'avancement directement dans MongoDB.
- **Stockage** : S3-compatible. SeaweedFS en local, Cloudflare R2 ou AWS S3 en production.

Pipeline (voir `worker/app/pipeline.py`) :

1. **Import** : upload ou VOD Twitch + replay du chat, analyse du fichier, extraction audio.
2. **Analyse** : transcription horodatée au mot, signaux par seconde (volume audio, activité et réactions du chat), découpage en blocs aux pauses de parole, puis découpage du live en séquences notées. 
3. **Temps forts** : les meilleures séquences sont resserrées au plus court (≤ 75 s, environ un temps fort par tranche de 6 min de live), avec une miniature chacune.
4. **Éditeur** : le streamer visionne chaque temps fort avec sa transcription, ajuste son début et sa fin (coupes aimantées aux pauses entre les mots), et compose son montage sur une timeline horizontale, dans l'ordre de son choix (glisser-déposer).
5. **Export** : coupes exactes, micro-fondus audio, volume normalisé à -14 LUFS, chapitres YouTube générés.

### Gratuit par défaut

Tout tourne en local, sans API payante :

| Étape | Par défaut (gratuit) | Options |
|---|---|---|
| Transcription (`TRANSCRIBE_PROVIDER`) | `local` : faster-whisper sur CPU. Modèle `small` ≈ 45 min pour 4 h de live sur un M1 | `deepgram` (payant, ~2 min) |
| Temps forts (`ANALYSIS_PROVIDER`) | `heuristic` : score à partir des réactions du chat, du volume et de l'excitation dans la parole | `ollama` (LLM local gratuit, `ollama pull qwen2.5:3b`), `claude` (payant, meilleur jugement) |

Le worker a besoin d'environ 1 Go de mémoire pendant la transcription. Si Docker Desktop est limité à 4 Go et partagé avec d'autres conteneurs, augmenter la mémoire (Settings → Resources) ou arrêter les autres stacks.

Chaque étape enregistre son résultat : une relance après échec reprend là où le traitement s'est arrêté.

## Développement local

```bash
cp .env.example .env   # puis renseigner BETTER_AUTH_SECRET
docker compose up -d mongodb mongodb-init redis storage storage-init worker
npm install
npm run dev
```

Avec la base MongoDB de docker compose, utiliser `DATABASE_URL="mongodb://localhost:27017/app?replicaSet=rs0&directConnection=true"` pour l'app lancée hors Docker. L'app et le worker doivent pointer vers la même base.

Tout lancer dans Docker : `docker compose up -d --build`.
