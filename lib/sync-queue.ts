import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const QUEUE_KEY = 'linguamold.sync_queue';

export interface QueuedAnswer {
  id: string; // client-side UUID for idempotency
  user_id: string;
  exercise_id: string;
  is_correct: boolean;
  user_answer: unknown;
  time_spent_ms: number;
  xp_earned: number;
  hints_used: number;
  is_skipped: boolean;
  queued_at: string;
}

export async function enqueueAnswer(answer: QueuedAnswer): Promise<void> {
  const queue = await getQueue();
  queue.push(answer);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedAnswer[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedAnswer[];
  } catch {
    return [];
  }
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: QueuedAnswer[] = [];

  for (const item of queue) {
    const { error } = await supabase.from('user_exercise_attempts').upsert(
      {
        id: item.id,
        user_id: item.user_id,
        exercise_id: item.exercise_id,
        is_correct: item.is_correct,
        user_answer: item.user_answer as object,
        time_spent_ms: item.time_spent_ms,
        xp_earned: item.xp_earned,
        hints_used: item.hints_used,
        is_skipped: item.is_skipped,
      },
      { onConflict: 'id' }
    );

    if (error) {
      remaining.push(item);
      failed++;
    } else {
      synced++;
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { synced, failed };
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function hasUnsynced(): Promise<boolean> {
  const queue = await getQueue();
  return queue.length > 0;
}
