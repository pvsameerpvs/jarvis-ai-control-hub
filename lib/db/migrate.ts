import fs from 'fs'
import path from 'path'
import { getDatabase } from './connection'

function migrate(): void {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  const db = getDatabase()

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const stmt of statements) {
    db.exec(stmt + ';')
  }

  console.log('Migration completed successfully.')
}

migrate()
