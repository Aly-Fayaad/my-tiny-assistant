import { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function AgentMic({ onCommand }) {
  const [transcript, setTranscript] = useState('');

  const {
    startRecording,
    stopRecording,
    isRecording,
    isTranscribing,
    error,
  } = useSpeechRecognition({
    onTranscribe: (text) => {
      setTranscript(text);
      console.log('Transcribed:', text);
      if (onCommand) {
        onCommand(text);
      }
    },
    onError: (err) => {
      console.error('Speech recognition error:', err);
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
    <div className="mic-controls">
      <button
        onClick={handleClick}
        disabled={isTranscribing}
        className={`mic-btn ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
        title="Click to speak a command"
      >
        {isRecording ? <div className="mic-dot" /> : '🎤'}
        {isRecording
          ? 'Stop & Process'
          : isTranscribing
          ? 'Processing...'
          : 'Voice Command'}
      </button>

      {error && (
        <div className="error-pill">
          ⚠️ {error}
        </div>
      )}

      {transcript && !isRecording && !isTranscribing && !error && (
        <div className="transcript-pill">
          "{transcript}"
        </div>
      )}
    </div>
  );
}