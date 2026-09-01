const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('assistant', {
  openApp: (text) => ipcRenderer.invoke("open-app", text),
  closeApp: (text) => ipcRenderer.invoke("close-app", text),
  searchAndOpen: (query, typeFilter) => ipcRenderer.invoke("search-and-open", query, typeFilter),
  systemControl: (action, value) => ipcRenderer.invoke("system-control", action, value),
  ttsSpeak: (text, options) => ipcRenderer.invoke('tts:speak', text, options),
  sttTranscribe: (audioBuffer, mimeType) => ipcRenderer.invoke('stt:transcribe', audioBuffer, mimeType),
});