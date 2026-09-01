import 'dotenv/config';
import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import launchApp from './features/openApp';
import closeApp from './features/closeApp';
import searchAndOpenFile from './features/searchAndOpenFile';
import handleSystemControl from './features/systemControls';
import { speak } from './tts';
import { transcribeAudio } from './stt';
import fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Setup microphone / media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true); // allow mic access
    } else {
      callback(false);
    }
  });

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('tts:speak', async (event, text, options) => {
  const filePath = await speak(text, options);
  const audioBuffer = fs.readFileSync(filePath);
  fs.unlink(filePath, () => {}); // cleanup temp file
  return audioBuffer.toString('base64');
});

ipcMain.handle('stt:transcribe', async (event, audioBuffer, mimeType) => {
  try {
    const text = await transcribeAudio(audioBuffer, mimeType);
    return { success: true, text };
  } catch (error) {
    console.error('STT Transcription error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("open-app", async (event, commandText) => {
  console.log(commandText);
  return launchApp(commandText);
});

ipcMain.handle("close-app", async(event, commandText) =>{
  console.log(commandText);
  return closeApp(commandText);
});

ipcMain.handle("search-and-open", async (event, query, typeFilter) => {
  console.log("Search and open:", { query, typeFilter });
  return searchAndOpenFile(query, typeFilter);
});

ipcMain.handle("system-control", async (event, action, value) => {
  console.log("System control:", { action, value });
  return handleSystemControl(action, value);
});

