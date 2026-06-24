import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/lib/utils/logger'
import { getConfig } from '@/lib/utils/config'
import { isDangerousCommand } from '@/lib/tools/safety'

const execAsync = promisify(exec)

function getTerminalEmulator(): string {
  return getConfig('terminal_emulator') || 'gnome-terminal'
}

function getCodeEditor(): string {
  return getConfig('code_editor') || 'code'
}

export async function openVSCode(): Promise<{ success: boolean; message: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'openVSCode called')

  try {
    const editor = getCodeEditor()
    const cwd = process.cwd()

    if (isDangerousCommand(`${editor} .`)) {
      return { success: false, message: 'Security check failed.', error: 'Command flagged by safety check' }
    }

    await execAsync(`"${editor}" "${cwd}"`, {
      timeout: 10000,
    })

    const duration = Date.now() - startTime
    logger.info('system', 'VS Code opened', { durationMs: duration })

    return { success: true, message: 'Visual Studio Code opened successfully.' }
  } catch (error) {
    logger.error('system', 'Failed to open VS Code', { error: String(error) })
    return { success: false, message: 'Failed to open VS Code.', error: String(error) }
  }
}

export async function openProjectFolder(): Promise<{ success: boolean; message: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'openProjectFolder called')

  try {
    const cwd = process.cwd()
    const platform = process.platform

    if (platform === 'darwin') {
      await execAsync(`open "${cwd}"`)
    } else if (platform === 'win32') {
      await execAsync(`explorer "${cwd}"`)
    } else {
      await execAsync(`xdg-open "${cwd}"`)
    }

    const duration = Date.now() - startTime
    logger.info('system', 'Project folder opened', { durationMs: duration })

    return { success: true, message: 'Project folder opened in file manager.' }
  } catch (error) {
    logger.error('system', 'Failed to open project folder', { error: String(error) })
    return { success: false, message: 'Failed to open project folder.', error: String(error) }
  }
}

export async function startLocalServer(): Promise<{ success: boolean; message: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'startLocalServer called')

  try {
    execAsync('npm run dev', {
      timeout: 10000,
      env: { ...process.env },
    }).catch(() => {
      // Server runs in background, errors are expected if it's already running
    })

    const duration = Date.now() - startTime
    logger.info('system', 'Dev server start initiated', { durationMs: duration })

    return { success: true, message: 'Local development server starting on http://localhost:3000' }
  } catch (error) {
    logger.error('system', 'Failed to start server', { error: String(error) })
    return { success: false, message: 'Failed to start local server.', error: String(error) }
  }
}

export async function openTerminal(): Promise<{ success: boolean; message: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'openTerminal called')

  try {
    const terminal = getTerminalEmulator()
    const cwd = process.cwd()

    if (isDangerousCommand(terminal)) {
      return { success: false, message: 'Security check failed.', error: 'Command flagged by safety check' }
    }

    const platform = process.platform
    if (platform === 'win32') {
      await execAsync('start cmd')
    } else if (platform === 'darwin') {
      await execAsync(`open -a Terminal "${cwd}"`)
    } else {
      await execAsync(`${terminal} --working-directory="${cwd}"`, {
        timeout: 10000,
      })
    }

    const duration = Date.now() - startTime
    logger.info('system', 'Terminal opened', { durationMs: duration })

    return { success: true, message: 'Terminal opened successfully.' }
  } catch (error) {
    logger.error('system', 'Failed to open terminal', { error: String(error) })
    return { success: false, message: 'Failed to open terminal.', error: String(error) }
  }
}
