import { useState } from 'react';

export default function CommandInput({ onSubmit }) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder='Type a command, e.g. "open google"'
      autoFocus
    />
  );
}