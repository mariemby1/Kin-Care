import { ipcMain } from 'electron'

import { paymentService } from './payment.container'
import {
  createPaymentSchema,
  updatePaymentSchema,
  paymentIdSchema,
  patientIdSchema
} from './validators/payment.validator'

export function registerPaymentIpcHandlers(): void {
  const channels = [
    'payments:create',
    'payments:update',
    'payments:get-all',
    'payments:get-by-patient',
    'payments:delete'
  ]

  channels.forEach((channel) => ipcMain.removeHandler(channel))

  ipcMain.handle('payments:create', async (_event, data) => {
    return paymentService.createPayment(createPaymentSchema.parse(data))
  })

  ipcMain.handle('payments:update', async (_event, id: number, data) => {
    return paymentService.updatePayment(
      paymentIdSchema.parse(id),
      updatePaymentSchema.parse(data)
    )
  })

  ipcMain.handle('payments:get-all', async () => {
    return paymentService.getAllPayments()
  })

  ipcMain.handle('payments:get-by-patient', async (_event, patientId: number) => {
    return paymentService.getPatientPayments(patientIdSchema.parse(patientId))
  })

  ipcMain.handle('payments:delete', async (_event, id: number) => {
    return paymentService.deletePayment(paymentIdSchema.parse(id))
  })
}
