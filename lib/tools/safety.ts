const DANGEROUS_SQL_PATTERNS = [
  /DROP\s+TABLE/i,
  /DROP\s+DATABASE/i,
  /DELETE\s+FROM/i,
  /UPDATE\s+.+\s+SET/i,
  /TRUNCATE\s+TABLE/i,
  /ALTER\s+TABLE/i,
  /CREATE\s+TABLE/i,
  /INSERT\s+INTO/i,
  /EXEC\s*\(/i,
  /EXECUTE\s*\(/i,
  /INTO\s+OUTFILE/i,
  /INTO\s+DUMPFILE/i,
  /LOAD\s+DATA/i,
  /--/,
  /;\s*DROP/i,
]

const DANGEROUS_COMMANDS = [
  /^rm\s+(-rf\s+)?\/$/,
  /^rm\s+-rf\s+\//,
  /^dd\s+if=/,
  /^mkfs\./,
  /^fdisk/,
  /^format\s/,
  /^del\s+\/f/i,
  /^rd\s+\/s/i,
  /^shutdown/,
  /^reboot/,
  /^init\s+0/,
  /^init\s+6/,
  /:\(\)\s*\{/,
  /wget\s+.+\|/,
  /curl\s+.+\|/,
  /sudo\s+rm/,
  /chmod\s+-R\s+777/,
  /chown\s+-R/,
  />\s*\/dev\/sda/,
  /\/dev\/null/,
]

const CONFIRMATION_REQUIRED_TOOLS: string[] = []

const FILE_DELETE_TOOLS: string[] = []

const PAYMENT_TOOLS: string[] = []

export function isDangerousSqlQuery(query: string): boolean {
  return DANGEROUS_SQL_PATTERNS.some(pattern => pattern.test(query))
}

export function isDangerousCommand(command: string): boolean {
  return DANGEROUS_COMMANDS.some(pattern => pattern.test(command))
}

export function requiresConfirmation(toolName: string): boolean {
  return CONFIRMATION_REQUIRED_TOOLS.includes(toolName)
}

export function isFileDeleteOperation(toolName: string): boolean {
  return FILE_DELETE_TOOLS.includes(toolName)
}

export function isPaymentOperation(toolName: string): boolean {
  return PAYMENT_TOOLS.includes(toolName)
}
