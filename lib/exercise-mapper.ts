import type { ExerciseRow } from '@/types/index';
import type { MoldExercise } from '@/types/molds';

export function toMoldExercise(row: ExerciseRow): MoldExercise {
  const c = row.content;
  const content =
    c && typeof c === 'object' && !Array.isArray(c)
      ? (c as Record<string, unknown>)
      : {};
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
