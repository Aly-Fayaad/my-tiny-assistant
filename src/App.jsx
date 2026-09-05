import { useState } from 'react';
import CommandInput from './components/CommandInput';
import AgentMic from './components/AgentMic';
import GuidePanel from './components/GuidePanel';
import { routeCommand } from './handlers/commandRouter.js';
import { speakText } from './utils/speakText.js';

export default function App() {
  const [message, setMessage] = useState("Welcome back. I'm ready to assist with your productivity. What can I do for you?");

  const handleSubmit = async (rawCommandText) => {
    if (!rawCommandText.trim()) return;
    const response = await routeCommand(rawCommandText);
    if (response) {
      speakText(response);
      setMessage(response);
    }
  };

  return (
    <div className="app">
      <div className="main-panel">
        <div className="header">
          <div className="assistant-avatar">
            🤖
          </div>
          <div className="header-label">Tiny Assistant Online</div>
        </div>

        <div className="message-card">
          <div className="message-bubble">
            <p className="message-text">{message}</p>
          </div>
        </div>

        <div className="input-area">
          <CommandInput onSubmit={handleSubmit} />
          <AgentMic onCommand={handleSubmit} />
        </div>
      </div>

      <GuidePanel />
    </div>
  );
}
