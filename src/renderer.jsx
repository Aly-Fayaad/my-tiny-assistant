import { createRoot } from "react-dom/client";
import CommandInput from "./components/CommandInput";
import { useState } from "react";

const App = () => {
  const [message, setMessage] = useState("Hello! I am your assistant, how can I help you?");

  async function speakText(text) {
  const base64Audio = await window.assistant?.ttsSpeak(text, { speed: 1.0 });
  const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
  audio.play();
}

  const handleSubmit = async (commandText) => {
    console.log("Input command:", commandText);
    let res = "";

    // Send to main process
    if (commandText.startsWith("open ")) {
      const appName = commandText.slice(5).trim();
      const success = await window.assistant?.openApp(appName);
      res = success ? `"${appName}" Opened` : `Could not find or open "${appName}".`;
    } else if (commandText.startsWith("close ")) {
      const appName = commandText.slice(6).trim();
      const success = await window.assistant?.closeApp(appName);
      res = success ? `"${appName}" has Closed ` : `Could not find or close "${appName}".`;
    } else {
      res = `Unknown command. Try "open <app>" or "close <app>"`;
    }

    speakText(res);
    setMessage(res);
  };

  

  return (
    <div>
      <h1>{message}</h1>
      <CommandInput onSubmit={handleSubmit} />
    </div>
  );
};

const container = document.getElementById("root")
const root  = createRoot(container)
root.render(<App/>) 
