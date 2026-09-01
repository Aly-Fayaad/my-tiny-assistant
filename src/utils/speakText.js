/**
 * Converts text to speech using main process TTS service and plays audio.
 * @param {string} text 
 */
export async function speakText(text) {
  if (!text) return;
  try {
    const base64Audio = await window.assistant?.ttsSpeak(text, { speed: 1.0 });
    if (base64Audio) {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.play();
    }
  } catch (err) {
    console.error("TTS play error:", err);
  }
}
