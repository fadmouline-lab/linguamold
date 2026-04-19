
**Task: Generate SQL to populate LinguaMold curriculum — 14 modules in one file**

You are writing production SQL for a language learning app (French UI, teaches English). Write SQL only — do not read files or explore any codebase.

**Supabase project:** `jjdqfndcpsxpyydtdlop.supabase.co`
**Language pair ID:** `fc635eb2-1342-4dcb-a725-8940c8958ac1`

---

**Verified table schemas — use exactly these columns, no others:**

```sql
-- MODULES: UPDATE existing shell rows, never INSERT new ones
UPDATE modules SET
  slug              = '',
  title_al          = '',
  title_ll          = '',
  description_al    = '',
  icon_name         = '',      -- Ionicons name e.g. 'briefcase','school','medkit','home','airplane'
  color_hex         = '',      -- hex color e.g. '#3498DB'
  difficulty_level  = 2,       -- 1=beginner, 2=elementary, 3=intermediate
  is_published      = true,
  xp_reward         = 100,
  estimated_minutes = 15
WHERE slug = 'shell_module_XX';

-- LESSONS: no title_ll, no estimated_minutes (those columns do not exist)
INSERT INTO lessons (id, module_id, slug, title_al, display_order, lesson_type, xp_reward, is_published)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM modules WHERE slug = '[module_slug]'),
  '[module_slug]_lesson_1',
  '[French lesson title]',
  1,
  'standard',
  50,
  true
);

-- EXERCISES: column is xp_value — xp_per_correct does not exist
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, difficulty, xp_value, is_published)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM lessons WHERE slug = '[lesson_slug]'),
  'flashcard',
  '{"front": "doctor", "back": "médecin"}'::jsonb,
  1,
  1,
  10,
  true
);
```

---

**Mold types — use at least 5 different types per lesson:**

```
flashcard           {"front": "English word", "back": "French word"}
translate_sentence  {"prompt": "French sentence", "answer": "English translation", "hint": "optional"}
fill_in_the_blank   {"sentence": "I ___ to work", "answer": "go", "options": ["go","eat","sleep","run"]}
word_reorder        {"words": ["I","take","the","bus"], "answer": "I take the bus"}
true_or_false       {"statement": "A 'médecin' is a teacher", "answer": false, "explanation": "A médecin is a doctor"}
listen_and_choose   {"audio_text": "word spoken aloud", "options": ["opt1","opt2","opt3","opt4"], "answer": "correct option"}
select_correct_verb {"sentence": "She ___ to the office", "answer": "goes", "options": ["go","goes","went","going"]}
type_what_you_hear  {"audio_text": "appointment", "answer": "appointment", "hint": "you make one at the doctor"}
```

---

**What to generate — 14 modules, each with 3 lessons of 8 exercises:**

| # | Module (title_al → title_ll) | new slug | UPDATE WHERE slug = | display_order | difficulty_level |
|---|---|---|---|---|---|
| 1 | Décrire les personnes → Describing People | decrire_personnes | shell_module_17 | 15 | 2 |
| 2 | Les émotions et les sentiments → Emotions & Feelings | emotions_sentiments | shell_module_18 | 16 | 2 |
| 3 | La technologie et la communication → Technology & Communication | technologie_communication | shell_module_19 | 17 | 2 |
| 4 | Les professions → Jobs & Professions | les_professions | shell_module_20 | 18 | 2 |
| 5 | Au bureau → At the Office | au_bureau | shell_module_21 | 19 | 2 |
| 6 | À l'école et à l'université → School & University | ecole_universite | shell_module_22 | 20 | 2 |
| 7 | Chez le médecin et à la pharmacie → Doctor & Pharmacy | medecin_pharmacie | shell_module_23 | 21 | 3 |
| 8 | Les démarches administratives → Admin & Paperwork | demarches_administratives | shell_module_24 | 22 | 3 |
| 9 | Banque et finances personnelles → Banking & Personal Finance | banque_finances | shell_module_25 | 23 | 3 |
| 10 | Les transports et les voyages → Transport & Travel | transports_voyages | shell_module_26 | 24 | 3 |
| 11 | Louer un logement → Renting Housing | logement | shell_module_27 | 25 | 3 |
| 12 | La vie sociale et professionnelle → Social & Professional Life | vie_sociale_professionnelle | shell_module_28 | 26 | 3 |
| 13 | La citoyenneté et les droits → Citizenship & Rights | citoyennete_droits | shell_module_29 | 27 | 3 |
| 14 | Révision et conversation libre → Review & Free Conversation | revision_conversation | shell_module_30 | 28 | 3 |

---

**Vocabulary focus per module:**
- **decrire_personnes**: height, hair, eyes, adjectives (tall/short/friendly/serious), describing colleagues and classmates
- **emotions_sentiments**: happy/sad/stressed/proud/nervous/disappointed, expressing how you feel at work or school
- **technologie_communication**: phone calls, emails, passwords, apps, "can you send me the file?", video calls
- **les_professions**: job titles (nurse, engineer, teacher, driver, chef), "what do you do?", describing duties
- **au_bureau**: schedule a meeting, write an email, "the deadline is Friday", office supplies, greeting colleagues
- **ecole_universite**: register for a class, talk to a professor, submit an assignment, grades, the library
- **medecin_pharmacie**: book an appointment, describe symptoms, prescriptions, "I have a headache", emergency phrases
- **demarches_administratives**: fill out a form, show ID, residence permit, "what documents do I need?", waiting rooms
- **banque_finances**: open an account, transfer money, pay a bill, "my card was declined", understanding a bank letter
- **transports_voyages**: buy a train ticket, check in at the airport, hotel check-in, "my flight is delayed", asking for directions
- **logement**: sign a lease, pay rent, report a repair, utilities, talking to a landlord, "the heating is broken"
- **vie_sociale_professionnelle**: networking small talk, accepting/declining invitations, "let's grab coffee", workplace culture
- **citoyennete_droits**: voting, resident rights and responsibilities, community services, "how do I register?", understanding official letters, interacting with police or authorities respectfully
- **revision_conversation**: mixed real-world dialogue scenarios drawing on all previous modules — job interviews, doctor visits, landlord calls, administrative appointments, social situations — no new vocabulary, focus on fluency and confidence in full exchanges

---

**Rules:**
- Output a single `.sql` file — no markdown, no comments, just valid SQL
- Process all 14 modules sequentially in the order listed above
- Every lesson slug must start with its module slug (e.g. `medecin_pharmacie_lesson_1`) — guarantees global uniqueness
- All `is_published = true` on all rows
- Do not touch any module not listed in the table above