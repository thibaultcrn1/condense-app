// French dictionary: the reference. Other locales must provide the same keys
// (enforced by the Dictionary type). Placeholders use {name} (see format()).
const fr = {
  meta: {
    tagline: "Vos meilleurs moments de live, montés en quelques clics",
    description:
      "Condensé repère automatiquement les temps forts de vos lives Twitch grâce au chat, à l'audio et à la transcription, puis vous les assemblez en best-of sur une timeline. Gratuit.",
    keywords: [
      "best-of stream",
      "montage live Twitch",
      "temps forts Twitch",
      "rediffusion stream",
      "clips Twitch",
      "montage vidéo streamer",
      "VOD Twitch",
      "transcription vidéo",
    ],
    pages: {
      features: {
        title: "Fonctionnalités",
        description:
          "Détection des temps forts, transcription mot à mot, coupes propres, timeline de montage et export prêt pour YouTube : tout ce que fait Condensé.",
      },
      pricing: {
        title: "Tarifs",
        description: "Condensé est gratuit pendant la bêta, sans carte bancaire. Découvrez ce qui arrive avec l'offre Pro.",
      },
      about: {
        title: "À propos",
        description: "Pourquoi nous construisons Condensé : rendre le montage de best-of accessible à tous les streamers.",
      },
      contact: { title: "Contact", description: "Une question, une idée, un problème ? Écrivez-nous." },
      notice: { title: "Mentions légales", description: "Mentions légales du site Condensé." },
      terms: { title: "Conditions d'utilisation", description: "Conditions générales d'utilisation de Condensé." },
      privacy: {
        title: "Politique de confidentialité",
        description: "Quelles données Condensé collecte, pourquoi, et comment exercer vos droits.",
      },
      cookies: { title: "Cookies", description: "Les cookies et le stockage local utilisés par Condensé." },
      signIn: { title: "Connexion", description: "Connectez-vous à votre compte Condensé." },
      signUp: { title: "Créer un compte", description: "Créez votre compte Condensé gratuitement." },
      forgotPassword: { title: "Mot de passe oublié", description: "Recevez un lien pour réinitialiser votre mot de passe." },
      resetPassword: { title: "Nouveau mot de passe", description: "Choisissez un nouveau mot de passe." },
      dashboard: { title: "Mes projets", description: "" },
      newProject: { title: "Nouveau projet", description: "" },
      settings: { title: "Réglages", description: "" },
    },
  },

  nav: {
    features: "Fonctionnalités",
    pricing: "Tarifs",
    about: "À propos",
    contact: "Contact",
    signIn: "Connexion",
    getStarted: "Commencer gratuitement",
    dashboard: "Mes projets",
    openMenu: "Ouvrir le menu",
    skipToContent: "Aller au contenu",
  },

  footer: {
    tagline: "Le montage de best-of pour les streamers, sans y passer la nuit.",
    product: "Produit",
    company: "Entreprise",
    legal: "Légal",
    rights: "Tous droits réservés.",
  },

  home: {
    hero: {
      badge: "Gratuit pendant la bêta",
      title: "Vos meilleurs moments de live,",
      titleHighlight: "montés en quelques clics",
      subtitle:
        "Importez la rediffusion de votre stream. Condensé repère les temps forts grâce au chat, à l'audio et à ce que vous dites, puis vous les assemblez en best-of sur une vraie timeline.",
      ctaPrimary: "Commencer gratuitement",
      ctaSecondary: "Voir comment ça marche",
      note: "Sans carte bancaire · Fonctionne avec les VOD Twitch et vos fichiers",
    },
    mock: {
      library: "Temps forts détectés",
      timeline: "Montage",
      playing: "Lecture",
      clips: [
        "Le clutch en 1v4",
        "Fou rire avec le chat",
        "La chute la plus absurde",
        "Le boss enfin tombé",
        "Raid surprise",
      ],
    },
    steps: {
      eyebrow: "Comment ça marche",
      title: "D'un live de 10 heures à une vidéo de 15 minutes",
      items: [
        {
          title: "Importez votre live",
          text: "Collez le lien de votre VOD Twitch ou envoyez le fichier, même de plusieurs dizaines de gigaoctets.",
        },
        {
          title: "On repère les temps forts",
          text: "Pics du chat, réactions, montées dans la voix, phrases marquantes : chaque moment fort devient un extrait serré.",
        },
        {
          title: "Vous montez, on exporte",
          text: "Visionnez, ajustez à la seconde près, glissez sur la timeline. L'export est prêt pour YouTube.",
        },
      ],
    },
    features: {
      eyebrow: "Fonctionnalités",
      title: "Tout ce qu'un monteur de best-of ferait, en accéléré",
      items: [
        {
          title: "Détection des temps forts",
          text: "Le chat, l'audio et la transcription sont croisés pour retrouver les moments qui ont fait réagir.",
        },
        {
          title: "Transcription mot à mot",
          text: "Lisez ce qui se dit dans chaque extrait et cliquez sur un mot pour vous y placer.",
        },
        {
          title: "Des coupes propres",
          text: "Les coupes s'aimantent aux pauses : jamais une phrase tronquée au milieu d'un mot.",
        },
        {
          title: "Une vraie timeline",
          text: "Réordonnez vos extraits par glisser-déposer, comme dans votre logiciel de montage.",
        },
        {
          title: "Import Twitch direct",
          text: "Un lien suffit : la VOD et le replay du chat sont récupérés automatiquement.",
        },
        {
          title: "Prêt pour YouTube",
          text: "Volume normalisé, coupes à l'image près et chapitres générés pour la description.",
        },
      ],
    },
    editor: {
      eyebrow: "L'éditeur",
      title: "Gardez la main sur chaque seconde",
      text: "L'automatique fait le gros du travail, vous gardez le dernier mot. Chaque temps fort s'ajuste au dixième de seconde, et le montage se lit d'une traite avant l'export.",
      points: [
        "Début et fin réglables à la poignée, au clavier ou sur un mot de la transcription",
        "Lecture enchaînée de tout le montage, avec tête de lecture",
        "Ordre libre : pas besoin de suivre la chronologie du live",
      ],
    },
    useCases: {
      eyebrow: "Pour qui",
      title: "Pensé pour les streamers et leurs monteurs",
      items: [
        { title: "Best-of de la semaine", text: "Condensez vos lives en une vidéo YouTube régulière." },
        { title: "Let's play en épisodes", text: "Gardez l'histoire, coupez les temps morts." },
        { title: "Clips pour les réseaux", text: "Repérez en quelques minutes les moments à partager." },
      ],
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "Est-ce vraiment gratuit ?",
          a: "Oui. Pendant la bêta, toutes les fonctionnalités sont gratuites, sans carte bancaire. Une offre Pro viendra plus tard avec des options avancées ; l'offre gratuite restera disponible.",
        },
        {
          q: "Quelles vidéos puis-je importer ?",
          a: "Les VOD Twitch publiques (par simple lien) et vos propres fichiers vidéo (MP4, MKV, MOV…). Les lives de plusieurs heures sont pris en charge.",
        },
        {
          q: "Comment sont choisis les temps forts ?",
          a: "Condensé analyse l'activité et les réactions du chat, l'intensité de l'audio et ce qui est dit (transcription). Les moments qui ressortent deviennent des extraits courts, que vous pouvez ajuster.",
        },
        {
          q: "Combien de temps prend l'analyse ?",
          a: "Cela dépend de la durée du live : comptez de quelques minutes à environ une heure pour un live très long. Vous pouvez fermer la page, le traitement continue.",
        },
        {
          q: "Qui possède les vidéos produites ?",
          a: "Vous. Vous restez propriétaire de vos contenus ; nous ne les utilisons que pour produire vos montages.",
        },
        {
          q: "Les VOD réservées aux abonnés fonctionnent-elles ?",
          a: "Pas directement. Rendez la VOD publique le temps de l'import, ou téléchargez-la et envoyez le fichier.",
        },
      ],
    },
    cta: {
      title: "Votre prochain best-of commence ici",
      text: "Importez un live, laissez Condensé trouver les temps forts, exportez votre vidéo.",
      button: "Créer mon compte gratuit",
    },
  },

  featuresPage: {
    eyebrow: "Fonctionnalités",
    title: "Du live brut à la vidéo finale",
    subtitle: "Chaque étape du montage d'un best-of, automatisée là où c'est utile, réglable là où c'est important.",
    sections: [
      {
        title: "Import sans friction",
        text: "Collez un lien de VOD Twitch ou envoyez un fichier. Les gros fichiers sont envoyés directement vers le stockage, par morceaux, avec reprise automatique en cas de coupure.",
        points: ["VOD Twitch publiques et replay du chat", "Fichiers MP4, MKV, MOV, même très lourds", "Suivi de la progression en temps réel"],
      },
      {
        title: "Détection des temps forts",
        text: "Plusieurs signaux sont croisés : pics de messages et réactions du chat, intensité de la voix et du son, expressions marquantes dans la transcription. Les temps morts et les remerciements de subs sont écartés.",
        points: ["Environ un temps fort toutes les six minutes de live", "Extraits resserrés au plus court", "Note et catégorie pour chaque moment"],
      },
      {
        title: "Transcription intégrée",
        text: "Tout ce qui est dit est transcrit avec le temps de chaque mot. Dans l'éditeur, la transcription défile pendant la lecture et sert à couper au bon endroit.",
        points: ["Horodatage au mot", "Cliquez un mot pour vous y placer", "Transcription réalisée sans service tiers"],
      },
      {
        title: "Éditeur et timeline",
        text: "Visionnez chaque temps fort, ajustez son début et sa fin, puis composez votre montage sur une timeline horizontale, dans l'ordre de votre choix.",
        points: ["Coupes aimantées aux pauses entre les mots", "Glisser-déposer et zoom", "Lecture enchaînée du montage"],
      },
      {
        title: "Export prêt à publier",
        text: "Le rendu respecte vos coupes à l'image près, adoucit chaque raccord et normalise le volume au niveau attendu par YouTube.",
        points: ["Volume normalisé à -14 LUFS", "Chapitres YouTube générés", "Téléchargement en MP4"],
      },
    ],
  },

  pricing: {
    eyebrow: "Tarifs",
    title: "Gratuit pendant la bêta",
    subtitle: "Toutes les fonctionnalités, sans carte bancaire. Une offre Pro arrivera pour les créateurs qui veulent aller plus loin.",
    free: {
      name: "Gratuit",
      price: "0 €",
      period: "pour toujours",
      description: "Tout ce qu'il faut pour monter vos best-of.",
      features: [
        "Import de VOD Twitch et de fichiers",
        "Détection automatique des temps forts",
        "Transcription mot à mot",
        "Éditeur avec timeline",
        "Export MP4 prêt pour YouTube",
      ],
      cta: "Commencer gratuitement",
    },
    pro: {
      name: "Pro",
      badge: "Bientôt",
      price: "À venir",
      description: "Pour les créateurs qui publient souvent.",
      features: [
        "Titres et résumés générés par IA",
        "Analyse et transcription accélérées",
        "Export en 1080p60",
        "Stockage de longue durée",
        "Support prioritaire",
      ],
      cta: "Être prévenu",
    },
    faqTitle: "Questions sur les tarifs",
    faq: [
      {
        q: "L'offre gratuite va-t-elle disparaître ?",
        a: "Non. L'offre Pro ajoutera des options ; l'offre gratuite restera disponible.",
      },
      {
        q: "Faut-il une carte bancaire ?",
        a: "Non, ni pour créer un compte ni pour utiliser Condensé pendant la bêta.",
      },
    ],
  },

  about: {
    eyebrow: "À propos",
    title: "Rendre le best-of accessible à tous les streamers",
    paragraphs: [
      "Un live de plusieurs heures contient souvent quelques minutes inoubliables. Les retrouver demande de tout revisionner, puis de couper, d'assembler, d'exporter : des heures de travail que beaucoup de streamers n'ont pas.",
      "Condensé automatise la partie fastidieuse — repérer les temps forts, les découper proprement, préparer l'export — et vous laisse la partie créative : choisir, ordonner, raconter.",
      "Le produit est en bêta et évolue vite. Vos retours décident de la suite : écrivez-nous.",
    ],
  },

  contact: {
    eyebrow: "Contact",
    title: "Parlons-en",
    subtitle: "Une question, une idée de fonctionnalité, un bug ? Nous lisons tous les messages.",
    emailLabel: "Écrivez-nous",
    responseTime: "Nous répondons généralement sous 48 heures ouvrées.",
    topics: [
      { title: "Support", text: "Un import bloqué, une erreur ? Indiquez le nom du projet et ce que vous avez fait." },
      { title: "Idées", text: "Dites-nous ce qui vous ferait gagner du temps sur vos montages." },
      { title: "Données personnelles", text: "Pour exercer vos droits (accès, suppression…), écrivez-nous depuis l'adresse de votre compte." },
    ],
  },

  legal: {
    updated: "Dernière mise à jour : {date}",
    notice: {
      title: "Mentions légales",
      sections: [
        {
          title: "Éditeur du site",
          body: [
            "Le site {site} est édité par {company}, {address}, immatriculée sous le numéro {registration}.",
            "Directeur de la publication : {director}. Contact : {email}.",
          ],
        },
        { title: "Hébergement", body: ["{host}"] },
        {
          title: "Propriété intellectuelle",
          body: [
            "Les éléments du site (marque, textes, interface) sont protégés. Les vidéos importées par les utilisateurs restent leur propriété.",
          ],
        },
      ],
    },
    terms: {
      title: "Conditions générales d'utilisation",
      sections: [
        {
          title: "Objet",
          body: [
            "Les présentes conditions régissent l'utilisation de {site}, un service qui analyse des vidéos de lives pour en extraire des temps forts et produire des montages.",
          ],
        },
        {
          title: "Compte",
          body: [
            "La création d'un compte est nécessaire pour utiliser le service. Vous êtes responsable de la confidentialité de votre mot de passe et des activités réalisées depuis votre compte.",
          ],
        },
        {
          title: "Vos contenus",
          body: [
            "Vous ne devez importer que des vidéos sur lesquelles vous détenez les droits nécessaires. Vous restez propriétaire de vos contenus et nous accordez uniquement le droit de les traiter pour vous fournir le service.",
            "Les contenus illicites sont interdits. Nous pouvons supprimer tout contenu signalé comme tel.",
          ],
        },
        {
          title: "Disponibilité",
          body: [
            "Le service est fourni en bêta, en l'état. Nous faisons notre possible pour le rendre disponible et fiable, sans pouvoir le garantir. Pensez à télécharger vos exports.",
          ],
        },
        {
          title: "Responsabilité",
          body: [
            "Dans les limites autorisées par la loi, notre responsabilité ne saurait être engagée pour les dommages indirects liés à l'utilisation du service.",
          ],
        },
        {
          title: "Résiliation",
          body: [
            "Vous pouvez supprimer votre compte à tout moment depuis les réglages ; vos projets et fichiers sont alors supprimés.",
          ],
        },
        {
          title: "Droit applicable",
          body: ["Les présentes conditions sont soumises au droit français."],
        },
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      sections: [
        {
          title: "Responsable du traitement",
          body: ["{company}, {address}. Contact : {email}."],
        },
        {
          title: "Données collectées",
          body: [
            "Compte : nom, adresse e-mail, mot de passe (stocké sous forme chiffrée).",
            "Projets : les vidéos que vous importez, leur audio, leur transcription, le replay du chat des VOD Twitch, les temps forts détectés et vos montages.",
            "Technique : adresse IP et navigateur, associés à votre session de connexion.",
          ],
        },
        {
          title: "Finalités",
          body: [
            "Fournir le service (analyse, édition, export), sécuriser votre compte et répondre à vos demandes. Nous n'utilisons pas vos données à des fins publicitaires et ne les vendons pas.",
          ],
        },
        {
          title: "Sous-traitants",
          body: [
            "La transcription et l'analyse sont réalisées sur nos serveurs, sans service tiers. Les fichiers sont conservés chez notre hébergeur : {host}.",
          ],
        },
        {
          title: "Durée de conservation",
          body: [
            "Vos données sont conservées tant que votre compte existe. La suppression d'un projet efface ses fichiers ; la suppression du compte efface l'ensemble de vos données.",
          ],
        },
        {
          title: "Vos droits",
          body: [
            "Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Écrivez à {email}. Vous pouvez aussi saisir la CNIL (cnil.fr).",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies",
      sections: [
        {
          title: "Cookies utilisés",
          body: [
            "Cookie de session : vous garde connecté. Indispensable au service.",
            "Cookie de langue : mémorise la langue que vous avez choisie.",
            "Stockage local du navigateur : mémorise votre thème (clair ou sombre).",
          ],
        },
        {
          title: "Pas de traceurs",
          body: [
            "Nous n'utilisons aucun cookie publicitaire ni de mesure d'audience tierce. Ces cookies étant strictement nécessaires, aucun consentement n'est requis.",
          ],
        },
      ],
    },
  },

  notFound: {
    title: "Page introuvable",
    text: "Cette page n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
  },

  app: {
    common: {
      back: "Retour",
      cancel: "Annuler",
      delete: "Supprimer",
      loading: "Chargement…",
      save: "Enregistrer",
      saved: "Enregistré",
      retry: "Réessayer",
      genericError: "Une erreur est survenue. Réessayez.",
    },
    theme: { label: "Thème", light: "Clair", dark: "Sombre", system: "Système" },
    language: { label: "Langue" },
    account: { settings: "Réglages", signOut: "Se déconnecter", menu: "Compte" },
    auth: {
      name: "Nom",
      namePlaceholder: "Votre pseudo",
      email: "E-mail",
      emailPlaceholder: "vous@exemple.com",
      password: "Mot de passe",
      passwordHint: "8 caractères minimum",
      newPassword: "Nouveau mot de passe",
      signIn: {
        title: "Bon retour",
        description: "Connectez-vous pour retrouver vos projets.",
        submit: "Se connecter",
        forgot: "Mot de passe oublié ?",
        noAccount: "Pas encore de compte ?",
        signUpLink: "Créer un compte",
      },
      signUp: {
        title: "Créer un compte",
        description: "Gratuit, sans carte bancaire.",
        submit: "Créer mon compte",
        hasAccount: "Déjà un compte ?",
        signInLink: "Se connecter",
        terms: "En créant un compte, vous acceptez les {terms} et la {privacy}.",
        termsLink: "conditions d'utilisation",
        privacyLink: "politique de confidentialité",
      },
      forgot: {
        title: "Mot de passe oublié",
        description: "Indiquez votre e-mail, nous vous enverrons un lien de réinitialisation.",
        submit: "Envoyer le lien",
        sent: "Si un compte existe pour cette adresse, un e-mail vient d'être envoyé.",
        back: "Retour à la connexion",
      },
      reset: {
        title: "Nouveau mot de passe",
        description: "Choisissez un nouveau mot de passe pour votre compte.",
        submit: "Changer le mot de passe",
        done: "Mot de passe modifié. Vous pouvez vous connecter.",
        invalidLink: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
      },
      errors: {
        INVALID_EMAIL_OR_PASSWORD: "E-mail ou mot de passe incorrect.",
        USER_ALREADY_EXISTS: "Un compte existe déjà avec cette adresse.",
        USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cette adresse.",
        PASSWORD_TOO_SHORT: "Le mot de passe est trop court (8 caractères minimum).",
        INVALID_PASSWORD: "Mot de passe incorrect.",
        INVALID_TOKEN: "Ce lien est invalide ou a expiré.",
      } as Record<string, string>,
    },
    dashboard: {
      title: "Mes projets",
      greeting: "Bonjour {name}",
      newProject: "Nouveau projet",
      emptyTitle: "Aucun projet pour l'instant",
      emptyText: "Importez la rediffusion d'un live : nous repérons les temps forts, vous composez votre best-of.",
      liveOf: "Live de {duration}",
      highlights: "{count} temps forts",
      importing: "Import en cours",
    },
    newProject: {
      title: "Nouveau projet",
      description: "Importez la rediffusion de votre live : on repère tous les temps forts, vous composez votre montage.",
      tabFile: "Fichier vidéo",
      tabTwitch: "VOD Twitch",
      fileLabel: "Rediffusion (MP4, MKV, MOV…)",
      twitchLabel: "Lien de la VOD",
      twitchHint: "Le replay du chat est aussi récupéré pour repérer les temps forts.",
      titleLabel: "Titre",
      titlePlaceholder: "Best-of du live du 12 mars",
      untitled: "Live sans titre",
      submit: "Lancer",
      creating: "Création…",
      uploading: "Envoi en cours…",
      uploadProgress: "Envoi · {done} / {total}",
      chooseFile: "Choisissez un fichier vidéo.",
      uploadFailed: "L'envoi a échoué.",
    },
    status: {
      PENDING_UPLOAD: "Envoi en attente",
      QUEUED: "En file d'attente",
      INGESTING: "Préparation",
      INGESTED: "Analyse à lancer",
      ANALYZING: "Analyse",
      REVIEW: "Prêt à monter",
      RENDERING: "Export",
      DONE: "Terminé",
      FAILED: "Échec",
    } as Record<string, string>,
    stages: {
      queued: "En file d'attente",
      download_vod: "Téléchargement de la VOD",
      download_chat: "Récupération du chat",
      archive_vod: "Archivage de la vidéo",
      probe: "Analyse du fichier",
      extract_audio: "Extraction de l'audio",
      transcribe: "Transcription du live",
      signals: "Analyse de l'audio et du chat",
      highlights: "Repérage des temps forts",
      thumbnails: "Création des miniatures",
      render: "Montage de la vidéo",
      upload_output: "Finalisation",
      waiting: "En attente d'un serveur…",
    } as Record<string, string>,
    errors: {
      unauthenticated: "Vous devez être connecté.",
      not_found: "Projet introuvable.",
      invalid_request: "Requête invalide.",
      invalid_twitch_url: "Lien de VOD Twitch invalide.",
      file_too_large: "Fichier trop volumineux (100 Go maximum).",
      busy: "Traitement en cours, réessayez une fois terminé.",
      no_upload: "Aucun envoi en cours.",
      not_editable: "Le montage n'est pas modifiable pour le moment.",
      empty_montage: "Ajoutez au moins un temps fort au montage.",
      unknown_highlight: "Temps fort inconnu.",
      duplicate_highlight: "Un temps fort ne peut apparaître qu'une fois dans le montage.",
      invalid_bounds: "Chaque extrait doit durer au moins 1 seconde et rester dans la vidéo.",
      nothing_to_retry: "Rien à relancer.",
      enqueue_failed: "Impossible de lancer le traitement. Réessayez dans quelques instants.",
      unreadable_file: "Fichier vidéo illisible ou format non pris en charge.",
      no_video: "Aucune piste vidéo exploitable dans le fichier.",
      no_audio: "La vidéo n'a pas de piste audio : impossible de détecter les temps forts.",
      no_speech: "Aucune parole détectée dans la vidéo : impossible de repérer les temps forts.",
      vod_sub_only: "Cette VOD est réservée aux abonnés. Rendez-la publique le temps de l'import, ou envoyez le fichier.",
      vod_unavailable: "Impossible de télécharger la VOD. Vérifiez qu'elle est publique et toujours en ligne.",
      disk_space: "Espace disque insuffisant pour importer cette VOD : environ {needed} Go nécessaires, {free} Go disponibles.",
      transcription_unavailable: "La transcription n'est pas disponible pour le moment.",
      analysis_unavailable: "L'analyse n'est pas disponible pour le moment.",
      montage_empty: "Le montage est vide.",
      interrupted: "Le traitement a été interrompu (arrêt du serveur, manque de mémoire ou d'espace disque). Vous pouvez relancer.",
      internal: "Erreur interne pendant le traitement. Réessayez plus tard.",
    } as Record<string, string>,
    project: {
      delete: "Supprimer",
      confirmDelete: "Supprimer ce projet et tous ses fichiers ?",
      deleteFailed: "Suppression impossible.",
      failedTitle: "Le traitement a échoué",
      retry: "Relancer",
      retryFailed: "Relance impossible.",
      legacyTitle: "Vidéo prête",
      legacyText: "Cette vidéo a été importée avant l'analyse automatique.",
      legacyButton: "Lancer l'analyse",
      details: "Détails",
      source: "Source",
      size: "Taille",
      duration: "Durée du live",
      video: "Vidéo",
      chat: "Chat",
      chatOk: "Récupéré",
      chatMissing: "Indisponible",
      file: "Fichier",
      finalVideo: "Vidéo finale",
      download: "Télécharger",
      copyChapters: "Copier les chapitres YouTube",
      chaptersCopied: "Chapitres copiés",
      copyFailed: "Copie impossible",
      editMontage: "Modifier le montage",
    },
    editor: {
      noPreview: "Aperçu indisponible",
      playClip: "Lire l'extrait",
      addToMontage: "Ajouter au montage",
      addAfter: "Ajouter après #{index}",
      removeFromMontage: "Retirer du montage",
      inLive: "à {time} dans le live",
      duration: "Durée : {duration}",
      start: "Début",
      end: "Fin",
      here: "Ici",
      hereTitle: "Placer sur l'image affichée",
      transcript: "Transcription · cliquez un mot pour vous y placer, puis « Ici » pour couper.",
      noSpeech: "Pas de parole sur ce passage.",
      highlightsCount: "{count} temps forts",
      sortChrono: "Ordre du live",
      sortBest: "Meilleurs",
      addAll: "Tout ajouter au montage",
      playMontage: "Lire le montage",
      pause: "Pause",
      clipsCount: "{count} extrait(s)",
      zoomIn: "Zoomer",
      zoomOut: "Dézoomer",
      emptyTimeline: "Glissez des temps forts ici, ou ouvrez-en un et cliquez « Ajouter au montage ».",
      removeClip: "Retirer du montage",
      insertHere: "Les prochains ajouts se placeront ici",
      snap: "Aligner les coupes sur les pauses (ne jamais couper un mot)",
      export: "Exporter la vidéo",
      exporting: "Lancement…",
      exportFailed: "Impossible de lancer l'export.",
      saveFailed: "Modifications non enregistrées.",
    },
    categories: {
      humour: "Humour",
      action: "Action",
      exploit: "Exploit",
      echec: "Échec",
      reaction: "Réaction",
      histoire: "Histoire",
      discussion: "Discussion",
      interaction_chat: "Chat",
      gameplay: "Gameplay",
      temps_mort: "Temps mort",
    } as Record<string, string>,
    settings: {
      title: "Réglages",
      profile: "Profil",
      profileText: "Le nom affiché dans l'application.",
      password: "Mot de passe",
      passwordText: "Changez votre mot de passe. Vos autres sessions seront déconnectées.",
      currentPassword: "Mot de passe actuel",
      changePassword: "Changer le mot de passe",
      passwordChanged: "Mot de passe modifié.",
      preferences: "Préférences",
      preferencesText: "Langue et apparence de l'interface.",
      danger: "Supprimer le compte",
      dangerText: "Supprime définitivement votre compte, vos projets et tous vos fichiers.",
      deleteAccount: "Supprimer mon compte",
      confirmDelete: "Saisissez votre mot de passe pour confirmer la suppression définitive.",
      deleted: "Compte supprimé.",
    },
  },
};

export default fr;
export type Dictionary = typeof fr;
