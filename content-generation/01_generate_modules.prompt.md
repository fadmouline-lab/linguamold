# Prompt: Generate Module Exercises (INSERT-ready SQL)

Copy this entire prompt, fill in the placeholders marked `{{...}}`, then paste into Claude or GPT-4.

---

## YOUR INPUTS (fill these in before pasting)

- **Module name:** {{MODULE_NAME}}  _(e.g. "Greetings & Farewells")_
- **Difficulty level:** {{DIFFICULTY}}  _(0=beginner, 1=easy, 2=medium, 3=hard, 4=advanced)_
- **Topics list:** {{TOPICS}}  _(e.g. "bonjour, au revoir, bonsoir, merci, s'il vous plaît, de rien")_
- **Target language (LL):** English  _(the language being learned)_
- **App language (AL):** French  _(the language of instruction)_
- **Number of lessons:** {{NUM_LESSONS}}  _(typically 3–5)_
- **Exercises per lesson:** {{NUM_EXERCISES}}  _(typically 8–12)_

---

## PROMPT START — paste everything below this line

You are generating exercise content for LinguaMold, a language learning app. Your output must be valid PostgreSQL `INSERT` statements using JSONB.

**Context:**
- App language (AL) = French (the language all instructions are in)
- Learning language (LL) = English (the language being taught)
- Module: {{MODULE_NAME}}
- Difficulty: {{DIFFICULTY}} (0=beginner through 4=advanced)
- Topics: {{TOPICS}}
- Generate {{NUM_LESSONS}} lessons × {{NUM_EXERCISES}} exercises each

**CRITICAL RULES:**
1. Every exercise must have complete, valid JSONB — no null required fields, no placeholders
2. Use a mix of at least 6 different mold types per lesson
3. `audio_url_ll` fields should always be `null` (audio added separately via ElevenLabs)
4. All `sentence_al`, `prompt_al`, `translation_al` etc. must be in **French**
5. All `sentence_ll`, `word_ll`, `correct_sentence_ll` etc. must be in **English**
6. Output only valid SQL — no prose, no explanations, no markdown code fences

---

## THE 12 MOLD TYPES AND THEIR JSONB SCHEMAS

### 1. fill_in_the_blank
```json
{
  "mold_type": "fill_in_the_blank",
  "sentence_al": "STRING — French sentence with ___ for the blank",
  "sentence_ll": "STRING — English version with ___ for the blank",
  "blank_position": 1,
  "options": [
    {"text": "STRING — wrong option", "is_correct": false},
    {"text": "STRING — correct option", "is_correct": true},
    {"text": "STRING — wrong option", "is_correct": false}
  ],
  "error_explanation_al": "STRING — brief French explanation",
  "audio_url_ll": null
}
```

### 2. translate_sentence
```json
{
  "mold_type": "translate_sentence",
  "prompt_al": "STRING — French sentence to translate to English",
  "accepted_answers_ll": ["STRING — primary answer", "STRING — alternate spelling/punctuation"],
  "hint_al": "STRING — optional French hint",
  "audio_url_ll": null
}
```

### 3. word_reorder
```json
{
  "mold_type": "word_reorder",
  "prompt_al": "STRING — French instruction (e.g. 'Remettez les mots dans l'ordre')",
  "scrambled_words_ll": ["word1", "word2", "word3", "word4"],
  "correct_order": [2, 0, 3, 1],
  "correct_sentence_ll": "STRING — full correct English sentence",
  "audio_url_ll": null
}
```
Note: `correct_order` is an array of indices into `scrambled_words_ll` that form the correct sentence.

### 4. listen_and_choose
```json
{
  "mold_type": "listen_and_choose",
  "prompt_al": "STRING — French instruction (e.g. 'Choisissez la bonne traduction')",
  "audio_url_ll": null,
  "options": [
    {"text_ll": "STRING — English option", "text_al": "STRING — French translation of option", "is_correct": true},
    {"text_ll": "STRING — English option", "text_al": "STRING — French translation", "is_correct": false},
    {"text_ll": "STRING — English option", "text_al": "STRING — French translation", "is_correct": false}
  ]
}
```

### 5. speak_the_word
```json
{
  "mold_type": "speak_the_word",
  "word_ll": "STRING — English word to pronounce",
  "phonetic_ll": "STRING — IPA phonetic (e.g. /həˈloʊ/)",
  "translation_al": "STRING — French translation",
  "audio_url_ll": null,
  "self_assess": true
}
```

### 6. match_pairs
```json
{
  "mold_type": "match_pairs",
  "prompt_al": "STRING — French instruction (e.g. 'Associez chaque mot à sa traduction')",
  "pairs": [
    {"al": "STRING — French word", "ll": "STRING — English word"},
    {"al": "STRING — French word", "ll": "STRING — English word"},
    {"al": "STRING — French word", "ll": "STRING — English word"},
    {"al": "STRING — French word", "ll": "STRING — English word"}
  ]
}
```

### 7. image_select
```json
{
  "mold_type": "image_select",
  "prompt_al": "STRING — French instruction (e.g. 'Choisissez l'image qui correspond')",
  "audio_url_ll": null,
  "options": [
    {"image_url": null, "label_ll": "STRING — English label", "is_correct": true},
    {"image_url": null, "label_ll": "STRING — English label", "is_correct": false},
    {"image_url": null, "label_ll": "STRING — English label", "is_correct": false}
  ]
}
```

### 8. conversation_listen
```json
{
  "mold_type": "conversation_listen",
  "audio_url_ll": null,
  "transcript_ll": "STRING — English dialogue (e.g. 'A: Hello! B: Hi, how are you?')",
  "transcript_al": "STRING — French translation of dialogue",
  "question_al": "STRING — French comprehension question",
  "options": [
    {"text_al": "STRING — French answer option", "is_correct": true},
    {"text_al": "STRING — French answer option", "is_correct": false},
    {"text_al": "STRING — French answer option", "is_correct": false}
  ]
}
```

### 9. select_correct_verb
```json
{
  "mold_type": "select_correct_verb",
  "sentence_ll": "STRING — English sentence with ___ for the verb blank",
  "translation_al": "STRING — French translation of the sentence",
  "options": [
    {"text": "STRING — wrong verb form", "is_correct": false},
    {"text": "STRING — correct verb form", "is_correct": true},
    {"text": "STRING — wrong verb form", "is_correct": false}
  ],
  "grammar_hint_al": "STRING — optional French grammar hint"
}
```

### 10. flashcard
```json
{
  "mold_type": "flashcard",
  "word_ll": "STRING — English word",
  "pronunciation_ll": "STRING — IPA phonetic",
  "translation_al": "STRING — French translation",
  "example_ll": "STRING — English example sentence",
  "example_al": "STRING — French translation of example",
  "audio_url_ll": null
}
```

### 11. type_what_you_hear
```json
{
  "mold_type": "type_what_you_hear",
  "audio_url_ll": null,
  "accepted_answers": ["STRING — primary answer", "STRING — alternate capitalization or punctuation"],
  "hint_al": "STRING — optional French hint"
}
```

### 12. true_or_false
```json
{
  "mold_type": "true_or_false",
  "statement_ll": "STRING — English phrase or sentence",
  "proposed_translation_al": "STRING — proposed French translation (may be wrong)",
  "is_translation_correct": true,
  "explanation_al": "STRING — French explanation of why it is true or false"
}
```

---

## OUTPUT FORMAT

Generate the SQL below. Use `gen_random_uuid()` for IDs. Use a DO block to resolve the module/lesson IDs:

```sql
DO $$
DECLARE
  pair_id uuid;
  mod_id  uuid;
  les_id  uuid;
BEGIN
  SELECT id INTO pair_id FROM public.language_pairs WHERE is_active = true LIMIT 1;

  -- Module
  INSERT INTO public.modules (language_pair_id, slug, title_al, title_ll, description_al, difficulty_level, display_order, is_published, xp_reward)
  VALUES (pair_id, 'MODULE_SLUG', 'TITLE_AL', 'TITLE_LL', 'DESC_AL', DIFFICULTY, DISPLAY_ORDER, true, XP_REWARD)
  ON CONFLICT (language_pair_id, slug) DO NOTHING;
  SELECT id INTO mod_id FROM public.modules WHERE language_pair_id = pair_id AND slug = 'MODULE_SLUG';

  -- Lesson 1
  INSERT INTO public.lessons (module_id, slug, title_al, display_order, lesson_type, is_published, xp_reward)
  VALUES (mod_id, 'LESSON_1_SLUG', 'LESSON_1_TITLE_AL', 1, 'standard', true, 20)
  ON CONFLICT (module_id, slug) DO NOTHING;
  SELECT id INTO les_id FROM public.lessons WHERE module_id = mod_id AND slug = 'LESSON_1_SLUG';

  INSERT INTO public.exercises (lesson_id, mold_type, display_order, content, difficulty, xp_value, is_published)
  VALUES
    (les_id, 'MOLD_TYPE', 1, 'JSONB_CONTENT'::jsonb, DIFFICULTY, 10, true),
    -- ... more exercises
    ;

  -- Repeat pattern for Lesson 2, Lesson 3, etc.
END $$;
```

Generate complete SQL for {{NUM_LESSONS}} lessons × {{NUM_EXERCISES}} exercises each, covering all topics: {{TOPICS}}.
Use a variety of mold types. Every field must be fully filled in. No placeholders in the output.
