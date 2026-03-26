export type MoldType =
  | 'fill_in_the_blank'
  | 'translate_sentence'
  | 'word_reorder'
  | 'listen_and_choose'
  | 'speak_the_word'
  | 'match_pairs'
  | 'image_select'
  | 'conversation_listen'
  | 'select_correct_verb'
  | 'flashcard'
  | 'type_what_you_hear'
  | 'true_or_false';

/** Minimal exercise row passed into mold components */
export interface MoldExercise {
  id: string;
  lesson_id: string;
  mold_type: string;
  display_order: number;
  content: Record<string, unknown>;
  difficulty: number;
  xp_value: number;
  is_published: boolean;
}

export interface MoldProps {
  exercise: MoldExercise;
  onAnswer: (isCorrect: boolean, answer: unknown) => void;
  onNext: () => void;
  isAdminMode?: boolean;
  onContentChange?: (newContent: Record<string, unknown>) => void;
}

export interface FillInTheBlankContent {
  mold_type: 'fill_in_the_blank';
  sentence_al: string;
  sentence_ll: string;
  blank_position: number;
  options: { text: string; is_correct: boolean }[];
  success_message_al?: string;
  error_explanation_al?: string;
  audio_url_ll?: string | null;
}

export interface TranslateSentenceContent {
  mold_type: 'translate_sentence';
  prompt_al: string;
  accepted_answers_ll: string[];
  hint_al?: string;
  audio_url_ll?: string | null;
}

export interface WordReorderContent {
  mold_type: 'word_reorder';
  prompt_al: string;
  scrambled_words_ll: string[];
  correct_order: number[];
  correct_sentence_ll: string;
  audio_url_ll?: string | null;
}

export interface ListenAndChooseContent {
  mold_type: 'listen_and_choose';
  audio_url_ll?: string | null;
  prompt_al: string;
  options: { text_ll: string; text_al: string; is_correct: boolean }[];
}

export interface SpeakTheWordContent {
  mold_type: 'speak_the_word';
  word_ll: string;
  phonetic_ll?: string;
  translation_al: string;
  audio_url_ll?: string | null;
  self_assess?: boolean;
}

export interface MatchPairsContent {
  mold_type: 'match_pairs';
  prompt_al: string;
  pairs: { al: string; ll: string }[];
}

export interface ImageSelectContent {
  mold_type: 'image_select';
  audio_url_ll?: string | null;
  prompt_al: string;
  options: { image_url?: string | null; label_ll?: string; is_correct: boolean }[];
}

export interface ConversationListenContent {
  mold_type: 'conversation_listen';
  audio_url_ll?: string | null;
  transcript_ll: string;
  transcript_al: string;
  question_al: string;
  options: { text_al: string; is_correct: boolean }[];
}

export interface SelectCorrectVerbContent {
  mold_type: 'select_correct_verb';
  sentence_ll: string;
  translation_al: string;
  options: { text: string; is_correct: boolean }[];
  grammar_hint_al?: string;
}

export interface FlashcardContent {
  mold_type: 'flashcard';
  word_ll: string;
  pronunciation_ll?: string;
  translation_al: string;
  example_ll: string;
  example_al: string;
  audio_url_ll?: string | null;
}

export interface TypeWhatYouHearContent {
  mold_type: 'type_what_you_hear';
  audio_url_ll?: string | null;
  accepted_answers: string[];
  hint_al?: string;
}

export interface TrueOrFalseContent {
  mold_type: 'true_or_false';
  statement_ll: string;
  proposed_translation_al: string;
  is_translation_correct: boolean;
  is_statement_factually_true?: boolean;
  explanation_al: string;
}

export type MoldContent =
  | FillInTheBlankContent
  | TranslateSentenceContent
  | WordReorderContent
  | ListenAndChooseContent
  | SpeakTheWordContent
  | MatchPairsContent
  | ImageSelectContent
  | ConversationListenContent
  | SelectCorrectVerbContent
  | FlashcardContent
  | TypeWhatYouHearContent
  | TrueOrFalseContent;

export function isMoldType(value: string): value is MoldType {
  const set: Set<string> = new Set([
    'fill_in_the_blank',
    'translate_sentence',
    'word_reorder',
    'listen_and_choose',
    'speak_the_word',
    'match_pairs',
    'image_select',
    'conversation_listen',
    'select_correct_verb',
    'flashcard',
    'type_what_you_hear',
    'true_or_false',
  ]);
  return set.has(value);
}
