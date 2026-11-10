import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

import { patients } from './patients.schema'

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),

  amountCents: integer('amount_cents').notNull(),

  paymentDate: integer('payment_date', { mode: 'timestamp' }).notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})
