import { createRoot } from "react-dom/client";
import { useState } from "react";
import CommandInput from "./components/CommandInput";
import AgentMic from "./components/AgentMic";
import { routeCommand } from "./handlers/commandRouter.js";
import { speakText } from "./utils/speakText.js";

const App = () => {
  const [message, setMessage] = useState("Hello! I am your assistant, how can I help you?");

  const handleSubmit = async (rawCommandText) => {
    const response = await routeCommand(rawCommandText);
    if (response) {
      speakText(response);
      setMessage(response);
    }
  };

  return (
    <div>
      <h1>{message}</h1>
      <CommandInput onSubmit={handleSubmit} />
      <AgentMic onCommand={handleSubmit} />
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
