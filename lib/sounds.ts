import { Audio } from 'expo-av';

type SoundKey = 'correct' | 'wrong' | 'almost' | 'combo3' | 'combo5' | 'combo10';

const soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function getSoundEnabled() {
  return soundEnabled;
}

// TODO(motion): sound timing must sync with visual feedback (green flash + chime simultaneous)
export async function playSound(key: SoundKey): Promise<void> {
  if (!soundEnabled) return;

  try {
    if (!soundCache[key]) {
      const { sound } = await Audio.Sound.createAsync(getSoundAsset(key));
      soundCache[key] = sound;
    }
    const sound = soundCache[key]!;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Silent graceful degradation on load failure
  }
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
  // For now, return a silent placeholder to avoid crashes
  return require('@/assets/sounds/placeholder.mp3');
}
