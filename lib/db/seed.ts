import { getDatabase } from './connection'

const defaultSettings: Record<string, string> = {
  assistant_name: 'Xena',
  voice_enabled: 'true',
  voice_input_device: 'default',
  voice_output_device: 'default',
  language: 'en-US',
  wake_word: 'xena',
  stt_engine: 'whisper',
  tts_engine: 'edge',
  llm_model: 'gemini-2.0-flash',
  llm_temperature: '0.7',
  llm_max_tokens: '4096',
  vision_enabled: 'true',
  vision_capture_interval_ms: '5000',
  browser_automation: 'true',
  gmail_integration: 'false',
  telegram_integration: 'false',
  theme: 'dark',
  ui_scale: '100',
  log_level: 'info',
  max_log_entries: '1000',
  auto_start: 'false',
  system_commands_enabled: 'true',
  terminal_emulator: 'gnome-terminal',
  code_editor: 'code',
}

function seed(): void {
  const db = getDatabase()

  const upsert = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (@key, @value)
    ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = CURRENT_TIMESTAMP
  `)

  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(defaultSettings)) {
      upsert.run({ key, value })
    }
  })

  tx()
  console.log('Seed completed successfully. Default settings inserted.')
}

seed()
