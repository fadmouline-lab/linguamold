import { Audio } from 'expo-av';

type SoundKey = 'correct' | 'wrong' | 'almost' | 'combo3' | 'combo5' | 'combo10';

const soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};
const ALL_KEYS: SoundKey[] = ['correct', 'wrong', 'almost', 'combo3', 'combo5', 'combo10'];

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function getSoundEnabled(): boolean {
  return soundEnabled;
}

// Preload all sounds eagerly — call at lesson start to warm cache before first answer.
// Target: <50ms perceived gap between visual flash and audio (perceptual simultaneity).
export async function preloadSounds(): Promise<void> {
  await Promise.all(
    ALL_KEYS.map(async (key) => {
      if (soundCache[key]) return;
      try {
        const { sound } = await Audio.Sound.createAsync(getSoundAsset(key));
        soundCache[key] = sound;
      } catch {
        // silent — sound degrades gracefully
      }
    })
  );
}

// Fire-and-forget: no await, no bridge round-trip wait.
// Visual feedback fires simultaneously; audio plays as soon as engine delivers it.
export function playSound(key: SoundKey): void {
  if (!soundEnabled) return;
  void (async () => {
    try {
      const cached = soundCache[key];
      if (cached) {
        await cached.setPositionAsync(0);
        await cached.playAsync();
      } else {
        // Fallback: lazy load on first play if preload was skipped
        const { sound } = await Audio.Sound.createAsync(getSoundAsset(key));
        soundCache[key] = sound;
        await sound.playAsync();
      }
    } catch {
      // silent degradation on load failure
    }
  })();
}

export async function unloadSounds(): Promise<void> {
  for (const key of Object.keys(soundCache) as SoundKey[]) {
    try {
      await soundCache[key]?.unloadAsync();
    } catch {
      // ignore
    }
    delete soundCache[key];
  }
}

function getSoundAsset(_key: SoundKey) {
  // Placeholder: real sound assets will be bundled in assets/sounds/
  return require('@/assets/sounds/placeholder.mp3');
}
