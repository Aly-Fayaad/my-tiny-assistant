import { useRef, useState, useCallback } from 'react';

/**
 * Records audio from the microphone and sends it to the main process
 * for transcription via Groq's free Whisper API.
 *
 * This works reliably in Electron — no Web Speech API network restrictions.
 */
export function useSpeechRecognition({ onTranscribe, onError } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prefer webm/opus; fall back to plain webm
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        // Release mic tracks immediately
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const arrayBuffer = await audioBlob.arrayBuffer();

          const result = await window.assistant?.sttTranscribe(
            new Uint8Array(arrayBuffer),
            mimeType
          );

          if (result?.success) {
            const text = result.text.trim();
            if (text) onTranscribe?.(text);
          } else {
            const errMsg = result?.error || 'Transcription failed.';
            setError(errMsg);
            onError?.(errMsg);
          }
        } catch (err) {
          console.error('STT processing error:', err);
          setError(err.message);
          onError?.(err.message);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      const errMsg =
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied'
          : err.message;
      setError(errMsg);
      onError?.(errMsg);
      setIsRecording(false);
    }
  }, [onTranscribe, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { startRecording, stopRecording, isRecording, isTranscribing, error };
}
