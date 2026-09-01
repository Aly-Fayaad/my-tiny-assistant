import OpenAI, { toFile } from 'openai';

let openaiClient = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment or .env file.');
  }
  if (!openaiClient || openaiClient.apiKey !== apiKey) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
  const openai = getOpenAIClient();
  const buffer = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer);
  
  // Convert Node buffer to OpenAI compatible File object
  const file = await toFile(buffer, 'audio.webm', { type: mimeType });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });

  return transcription.text;
}
