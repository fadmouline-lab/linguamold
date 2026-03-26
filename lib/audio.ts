import { Audio } from 'expo-av';

let current: Audio.Sound | null = null;

export async function stopAudio(): Promise<void> {
  try {
    if (current) {
      await current.stopAsync();
      await current.unloadAsync();
      current = null;
    }
  } catch {
    current = null;
  }
}

export async function playAudio(uri: string): Promise<void> {
  await stopAudio();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true }
  );
  current = sound;
}

export async function preloadAudio(uri: string): Promise<Audio.Sound> {
  const { sound } = await Audio.Sound.createAsync({ uri });
  return sound;
}
