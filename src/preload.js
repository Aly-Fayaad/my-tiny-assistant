const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('assistant', {
  openApp: (text) => ipcRenderer.invoke("open-app", text),
  closeApp: (text) => ipcRenderer.invoke("close-app", text),
  ttsSpeak: (text, options) => ipcRenderer.invoke('tts:speak', text, options),
});