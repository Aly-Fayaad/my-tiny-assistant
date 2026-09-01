import { useState } from 'react';
import { useWhisperSTT } from '../hooks/useWhisperSTT';

export default function AgentMic({ onCommand }) {
  const [transcript, setTranscript] = useState('');

  const {
    startRecording,
    stopRecording,
    isRecording,
    isTranscribing,
    error,
  } = useWhisperSTT({
    onTranscribe: (text) => {
      setTranscript(text);
      console.log('Whisper transcribed:', text);
      if (onCommand) {
        onCommand(text);
      }
    },
    onError: (err) => {
      console.error('Whisper error:', err);
    },
  });

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div style={{ marginTop: '1rem', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <button
        onClick={handleClick}
        disabled={isTranscribing}
        style={{
          padding: '8px 16px',
          cursor: isTranscribing ? 'not-allowed' : 'pointer',
          backgroundColor: isRecording ? '#ff4d4f' : '#1890ff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
        }}
      >
        {isRecording
          ? '🔴 Stop & Transcribe'
          : isTranscribing
          ? '⏳ Transcribing with Whisper...'
          : '🎤 Speak Command'}
      </button>

      {isRecording && (
        <p style={{ color: '#ff4d4f', margin: '0.5rem 0', fontWeight: '500' }}>
          Listening... Click Stop when finished speaking.
        </p>
      )}

      {isTranscribing && (
        <p style={{ color: '#1890ff', margin: '0.5rem 0' }}>
          Sending audio to OpenAI Whisper...
        </p>
      )}

      {error && (
        <p style={{ color: 'red', margin: '0.5rem 0' }}>
          Error: {error}
        </p>
      )}

      {transcript && (
        <p style={{ margin: '0.5rem 0' }}>
          <strong>Last heard:</strong> {transcript}
        </p>
      )}
    </div>
  );
}