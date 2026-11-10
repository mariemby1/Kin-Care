import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

// Database directory
const databaseDirectory = join(
  app.getPath('userData'),
  'database'
)

mkdirSync(databaseDirectory, { recursive: true })

// Database path
const databasePath = join(
  databaseDirectory,
  'kine-management.db'
)

// SQLite connection
const sqliteConnection = new Database(databasePath)

// SQLite configuration
sqliteConnection.pragma('journal_mode = WAL')
sqliteConnection.pragma('foreign_keys = ON')
sqliteConnection.pragma('busy_timeout = 5000')

// Drizzle ORM instance
export const db = drizzle(sqliteConnection)