declare module 'gmail-mcp/dist/index.js' {
  import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
  export type Config = { token: string }
  export function createServer(config: Config): McpServer
}
