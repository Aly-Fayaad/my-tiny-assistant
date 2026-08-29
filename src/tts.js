import TinyTTS from 'tiny-tts';
import path from 'path';
import { app } from 'electron';

let ttsInstance = null;

async function getTTS() {
  if (!ttsInstance) {
    ttsInstance = new TinyTTS();
  }
  return ttsInstance;
}

export async function speak(text, options = {}) {
  const tts = await getTTS();
  const outputPath = path.join(app.getPath('temp'), `tts-${Date.now()}.wav`);

  await tts.speak(text, {
    output: outputPath,
    speaker: options.speaker || 'MALE',
    speed: options.speed || 1.0
  });

  return outputPath;
}