import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/lib/utils/logger'
import { getConfig } from '@/lib/utils/config'
import { isDangerousCommand } from '@/lib/tools/safety'

const execAsync = promisify(exec)

export class SystemServer {
  private getTerminalEmulator(): string {
    return getConfig('terminal_emulator') || 'gnome-terminal'
  }

  private getCodeEditor(): string {
    return getConfig('code_editor') || 'code'
  }

  async openVSCode(): Promise<Record<string, unknown>> {
    logger.info('system', 'SystemServer.openVSCode')
    try {
      const editor = this.getCodeEditor()
      const cwd = process.cwd()
      if (isDangerousCommand(`${editor} .`)) {
        return { success: false, message: 'Security check failed.' }
      }
      await execAsync(`"${editor}" "${cwd}"`, { timeout: 10000 })
      return { success: true, message: 'VS Code opened successfully.' }
    } catch (error) {
      return { success: false, message: 'Failed to open VS Code.', error: String(error) }
    }
  }

  async openProjectFolder(): Promise<Record<string, unknown>> {
    logger.info('system', 'SystemServer.openProjectFolder')
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
      return { success: true, message: 'Project folder opened in file manager.' }
    } catch (error) {
      return { success: false, message: 'Failed to open project folder.', error: String(error) }
    }
  }

  async startServer(): Promise<Record<string, unknown>> {
    logger.info('system', 'SystemServer.startServer')
    try {
      execAsync('npm run dev', { timeout: 10000, env: { ...process.env } }).catch(() => {})
      return { success: true, message: 'Dev server starting on http://localhost:3000' }
    } catch (error) {
      return { success: false, message: 'Failed to start server.', error: String(error) }
    }
  }

  async openTerminal(): Promise<Record<string, unknown>> {
    logger.info('system', 'SystemServer.openTerminal')
    try {
      const terminal = this.getTerminalEmulator()
      const cwd = process.cwd()
      if (isDangerousCommand(terminal)) {
        return { success: false, message: 'Security check failed.' }
      }
      const platform = process.platform
      if (platform === 'win32') {
        await execAsync('start cmd')
      } else if (platform === 'darwin') {
        await execAsync(`open -a Terminal "${cwd}"`)
      } else {
        await execAsync(`${terminal} --working-directory="${cwd}"`, { timeout: 10000 })
      }
      return { success: true, message: 'Terminal opened successfully.' }
    } catch (error) {
      return { success: false, message: 'Failed to open terminal.', error: String(error) }
    }
  }
}

export const systemServer = new SystemServer()
