import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { join } from 'path'
import { app } from 'electron'
import { db } from './database-connection'

export function initializeDatabase(): void {
  const migrationsFolder = join(
    app.getAppPath(),
    'drizzle'
  )

  migrate(db, {
    migrationsFolder
  })

  console.log('Database initialized successfully')
}