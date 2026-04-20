import type { ExerciseRow } from '@/types/index';
import type { MoldExercise } from '@/types/molds';

type AnyContent = Record<string, unknown>;

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/** Normalizes legacy exercise content shapes to the current mold schema. */
function normalizeContent(moldType: string, raw: AnyContent): AnyContent {
  const c = { ...raw };

  switch (moldType) {
    case 'flashcard': {
      // Legacy: { front, back }
      if ('front' in c || 'back' in c) {
        const front = asString(c.front);
        const back = asString(c.back);
        return {
          mold_type: 'flashcard',
          word_ll: asString(c.word_ll, front),
          translation_al: asString(c.translation_al, back),
          example_ll: asString(c.example_ll, ''),
          example_al: asString(c.example_al, ''),
          pronunciation_ll: asString(c.pronunciation_ll, ''),
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
        };
      }
      return c;
    }

    case 'listen_and_choose': {
      // Legacy: { audio_text, options: string[], answer: string }
      const rawOptions = c.options;
      const isLegacyOptions =
        Array.isArray(rawOptions) &&
        rawOptions.length > 0 &&
        typeof rawOptions[0] === 'string';
      if (isLegacyOptions || 'audio_text' in c || 'answer' in c) {
        const answer = asString(c.answer);
        const opts = asStringArray(rawOptions).map((text) => ({
          text_ll: text,
          text_al: text,
          is_correct: text === answer,
        }));
        return {
          mold_type: 'listen_and_choose',
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
          prompt_al: asString(c.prompt_al, ''),
          options: opts.length ? opts : (rawOptions as unknown[]) ?? [],
        };
      }
      return c;
    }

    case 'translate_sentence': {
      // Legacy: { prompt, answer, hint }
      if ('prompt' in c || 'answer' in c || !('accepted_answers_ll' in c)) {
        const acc = Array.isArray(c.accepted_answers_ll)
          ? asStringArray(c.accepted_answers_ll)
          : [];
        const answers =
          acc.length > 0 ? acc : [asString(c.answer)].filter(Boolean);
        return {
          mold_type: 'translate_sentence',
          prompt_al: asString(c.prompt_al, asString(c.prompt)),
          accepted_answers_ll: answers,
          hint_al: asString(c.hint_al, asString(c.hint)),
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
        };
      }
      return c;
    }

    case 'word_reorder': {
      // Legacy: { words, answer }
      const legacyWords = asStringArray(c.words);
      if (
        legacyWords.length > 0 ||
        !Array.isArray(c.scrambled_words_ll) ||
        !Array.isArray(c.correct_order)
      ) {
        const scrambled = Array.isArray(c.scrambled_words_ll)
          ? asStringArray(c.scrambled_words_ll)
          : legacyWords;
        const answer = asString(c.answer);
        const answerWords = answer.split(/\s+/).filter(Boolean);
        const used = new Set<number>();
        const correctOrder: number[] = [];
        for (const w of answerWords) {
          const idx = scrambled.findIndex(
            (s, i) => !used.has(i) && s === w
          );
          if (idx >= 0) {
            used.add(idx);
            correctOrder.push(idx);
          }
        }
        return {
          mold_type: 'word_reorder',
          prompt_al: asString(c.prompt_al, ''),
          scrambled_words_ll: scrambled,
          correct_order:
            correctOrder.length === scrambled.length
              ? correctOrder
              : scrambled.map((_, i) => i),
          correct_sentence_ll: asString(c.correct_sentence_ll, answer),
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
        };
      }
      return c;
    }

    case 'fill_in_the_blank': {
      // Legacy: { sentence, answer, options: string[] }
      const rawOptions = c.options;
      const isLegacyOptions =
        Array.isArray(rawOptions) &&
        rawOptions.length > 0 &&
        typeof rawOptions[0] === 'string';
      if (isLegacyOptions || 'sentence' in c) {
        const sentence = asString(c.sentence_al, asString(c.sentence));
        const sentenceLl = asString(c.sentence_ll, sentence);
        const answer = asString(c.answer);
        const opts = isLegacyOptions
          ? asStringArray(rawOptions).map((text) => ({
              text,
              is_correct: text === answer,
            }))
          : (rawOptions as { text: string; is_correct: boolean }[] | undefined) ??
            [];
        return {
          mold_type: 'fill_in_the_blank',
          sentence_al: sentence,
          sentence_ll: sentenceLl,
          blank_position:
            typeof c.blank_position === 'number' ? c.blank_position : 0,
          options: opts,
          success_message_al: asString(c.success_message_al, ''),
          error_explanation_al: asString(c.error_explanation_al, ''),
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
        };
      }
      return c;
    }

    case 'true_or_false': {
      // Legacy: { statement, answer: bool, explanation }
      if (
        'statement' in c ||
        'explanation' in c ||
        !('statement_ll' in c)
      ) {
        return {
          mold_type: 'true_or_false',
          statement_ll: asString(c.statement_ll, asString(c.statement)),
          proposed_translation_al: asString(c.proposed_translation_al, ''),
          is_translation_correct: asBool(
            c.is_translation_correct,
            asBool(c.answer, true)
          ),
          is_statement_factually_true: asBool(
            c.is_statement_factually_true,
            asBool(c.answer, true)
          ),
          explanation_al: asString(c.explanation_al, asString(c.explanation)),
        };
      }
      return c;
    }

    case 'select_correct_verb': {
      // Legacy: { sentence, answer, options: string[] }
      const rawOptions = c.options;
      const isLegacyOptions =
        Array.isArray(rawOptions) &&
        rawOptions.length > 0 &&
        typeof rawOptions[0] === 'string';
      if (isLegacyOptions || 'sentence' in c) {
        const answer = asString(c.answer);
        const opts = isLegacyOptions
          ? asStringArray(rawOptions).map((text) => ({
              text,
              is_correct: text === answer,
            }))
          : (rawOptions as { text: string; is_correct: boolean }[] | undefined) ??
            [];
        return {
          mold_type: 'select_correct_verb',
          sentence_ll: asString(c.sentence_ll, asString(c.sentence)),
          translation_al: asString(c.translation_al, ''),
          options: opts,
          grammar_hint_al: asString(c.grammar_hint_al, asString(c.hint)),
        };
      }
      return c;
    }

    case 'type_what_you_hear': {
      // Legacy: { audio_text, answer, hint }
      if (!Array.isArray(c.accepted_answers)) {
        const answer = asString(c.answer, asString(c.audio_text));
        return {
          mold_type: 'type_what_you_hear',
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
          accepted_answers: answer ? [answer] : [],
          hint_al: asString(c.hint_al, asString(c.hint)),
        };
      }
      return c;
    }

    case 'speak_the_word': {
      if ('front' in c || !('word_ll' in c)) {
        return {
          mold_type: 'speak_the_word',
          word_ll: asString(c.word_ll, asString(c.front)),
          phonetic_ll: asString(c.phonetic_ll, ''),
          translation_al: asString(c.translation_al, asString(c.back)),
          audio_url_ll: (c.audio_url_ll as string | null | undefined) ?? null,
          self_assess: asBool(c.self_assess, true),
        };
      }
      return c;
    }

    default:
      return c;
  }
}

export function toMoldExercise(row: ExerciseRow): MoldExercise {
  const c = row.content;
  const raw =
    c && typeof c === 'object' && !Array.isArray(c)
      ? (c as AnyContent)
      : {};
  const content = normalizeContent(row.mold_type, raw);
  return {
    id: row.id,
    lesson_id: row.lesson_id,
    mold_type: row.mold_type,
    display_order: row.display_order,
    content,
    difficulty: row.difficulty,
    xp_value: row.xp_value,
    is_published: row.is_published,
  };
}
