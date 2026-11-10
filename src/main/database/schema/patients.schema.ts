import {
  sqliteTable,
  integer,
  text
} from 'drizzle-orm/sqlite-core'

export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  firstName: text('first_name').notNull(),

  lastName: text('last_name').notNull(),

  phone: text('phone').notNull(),

  notes: text('notes'),

  createdAt: integer('created_at', {
    mode: 'timestamp'
  }).notNull(),

  updatedAt: integer('updated_at', {
    mode: 'timestamp'
  }).notNull()
})