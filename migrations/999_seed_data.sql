-- LinguaMold seed: run after 001–018. Idempotent where possible.

-- ── App config ─────────────────────────────────────────────────────────────
INSERT INTO public.app_config (key, value, description)
VALUES
  ('hearts_max', '5', 'max hearts'),
  ('hearts_regen_minutes', '240', 'minutes per heart'),
  ('xp_correct', '10', 'xp per correct'),
  ('xp_combo', '15', 'combo bonus'),
  ('xp_lesson_complete', '20', 'lesson done'),
  ('xp_perfect_lesson', '50', 'perfect lesson'),
  ('xp_module_complete', '100', 'module done'),
  ('streak_freeze_cost', '100', 'gems'),
  ('placement_exercise_count', '15', 'placement length'),
  ('starting_gems', '500', 'new user gems')
ON CONFLICT (key) DO NOTHING;

-- ── Achievements ───────────────────────────────────────────────────────────
INSERT INTO public.achievements (slug, title_key, description_key, icon_name, xp_reward, condition_type, condition_value)
VALUES
  ('first_lesson', 'ach.first_lesson', 'ach.first_lesson_d', 'star', 10, 'total_xp', 1),
  ('streak_7', 'ach.streak_7', 'ach.streak_7_d', 'fire', 20, 'streak_days', 7),
  ('streak_30', 'ach.streak_30', 'ach.streak_30_d', 'fire', 50, 'streak_days', 30),
  ('perfect_lesson', 'ach.perfect', 'ach.perfect_d', 'gem', 15, 'total_xp', 50),
  ('module_master', 'ach.module', 'ach.module_d', 'crown', 40, 'total_xp', 200),
  ('speed_demon', 'ach.speed', 'ach.speed_d', 'bolt', 25, 'total_xp', 100),
  ('xp_1000', 'ach.xp1k', 'ach.xp1k_d', 'xp', 30, 'total_xp', 1000),
  ('polyglot_start', 'ach.poly', 'ach.poly_d', 'globe', 10, 'total_xp', 10)
ON CONFLICT (slug) DO NOTHING;

-- ── UI strings (French) — sample batch; extend in Dashboard as needed ──────
INSERT INTO public.ui_strings (string_key, language_id, value)
SELECT v.k, l.id, v.t
FROM public.languages l
CROSS JOIN (VALUES
  ('ach.first_lesson', 'Première leçon'),
  ('ach.first_lesson_d', 'Terminez votre première leçon'),
  ('ach.streak_7', 'Semaine de feu'),
  ('ach.streak_7_d', '7 jours de suite'),
  ('ach.streak_30', 'Mois de feu'),
  ('ach.streak_30_d', '30 jours de suite'),
  ('ach.perfect', 'Leçon parfaite'),
  ('ach.perfect_d', 'Sans faute'),
  ('ach.module', 'Maître du module'),
  ('ach.module_d', 'Module complété'),
  ('ach.speed', 'Rapide comme l’éclair'),
  ('ach.speed_d', 'Beaucoup d’XP en peu de temps'),
  ('ach.xp1k', '1000 XP'),
  ('ach.xp1k_d', 'Milestone XP'),
  ('ach.poly', 'Polyglotte en herbe'),
  ('ach.poly_d', 'Vous apprenez plusieurs langues'),
  ('notifications.streak_title', 'Rappel série'),
  ('notifications.practice_title', 'Pratique')
) AS v(k, t)
WHERE l.code = 'fr'
ON CONFLICT (string_key, language_id) DO NOTHING;

-- ── Placement module + lesson (exercises: add via Admin or expand below) ────
DO $$
DECLARE
  pair_id uuid;
  mod_id uuid;
  les_id uuid;
BEGIN
  SELECT id INTO pair_id FROM public.language_pairs WHERE is_active = true LIMIT 1;
  IF pair_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.modules (language_pair_id, slug, title_al, title_ll, description_al, difficulty_level, display_order, is_published, xp_reward)
  VALUES (pair_id, 'placement', 'Test de niveau', 'Placement test', 'Évaluation initiale', 0, 0, true, 0)
  ON CONFLICT (language_pair_id, slug) DO NOTHING;

  SELECT id INTO mod_id FROM public.modules WHERE language_pair_id = pair_id AND slug = 'placement';

  IF mod_id IS NOT NULL THEN
    INSERT INTO public.lessons (module_id, slug, title_al, display_order, lesson_type, is_published, xp_reward)
    VALUES (mod_id, 'placement_run', 'Placement', 0, 'placement', true, 0)
    ON CONFLICT (module_id, slug) DO NOTHING;

    SELECT id INTO les_id FROM public.lessons WHERE module_id = mod_id AND slug = 'placement_run';

    IF les_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.exercises WHERE lesson_id = les_id LIMIT 1) THEN
      INSERT INTO public.exercises (lesson_id, mold_type, display_order, content, difficulty, is_published)
      VALUES
        (les_id, 'fill_in_the_blank', 1, '{"mold_type":"fill_in_the_blank","sentence_al":"Bonjour veut dire ___ en anglais.","sentence_ll":"Hello means ___ in English.","blank_position":1,"options":[{"text":"Goodbye","is_correct":false},{"text":"Hello","is_correct":true}],"error_explanation_al":"Bonjour = Hello"}'::jsonb, 1, true),
        (les_id, 'listen_and_choose', 2, '{"mold_type":"listen_and_choose","prompt_al":"Écoutez","audio_url_ll":null,"options":[{"text_ll":"Thank you","text_al":"Merci","is_correct":true},{"text_ll":"Please","text_al":"S il vous plaît","is_correct":false}]}'::jsonb, 2, true),
        (les_id, 'flashcard', 3, '{"mold_type":"flashcard","word_ll":"Family","translation_al":"Famille","example_ll":"My family is here.","example_al":"Ma famille est ici.","pronunciation_ll":"/ˈfæm.ə.li/"}'::jsonb, 2, true);
    END IF;
  END IF;
END $$;

-- ── Module shells 4–30 (unpublished) ──────────────────────────────────────
DO $$
DECLARE
  pair_id uuid;
  i int;
BEGIN
  SELECT id INTO pair_id FROM public.language_pairs WHERE is_active = true LIMIT 1;
  IF pair_id IS NULL THEN RETURN; END IF;
  FOR i IN 4..30 LOOP
    INSERT INTO public.modules (language_pair_id, slug, title_al, title_ll, description_al, difficulty_level, display_order, is_published)
    VALUES (
      pair_id,
      'shell_module_' || i,
      'Module ' || i || ' (à venir)',
      'Module ' || i || ' (coming soon)',
      'Contenu à générer',
      LEAST(5, GREATEST(0, i / 6)),
      i,
      false
    )
    ON CONFLICT (language_pair_id, slug) DO NOTHING;
  END LOOP;
END $$;

-- Note: Full content for hello_goodbye, numbers_1_20, my_family (3×3 lessons × 8–10 exercises)
-- should be bulk-imported or authored in SuperAdmin. This seed establishes schema-linked samples only.

SELECT 1;
