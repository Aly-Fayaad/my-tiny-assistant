import Groq from 'groq-sdk';
import os from 'os';
import fs from 'fs';
import path from 'path';

let groqClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in .env file. Get a free key at https://console.groq.com/keys');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Transcribes audio using Groq's free Whisper API.
 * @param {Uint8Array|Buffer} audioBuffer
 * @param {string} mimeType  e.g. 'audio/webm;codecs=opus'
 * @returns {Promise<string>} transcribed text
 */
export async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
  const client = getGroqClient();

  // Write audio buffer to a temp file (Groq needs a real File / ReadStream)
  const ext = mimeType.includes('webm') ? '.webm' : '.wav';
  const tmpPath = path.join(os.tmpdir(), `stt-${Date.now()}${ext}`);
  const buffer = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer);
  fs.writeFileSync(tmpPath, buffer);

  try {
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-large-v3-turbo', // fast & accurate, free tier
      response_format: 'json',
    });

    return transcription.text;
  } finally {
    // Cleanup temp file
    fs.unlink(tmpPath, () => {});
  }
}
