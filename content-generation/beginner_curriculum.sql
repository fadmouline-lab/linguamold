-- =============================================
-- LinguaMold Curriculum: Beginner Content
-- English for French Speakers
-- Modules: Salutations, Les chiffres, Ma famille
-- Updates: shell_module_4, shell_module_5, shell_module_6
-- =============================================

-- =============================================
-- STEP 1: UPDATE shell modules with real content
-- =============================================

UPDATE modules SET
  slug              = 'salutations',
  title_al          = 'Salutations',
  title_ll          = 'Greetings',
  description_al    = 'Apprenez à saluer et à vous présenter en anglais.',
  icon_name         = 'chatbubble',
  color_hex         = '#4CAF50',
  difficulty_level  = 1,
  is_published      = true,
  xp_reward         = 100,
  estimated_minutes = 25
WHERE slug = 'shell_module_4';

UPDATE modules SET
  slug              = 'les_chiffres',
  title_al          = 'Les chiffres',
  title_ll          = 'Numbers 1–20',
  description_al    = 'Apprenez à compter de 1 à 20 en anglais.',
  icon_name         = 'calculator',
  color_hex         = '#2196F3',
  difficulty_level  = 1,
  is_published      = true,
  xp_reward         = 100,
  estimated_minutes = 25
WHERE slug = 'shell_module_5';

UPDATE modules SET
  slug              = 'ma_famille',
  title_al          = 'Ma famille',
  title_ll          = 'My Family',
  description_al    = 'Apprenez le vocabulaire de la famille en anglais.',
  icon_name         = 'people',
  color_hex         = '#FF9800',
  difficulty_level  = 1,
  is_published      = true,
  xp_reward         = 100,
  estimated_minutes = 25
WHERE slug = 'shell_module_6';

-- =============================================
-- STEP 2: INSERT lessons
-- =============================================

-- Salutations lessons
INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'salutations_lesson_1', 'Bonjour et au revoir', 1, true, 50
FROM modules WHERE slug = 'salutations';

INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'salutations_lesson_2', 'S''il vous plaît et merci', 2, true, 50
FROM modules WHERE slug = 'salutations';

INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'salutations_lesson_3', 'Comment ça va ?', 3, true, 50
FROM modules WHERE slug = 'salutations';

-- Les chiffres lessons
INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'les_chiffres_lesson_1', 'Les chiffres 1 à 10', 1, true, 50
FROM modules WHERE slug = 'les_chiffres';

INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'les_chiffres_lesson_2', 'Les chiffres 11 à 20', 2, true, 50
FROM modules WHERE slug = 'les_chiffres';

INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'les_chiffres_lesson_3', 'Utiliser les chiffres', 3, true, 50
FROM modules WHERE slug = 'les_chiffres';

-- Ma famille lessons
INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'ma_famille_lesson_1', 'La famille immédiate', 1, true, 50
FROM modules WHERE slug = 'ma_famille';

INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'ma_famille_lesson_2', 'La famille étendue', 2, true, 50
FROM modules WHERE slug = 'ma_famille';

INSERT INTO lessons (id, module_id, slug, title_al, display_order, is_published, xp_reward)
SELECT gen_random_uuid(), id, 'ma_famille_lesson_3', 'Parler de sa famille', 3, true, 50
FROM modules WHERE slug = 'ma_famille';

-- =============================================
-- STEP 3: INSERT exercises
-- =============================================

-- -------------------------------------------
-- salutations_lesson_1: Bonjour et au revoir
-- Molds: flashcard x3, listen_and_choose, translate_sentence, word_reorder, true_or_false, fill_in_the_blank
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'flashcard', '{"front": "Bonjour", "back": "Hello"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'flashcard', '{"front": "Au revoir", "back": "Goodbye"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'flashcard', '{"front": "Bonsoir", "back": "Good evening"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'listen_and_choose',
  '{"audio_text": "Hello", "options": ["Bonjour", "Au revoir", "Merci", "Bonsoir"], "answer": "Bonjour"}'::jsonb,
  4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'translate_sentence',
  '{"prompt": "Bonjour ! Comment allez-vous ?", "answer": "Hello! How are you?", "hint": "comment = how, allez-vous = are you"}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'word_reorder',
  '{"words": ["Good", "morning", "how", "are", "you"], "answer": "Good morning how are you"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'true_or_false',
  '{"statement": "''Bonsoir'' means ''Good morning'' in English.", "answer": false, "explanation": "''Bonsoir'' means ''Good evening'', not ''Good morning''."}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_1'),
  'fill_in_the_blank',
  '{"sentence": "___ morning! Nice to meet you.", "answer": "Good", "options": ["Good", "Bad", "Old", "Nice"]}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- salutations_lesson_2: S'il vous plaît et merci
-- Molds: flashcard x3, translate_sentence, fill_in_the_blank, word_reorder, listen_and_choose, true_or_false
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'flashcard', '{"front": "S''il vous plaît", "back": "Please"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'flashcard', '{"front": "Merci", "back": "Thank you"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'flashcard', '{"front": "De rien", "back": "You''re welcome"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'translate_sentence',
  '{"prompt": "Merci beaucoup pour votre aide.", "answer": "Thank you very much for your help.", "hint": "beaucoup = very much, aide = help"}'::jsonb,
  4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'fill_in_the_blank',
  '{"sentence": "___, can I have a coffee?", "answer": "Please", "options": ["Please", "Sorry", "Hello", "Yes"]}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'word_reorder',
  '{"words": ["you", "Thank", "very", "much"], "answer": "Thank you very much"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'listen_and_choose',
  '{"audio_text": "You''re welcome", "options": ["De rien", "Merci", "S''il vous plaît", "Excusez-moi"], "answer": "De rien"}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_2'),
  'true_or_false',
  '{"statement": "''Thank you'' and ''Thanks'' have the same meaning but different levels of formality.", "answer": true, "explanation": "''Thank you'' is more formal; ''Thanks'' is casual."}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- salutations_lesson_3: Comment ça va ?
-- Molds: flashcard x3, translate_sentence, select_correct_verb, word_reorder, true_or_false, fill_in_the_blank
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'flashcard', '{"front": "Je vais bien", "back": "I am fine"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'flashcard', '{"front": "Je suis fatigué(e)", "back": "I am tired"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'flashcard', '{"front": "Pas mal", "back": "Not bad"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'translate_sentence',
  '{"prompt": "Comment vous sentez-vous aujourd''hui ?", "answer": "How do you feel today?", "hint": "sentez-vous = do you feel, aujourd''hui = today"}'::jsonb,
  4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'select_correct_verb',
  '{"sentence": "I ___ very well, thank you.", "answer": "am", "options": ["am", "is", "are", "be"]}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'word_reorder',
  '{"words": ["are", "How", "you", "today"], "answer": "How are you today"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'true_or_false',
  '{"statement": "''I am good'' and ''I am well'' are both acceptable responses to ''How are you?''", "answer": true, "explanation": "Both are widely accepted in everyday English."}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'salutations_lesson_3'),
  'fill_in_the_blank',
  '{"sentence": "I''m not feeling well. I am very ___.", "answer": "tired", "options": ["tired", "happy", "hungry", "good"]}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- les_chiffres_lesson_1: Les chiffres 1 à 10
-- Molds: flashcard x4, translate_sentence, word_reorder, listen_and_choose, fill_in_the_blank
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'flashcard', '{"front": "1 — un", "back": "one"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'flashcard', '{"front": "2 — deux / 3 — trois", "back": "two / three"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'flashcard', '{"front": "5 — cinq / 6 — six", "back": "five / six"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'flashcard', '{"front": "8 — huit / 9 — neuf / 10 — dix", "back": "eight / nine / ten"}'::jsonb, 4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'translate_sentence',
  '{"prompt": "J''ai deux chats et trois chiens.", "answer": "I have two cats and three dogs.", "hint": "chats = cats, chiens = dogs"}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'word_reorder',
  '{"words": ["one", "two", "three", "four", "five"], "answer": "one two three four five"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'listen_and_choose',
  '{"audio_text": "seven", "options": ["six", "seven", "eight", "nine"], "answer": "seven"}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_1'),
  'fill_in_the_blank',
  '{"sentence": "I have ___ brothers and one sister.", "answer": "four", "options": ["four", "for", "fore", "far"]}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- les_chiffres_lesson_2: Les chiffres 11 à 20
-- Molds: flashcard x3, true_or_false, word_reorder, listen_and_choose, fill_in_the_blank, translate_sentence
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'flashcard', '{"front": "11 — onze / 12 — douze", "back": "eleven / twelve"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'flashcard', '{"front": "13 — treize / 14 — quatorze / 15 — quinze", "back": "thirteen / fourteen / fifteen"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'flashcard', '{"front": "16 — seize / 17 — dix-sept / 18 — dix-huit / 19 — dix-neuf / 20 — vingt", "back": "sixteen / seventeen / eighteen / nineteen / twenty"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'true_or_false',
  '{"statement": "In English, ''fourteen'' comes before ''thirteen'' when counting.", "answer": false, "explanation": "Correct order: eleven, twelve, thirteen, fourteen..."}'::jsonb,
  4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'word_reorder',
  '{"words": ["eleven", "twelve", "thirteen", "fourteen"], "answer": "eleven twelve thirteen fourteen"}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'listen_and_choose',
  '{"audio_text": "sixteen", "options": ["sixteen", "sixty", "six", "seventeen"], "answer": "sixteen"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'fill_in_the_blank',
  '{"sentence": "She is ___ years old.", "answer": "eighteen", "options": ["eighteen", "eight", "eighty", "eighth"]}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_2'),
  'translate_sentence',
  '{"prompt": "Mon fils a dix-neuf ans.", "answer": "My son is nineteen years old.", "hint": "fils = son, ans = years old"}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- les_chiffres_lesson_3: Utiliser les chiffres
-- Molds: flashcard, translate_sentence, select_correct_verb, word_reorder, fill_in_the_blank, true_or_false, listen_and_choose, type_what_you_hear
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'flashcard', '{"front": "Quel âge avez-vous ?", "back": "How old are you?"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'translate_sentence',
  '{"prompt": "Le train arrive à la voie numéro sept.", "answer": "The train arrives at platform number seven.", "hint": "voie = platform/track, arrive = arrives"}'::jsonb,
  2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'select_correct_verb',
  '{"sentence": "There ___ fifteen students in the class.", "answer": "are", "options": ["are", "is", "be", "am"]}'::jsonb,
  3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'word_reorder',
  '{"words": ["My", "number", "is", "four", "two", "one"], "answer": "My number is four two one"}'::jsonb,
  4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'fill_in_the_blank',
  '{"sentence": "I live on the ___ floor.", "answer": "third", "options": ["third", "three", "thrice", "trio"]}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'true_or_false',
  '{"statement": "In English, you say ''I have twenty year'' without an ''s''.", "answer": false, "explanation": "Correct: ''I am twenty years old'' — years takes an ''s''."}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'listen_and_choose',
  '{"audio_text": "twelve", "options": ["twenty", "twelve", "two", "thirteen"], "answer": "twelve"}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'les_chiffres_lesson_3'),
  'type_what_you_hear',
  '{"audio_text": "fifteen", "answer": "fifteen", "hint": "A number between 14 and 16"}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- ma_famille_lesson_1: La famille immédiate
-- Molds: flashcard x4, translate_sentence, word_reorder, fill_in_the_blank, listen_and_choose
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'flashcard', '{"front": "mère", "back": "mother"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'flashcard', '{"front": "père", "back": "father"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'flashcard', '{"front": "frère", "back": "brother"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'flashcard', '{"front": "sœur", "back": "sister"}'::jsonb, 4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'translate_sentence',
  '{"prompt": "J''ai un frère et deux sœurs.", "answer": "I have one brother and two sisters.", "hint": "frère = brother, sœurs = sisters"}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'word_reorder',
  '{"words": ["My", "mother", "is", "very", "kind"], "answer": "My mother is very kind"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'fill_in_the_blank',
  '{"sentence": "My ___ is 45 years old.", "answer": "father", "options": ["father", "mother", "brother", "sister"]}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_1'),
  'listen_and_choose',
  '{"audio_text": "sister", "options": ["sœur", "frère", "mère", "père"], "answer": "sœur"}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- ma_famille_lesson_2: La famille étendue
-- Molds: flashcard x4, translate_sentence, fill_in_the_blank, true_or_false, word_reorder
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'flashcard', '{"front": "grand-mère", "back": "grandmother"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'flashcard', '{"front": "grand-père", "back": "grandfather"}'::jsonb, 2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'flashcard', '{"front": "oncle", "back": "uncle"}'::jsonb, 3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'flashcard', '{"front": "tante", "back": "aunt"}'::jsonb, 4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'translate_sentence',
  '{"prompt": "Ma grand-mère a soixante-dix ans.", "answer": "My grandmother is seventy years old.", "hint": "grand-mère = grandmother, soixante-dix = seventy"}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'fill_in_the_blank',
  '{"sentence": "My ___ and aunt are coming for dinner.", "answer": "uncle", "options": ["uncle", "brother", "father", "son"]}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'true_or_false',
  '{"statement": "The English word ''cousin'' is the same for both male and female cousins.", "answer": true, "explanation": "In English, ''cousin'' is gender-neutral, unlike in French (cousin/cousine)."}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_2'),
  'word_reorder',
  '{"words": ["My", "grandfather", "is", "a", "doctor"], "answer": "My grandfather is a doctor"}'::jsonb,
  8, true, 10;

-- -------------------------------------------
-- ma_famille_lesson_3: Parler de sa famille
-- Molds: flashcard, translate_sentence x2, select_correct_verb, fill_in_the_blank, word_reorder, true_or_false, listen_and_choose
-- -------------------------------------------
INSERT INTO exercises (id, lesson_id, mold_type, content, display_order, is_published, xp_value)
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'flashcard', '{"front": "fils / fille", "back": "son / daughter"}'::jsonb, 1, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'translate_sentence',
  '{"prompt": "Mon fils s''appelle Thomas.", "answer": "My son''s name is Thomas.", "hint": "fils = son, s''appelle = name is"}'::jsonb,
  2, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'translate_sentence',
  '{"prompt": "Ma fille est très intelligente.", "answer": "My daughter is very intelligent.", "hint": "fille = daughter, intelligente = intelligent"}'::jsonb,
  3, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'select_correct_verb',
  '{"sentence": "My parents ___ very supportive.", "answer": "are", "options": ["are", "is", "am", "be"]}'::jsonb,
  4, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'fill_in_the_blank',
  '{"sentence": "I live with my ___ and my mother.", "answer": "father", "options": ["father", "brother", "uncle", "cousin"]}'::jsonb,
  5, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'word_reorder',
  '{"words": ["She", "is", "my", "younger", "sister"], "answer": "She is my younger sister"}'::jsonb,
  6, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'true_or_false',
  '{"statement": "''Children'' is the plural of ''child''.", "answer": true, "explanation": "''Child'' → ''children'' is an irregular plural in English."}'::jsonb,
  7, true, 10
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM lessons WHERE slug = 'ma_famille_lesson_3'),
  'listen_and_choose',
  '{"audio_text": "My brother", "options": ["Mon frère", "Ma sœur", "Mon père", "Ma mère"], "answer": "Mon frère"}'::jsonb,
  8, true, 10;
