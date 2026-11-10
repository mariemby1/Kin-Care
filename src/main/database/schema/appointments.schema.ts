
import {
  sqliteTable,
  integer,
  text
} from 'drizzle-orm/sqlite-core'

import { patients } from './patients.schema'

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),

  appointmentDate: integer('appointment_date', {
    mode: 'timestamp'
  }).notNull(),

  duration: integer('duration').notNull().default(30),

  treatment: text('treatment').notNull(),

  status: text('status', {
    enum: ['confirmed', 'cancelled']
  }).notNull().default('confirmed'),

  paymentAmountCents: integer('payment_amount_cents'),

  notes: text('notes'),

  createdAt: integer('created_at', {
    mode: 'timestamp'
  }).notNull(),

  updatedAt: integer('updated_at', {
    mode: 'timestamp'
  }).notNull()
})
