import { useState } from 'react';

export default function CommandInput({ onSubmit }) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <div className="command-input-wrapper">
      <input
        type="text"
        className="command-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Type a command, e.g. "open spotify"'
        autoFocus
      />
      <button className="send-btn" onClick={handleSend} title="Send Command">
        ➔
      </button>
    </div>
  );
}