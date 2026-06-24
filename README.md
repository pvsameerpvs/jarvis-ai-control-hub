# XENA — AI Control Hub

A voice-controlled AI assistant with a cyberpunk-themed dashboard, powered by Google Gemini.

## Features

- **Voice Interface** — Real-time speech-to-text via MediaRecorder + Gemini transcription, silence-based VAD
- **Chat Interface** — Terminal-style conversation panel with command history
- **Tool Integrations** — Gmail, Telegram, Browser search, Camera vision, ERP summary
- **MCP Server** — Model Context Protocol servers for modular tool execution
- **HUD Dashboard** — Hacker-themed UI with animated orb, waveform, and status panels
- **Electron Shell** — Desktop wrapper for native integration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS with custom HUD theme
- **Database**: SQLite (via better-sqlite3)
- **Desktop**: Electron

## Getting Started

```bash
# Copy environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Install dependencies
npm install

# Run development server
npm run dev
```

## Project Structure

```
app/              — Next.js App Router pages and API routes
components/       — React components (shared UI + jarvis dashboard)
lib/              — Core logic (AI client, tools, DB, utils)
mcp/              — Model Context Protocol servers
electron/         — Desktop app shell
types/            — TypeScript declarations
```

## Voice Commands

Toggle the microphone and speak naturally. Xena processes speech through Gemini and responds via text-to-speech. Silence detection triggers automatic processing after 1.2 seconds of silence.
