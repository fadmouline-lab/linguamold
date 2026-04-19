# Prompt: Generate Audio Manifest CSV

Copy this prompt, paste your exercise SQL below the divider, then send to Claude or GPT-4.

---

## YOUR INPUTS

Paste your exercise SQL (INSERT statements for the `exercises` table) below:

```
{{PASTE_EXERCISE_SQL_HERE}}
```

---

## PROMPT START — paste everything below this line

You are extracting audio text from LinguaMold exercise SQL. Your output is a CSV file ready to feed into ElevenLabs batch generation.

**Rules:**
1. Extract every piece of text that needs audio — one row per audio file
2. Text must be in the **learning language (LL) = English** (the language being learned)
3. Skip text in French (the app language) — audio is only needed for LL content
4. `filename` must be a safe filesystem path: lowercase, hyphens only, `.mp3` extension, max 60 chars
5. `voice_gender` must be either `male` or `female` — use `female` as default; use `male` for contrast in dialogues
6. Deduplicate: if the same text appears multiple times, output only one row (use the first filename seen)
7. Do NOT include `null` audio_url entries that have no associated text

**Which fields to extract audio from, by mold type:**

| Mold type | Field(s) to extract |
|-----------|-------------------|
| `fill_in_the_blank` | `sentence_ll` (the full sentence with blank filled by correct option) |
| `translate_sentence` | `accepted_answers_ll[0]` (first accepted answer) |
| `word_reorder` | `correct_sentence_ll` |
| `listen_and_choose` | Each `options[].text_ll` where `is_correct = true` |
| `speak_the_word` | `word_ll` |
| `match_pairs` | Each `pairs[].ll` |
| `image_select` | Each `options[].label_ll` |
| `conversation_listen` | `transcript_ll` (the full dialogue) |
| `select_correct_verb` | `sentence_ll` (with blank filled by correct option) |
| `flashcard` | `word_ll` and `example_ll` (two rows) |
| `type_what_you_hear` | `accepted_answers[0]` |
| `true_or_false` | `statement_ll` |

**Output format — CSV with header:**
```
text,filename,voice_gender
"Hello","hello.mp3","female"
"My name is Marie","my-name-is-marie.mp3","female"
```

**Filename rules:**
- Derived from text: lowercase, spaces→hyphens, remove punctuation except hyphens
- Max 60 characters before `.mp3`
- If two different texts would produce the same filename, append `-2`, `-3` etc.
- For dialogue transcripts (`conversation_listen`), prefix filename with `dialogue-`
- For examples (`flashcard`), prefix with `example-`

Now process the SQL I provided and output ONLY the CSV — no prose, no code fences, no explanations.
