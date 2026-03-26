/** Gamification — defaults; live values may come from app_config */
export const HEARTS_MAX = 5;
export const HEART_REGEN_MS = 4 * 60 * 60 * 1000;
export const XP_CORRECT_ANSWER = 10;
export const XP_COMBO_BONUS = 15;
export const XP_LESSON_COMPLETE = 20;
export const XP_PERFECT_LESSON = 50;
export const XP_MODULE_COMPLETE = 100;
export const STREAK_FREEZE_COST_GEMS = 100;
export const PLACEMENT_EXERCISE_COUNT = 15;
export const PLACEMENT_MIN_EXERCISES = 8;
export const STARTING_GEMS = 500;
export const LEVEL_XP_STEP = 500;
export const SHOP_HEART_REFILL_COST = 50;
export const SHOP_STREAK_FREEZE_COST = 100;
export const SHOP_DOUBLE_XP_COST = 200;

export const MOLD_TYPES = [
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
] as const;

export const STORAGE_BUCKETS = {
  audio: 'audio',
  images: 'images',
} as const;

export const STORAGE_PUBLIC_URL = (
  bucket: string,
  path: string,
  baseUrl: string
): string => {
  const clean = path.replace(/^\/+/, '');
  return `${baseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${clean}`;
};
