"""
Shared voice routing configuration for AWS Polly audio generation.

Single source of truth — imported by 07_generate_and_upload.py.
"""
from __future__ import annotations

import hashlib
from typing import Optional

# Mold types that have audio playback in the app (AudioPlayer component).
# Exercises with these mold types need audio_url_ll populated.
AUDIO_MOLD_TYPES = frozenset([
    'flashcard',
    'translate_sentence',
    'fill_in_the_blank',
    'word_reorder',
    'listen_and_choose',
    'type_what_you_hear',
    'image_select',
    'speak_the_word',
    'conversation_listen',
])

# Mold types that do NOT play audio (no AudioPlayer in component).
NON_AUDIO_MOLD_TYPES = frozenset([
    'true_or_false',
    'select_correct_verb',
    'match_pairs',
])

# Which content field holds the English text to speak, per mold type.
# The key names match what's actually in the DB content JSONB.
MOLD_TEXT_FIELD = {
    'flashcard':          'back',         # beginner: "back"; later modules also have "word_ll"
    'translate_sentence': 'answer',       # the English answer sentence
    'fill_in_the_blank':  '_composite',   # needs sentence + answer (special handling)
    'word_reorder':       'answer',       # the correct reordered sentence
    'listen_and_choose':  'audio_text',   # dedicated audio_text field
    'type_what_you_hear': 'audio_text',   # dedicated audio_text field
    'image_select':       'audio_text',   # same pattern
    'speak_the_word':     'word_ll',      # the word to pronounce
    'conversation_listen': 'transcript_ll',
}

# Clip type classification: determines which Polly engine tier to use.
MOLD_CLIP_TYPE = {
    'flashcard':           'word',
    'listen_and_choose':   'word',
    'type_what_you_hear':  'word',
    'speak_the_word':      'word',
    'image_select':        'word',
    'translate_sentence':  'sentence',
    'fill_in_the_blank':   'sentence',
    'word_reorder':        'sentence',
    'select_correct_verb': 'sentence',
    'conversation_listen': 'sentence',
}

# Voice options per clip type.
VOICES = {
    'word': {
        'female': {'Engine': 'standard', 'VoiceId': 'Salli'},
        'male':   {'Engine': 'standard', 'VoiceId': 'Justin'},
    },
    'sentence': {
        'female': [
            {'Engine': 'neural', 'VoiceId': 'Emma'},
            {'Engine': 'neural', 'VoiceId': 'Danielle'},
        ],
        'male': {'Engine': 'neural', 'VoiceId': 'Gregory'},
    },
}


def pick_gender(exercise_id: str) -> str:
    """Deterministic gender selection from exercise UUID."""
    h = hashlib.md5(exercise_id.encode()).hexdigest()
    return 'female' if int(h[0], 16) < 8 else 'male'


def pick_voice(clip_type: str, gender: str, exercise_id: str) -> dict:
    """Return {'Engine': ..., 'VoiceId': ...} for the given clip type and gender."""
    tier = VOICES[clip_type]
    voice_option = tier[gender]

    if isinstance(voice_option, list):
        h = hashlib.md5(exercise_id.encode()).hexdigest()
        idx = int(h[1], 16) % len(voice_option)
        return voice_option[idx]

    return voice_option


_FRENCH_INDICATORS = set('éèêëàâùûçïîôœæ')

# French words that distinguish French text from English in this curriculum.
_FRENCH_WORDS = {
    # articles / determiners
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux',
    'ce', 'cette', 'ces',
    # possessives / pronouns
    'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on',
    'moi', 'toi', 'lui',
    # conjunctions / prepositions
    'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui',
    'dans', 'pour', 'avec', 'sur', 'par', 'en', 'se',
    # verbs / common
    'est', 'sont', 'suis', 'sommes', 'ont', 'fait', 'va',
    'pas', 'plus', 'tout', 'bien', 'mal', 'trop', 'ne',
    # colors
    'bleu', 'rouge', 'vert', 'blanc', 'noir', 'gris', 'jaune', 'rose',
    # directions / adjectives
    'rond', 'droit', 'gauche', 'bas', 'haut', 'grand', 'grande',
    'petit', 'petite', 'cher',
    # time
    'heure', 'heures', 'quart', 'demain', 'hier', 'avant', 'matin',
    'soir', 'nuit', 'midi', 'minuit',
    # days
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    # months
    'janvier', 'mars', 'avril', 'mai', 'juin', 'juillet',
    'septembre', 'octobre', 'novembre',
    # weather / nature
    'froid', 'chaud', 'vent', 'brouillard', 'printemps', 'automne',
    # shopping / food
    'fraises', 'chaussures', 'cabine', 'essayage', 'caisse', 'taille',
    'dessert', 'veste', 'robe', 'porte',
}


def _french_score(text: str) -> float:
    """Score how likely text is French. Higher = more likely French."""
    score = 0.0
    lower = text.lower()
    if any(c in _FRENCH_INDICATORS for c in lower):
        score += 3.0
    words = set(lower.replace('-', ' ').replace("'", ' ').split())
    french_hits = words & _FRENCH_WORDS
    score += len(french_hits) * 1.5
    return score


# Cache: module_slug → 'front' or 'back' (whichever is English)
_module_english_field_cache: Dict[str, str] = {}


def detect_module_orientation(exercises: list) -> None:
    """Analyze all flashcards to determine per-module which field is English.

    Call once before processing. Stores results in module cache.
    """
    from collections import defaultdict
    module_scores: Dict[str, Dict[str, float]] = defaultdict(lambda: {'front_french': 0, 'back_french': 0, 'count': 0})

    for ex in exercises:
        if ex.get('mold_type') != 'flashcard':
            continue
        module = ex.get('module_slug', '')
        content = ex.get('content', {})
        if isinstance(content, str):
            import json
            content = json.loads(content)

        front = content.get('front', '')
        back = content.get('back', '')
        if not front or not back:
            continue

        module_scores[module]['front_french'] += _french_score(front)
        module_scores[module]['back_french'] += _french_score(back)
        module_scores[module]['count'] += 1

    for module, scores in module_scores.items():
        if scores['front_french'] > scores['back_french']:
            _module_english_field_cache[module] = 'back'
        else:
            _module_english_field_cache[module] = 'front'


def _pick_english_field(content: dict, module_slug: str = '') -> Optional[str]:
    """For flashcards with only front/back, pick the English field."""
    front = content.get('front', '')
    back = content.get('back', '')

    if not front and not back:
        return None

    # Use cached module orientation if available
    if module_slug and module_slug in _module_english_field_cache:
        return content.get(_module_english_field_cache[module_slug])

    # Fallback: per-exercise French score comparison
    front_score = _french_score(front)
    back_score = _french_score(back)

    if front_score > back_score:
        return back
    if back_score > front_score:
        return front
    return front if front else back


def is_likely_french(text: str) -> bool:
    """Return True if the extracted text appears to be French, not English."""
    lower = text.lower()
    words = set(lower.replace('-', ' ').replace("'", ' ').split())
    word_count = len(words)
    has_accent = any(c in _FRENCH_INDICATORS for c in lower)
    french_hits = words & _FRENCH_WORDS

    # Short text (1-2 words): any French signal is enough
    if word_count <= 2:
        return len(french_hits) >= 1 or has_accent

    # Longer text: require word matches (accents alone might be a proper noun like Châtelet)
    if len(french_hits) >= 2:
        return True
    if has_accent and len(french_hits) >= 1:
        return True

    return False


def extract_text(mold_type: str, content: dict, module_slug: str = '') -> Optional[str]:
    """Extract the English text to speak from exercise content JSONB.
    Returns None if the text appears to be French (skip audio generation)."""
    field = MOLD_TEXT_FIELD.get(mold_type)
    if not field:
        return None

    if field == '_composite':
        sentence = content.get('sentence') or content.get('sentence_ll') or ''
        answer = content.get('answer', '')
        if '___' in sentence and answer:
            text = sentence.replace('___', answer)
        else:
            text = sentence
        if not text or not str(text).strip():
            return None
        return None if is_likely_french(text) else text.strip()

    if mold_type == 'flashcard':
        text = content.get('word_ll')
        if not text:
            text = _pick_english_field(content, module_slug)
        if not text or not str(text).strip():
            return None
        return None if is_likely_french(text) else str(text).strip()

    text = content.get(field)
    if not text or not str(text).strip():
        return None
    return None if is_likely_french(text) else str(text).strip()


def get_engine_tier(voice_config: dict) -> str:
    """Return the engine tier name for usage tracking."""
    return voice_config['Engine']
