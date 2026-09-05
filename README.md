# My Tiny Assistant

A lightweight, powerful, and visually stunning desktop voice assistant built with Electron and React.

## Features

<img width="777" height="592" alt="image" src="https://github.com/user-attachments/assets/fb0fb63f-6fa4-450a-a153-4de07a543b2e" />


- **Voice Commands**: Control your system using your voice with accurate Speech-to-Text transcription.
- **System Controls**: Adjust volume and screen brightness (e.g., "volume up", "brightness down").
- **App Management**: Launch or force-close applications on your computer (e.g., "open spotify", "close browser").
- **File Search**: Quickly find and open files or folders anywhere on your system (e.g., "search folder documents", "search pdf report").
- **Text-to-Speech**: Hears natural spoken responses using local on-device TTS.

## Technologies Used

- **Electron**: Framework for building the cross-platform desktop app.
- **React**: For building the interactive, responsive user interface.
- **Vite**: Ultra-fast build tool and development server.
- **Groq API**: Used for blazing-fast, free Whisper speech-to-text transcription.
- **Node.js**: Powers the local file search and system command execution (PowerShell/WMI).
- **Vanilla CSS**: Used for crafting the custom premium design system without heavy frameworks.

## Setup Instructions

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Get a free API key from [Groq Console](https://console.groq.com/keys).
4. Create a `.env` file based on `.env.example` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Run `npm start` to launch the application.
