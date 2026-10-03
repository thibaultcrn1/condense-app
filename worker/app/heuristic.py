"""Free highlight detection from signals alone, no LLM.

Groups blocks into sequences at natural pauses, scores each one from chat
reactions, audio intensity and excitement in what's said, and ranks them
within the stream. Titles are the most telling line of each sequence."""

import re

import numpy as np

from .blocks import Block, Sequence

_MIN_SEQUENCE = 25.0
_MAX_SEQUENCE = 150.0
_PAUSE_BREAK = 2.5

EXCITEMENT = re.compile(
    r"\b(ha(ha)+|mdr+|ptdr+|putain|oh+ (non|la|mon dieu|putain)|non non non|let'?s go|"
    r"incroyable|c'?est pas possible|j'?y crois pas|wesh|gg|wow+|"
    r"t'?es sérieux|mais (non|quoi)|quoi ?!|trop fort|énorme|dingue|ouf)\b|!",
    re.IGNORECASE,
)
_LAUGHTER = re.compile(r"\b(ha(ha)+|mdr+|ptdr+|je suis mort|jpp|lol)\b", re.IGNORECASE)
_DEAD_TIME = re.compile(
    r"\b(je reviens|petite pause|pause (pipi|clope|café)|je vais (aux toilettes|manger|chercher)|"
    r"brb|deux (petites )?minutes|le temps que (ça|ca) charge|(ça|ca) charge|écran de chargement|"
    r"on attend|j'?attends|attends,? (deux|2) secondes|faut que je (règle|fasse|mette))\b",
    re.IGNORECASE,
)
# Reading out subs, donations and raids: nice for the community, rarely
# worth a place in an edited video.
_THANKS = re.compile(
    r"\bmerci\b.{0,40}\b(\d+ mois|sub|abonnement|follow|bits|dons?|raid|tip)\b"
    # "X a mis 70 mois": resub announcements, even without a "merci".
    r"|\b\d+ mois\b",
    re.IGNORECASE,
)


def _group(blocks: list[Block]) -> list[list[Block]]:
    groups: list[list[Block]] = []
    current: list[Block] = []
    for block in blocks:
        if current:
            length = current[-1].end - current[0].start
            gap = block.start - current[-1].end
            kind_change = block.is_speech != current[-1].is_speech
            if (
                length >= _MAX_SEQUENCE
                or (length >= _MIN_SEQUENCE and (gap >= _PAUSE_BREAK or kind_change))
            ):
                groups.append(current)
                current = []
        current.append(block)
    if current:
        # A short tail joins the previous sequence.
        if groups and current[-1].end - current[0].start < _MIN_SEQUENCE / 2:
            groups[-1].extend(current)
        else:
            groups.append(current)
    return groups


def _zscore(values: np.ndarray) -> np.ndarray:
    std = values.std()
    return (values - values.mean()) / std if std > 1e-6 else np.zeros_like(values)


def title(group: list[Block]) -> str:
    """The line that best sums up the moment: the most excited sentence, or
    the one spoken at the peak of chat/audio activity."""
    speech = [b for b in group if b.is_speech]
    if not speech:
        return "Séquence sans parole"
    sentences = [
        s.strip()
        for b in speech
        for s in re.split(r"(?<=[.!?…])\s+", b.text)
        if 3 <= len(s.split()) <= 18
    ]
    if sentences:
        best = max(sentences, key=lambda s: (len(EXCITEMENT.findall(s)), -abs(len(s.split()) - 8)))
    else:
        peak = max(speech, key=lambda b: b.reactions + b.loudness)
        best = " ".join(peak.text.split()[:12])
    best = best.strip(" .,")
    if len(best) > 70:
        best = best[:68].rsplit(" ", 1)[0] + "…"
    return f"« {best[:1].upper()}{best[1:]} »"


def analyze(blocks: list[Block], has_chat: bool) -> list[Sequence]:
    groups = _group(blocks)

    reactions, chat, loud, excite, density, silent, dead, thanks = ([] for _ in range(8))
    for group in groups:
        length = max(group[-1].end - group[0].start, 1.0)
        text = " ".join(b.text for b in group)
        speech_time = sum(b.end - b.start for b in group if b.is_speech)
        reactions.append(max(b.reactions for b in group))
        chat.append(max(b.chat for b in group))
        loud.append(max(b.loudness for b in group))
        excite.append(len(EXCITEMENT.findall(text)) / length * 60)
        density.append(len(text.split()) / length)
        silent.append(1 - speech_time / length)
        dead.append(bool(_DEAD_TIME.search(text)))
        # Share of the sequence's sentences that are thank-yous.
        sentences = [x for x in re.split(r"(?<=[.!?…])\s+", text) if x.strip()]
        thanks.append(sum(bool(_THANKS.search(x)) for x in sentences) / max(len(sentences), 1))

    reactions_a = np.clip(np.array(reactions), -1, 6)
    chat_a = np.clip(np.array(chat), -1, 6)
    loud_a = np.clip(np.array(loud), -2, 4)
    raw = (
        0.25 * _zscore(loud_a)
        + 0.25 * _zscore(np.array(excite))
        + 0.1 * _zscore(np.array(density))
    )
    if has_chat:
        raw += 0.3 * _zscore(reactions_a) + 0.1 * _zscore(chat_a)
    else:
        # Without chat, lean on what the streamer does and says.
        raw = raw / 0.6

    # Rank within the stream: a score of 9 means "top 10% of this stream".
    ranks = raw.argsort().argsort()
    scores = 10 * (ranks + 0.5) / len(raw)

    sequences = []
    for i, group in enumerate(groups):
        length = group[-1].end - group[0].start
        quiet = loud_a[i] < 0 and reactions_a[i] < 0.5
        is_dead = (dead[i] and raw[i] < 0.5) or (silent[i] > 0.8 and quiet)
        is_thanks = thanks[i] >= 0.5
        score = min(scores[i], 1.0) if is_dead else min(scores[i], 3.0) if is_thanks else scores[i]
        text = " ".join(b.text for b in group if b.is_speech)

        if is_dead:
            category = "temps_mort"
        elif is_thanks:
            category = "interaction_chat"
        elif _LAUGHTER.search(text) or (has_chat and reactions_a[i] > 2 and excite[i] > 2):
            category = "humour"
        elif has_chat and reactions_a[i] > 2:
            category = "reaction"
        elif silent[i] > 0.6:
            category = "action" if loud_a[i] > 1 else "gameplay"
        elif excite[i] > 3:
            category = "reaction"
        else:
            category = "discussion"

        summary = text[:157].rsplit(" ", 1)[0] + "…" if len(text) > 160 else text
        sequences.append(
            Sequence(
                first_block=group[0].id,
                last_block=group[-1].id,
                title=title(group),
                summary=summary or "Pas de parole.",
                category=category,
                score=round(float(score), 1),
                standalone=20 <= length <= 180,
            )
        )
    return sequences
