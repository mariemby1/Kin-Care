
import { ipcMain } from 'electron'

import { appointmentService } from './appointment.container'

import {
  createAppointmentSchema,
  updateAppointmentSchema
} from './validators/appointment.validator'

export function registerAppointmentIpcHandlers(): void {
  const channels = [
    'appointments:create',
    'appointments:get-all',
    'appointments:get-today',
    'appointments:get-by-id',
    'appointments:update',
    'appointments:delete'
  ]

  channels.forEach((channel) => ipcMain.removeHandler(channel))

  ipcMain.handle('appointments:create', async (_event, data) => {
    const validatedData = createAppointmentSchema.parse(data)

    return appointmentService.createAppointment(validatedData)
  })

  ipcMain.handle('appointments:get-all', async () => {
    return appointmentService.getAllAppointments()
  })

  ipcMain.handle('appointments:get-today', async () => {
    return appointmentService.getTodayAppointments()
  })

  ipcMain.handle('appointments:get-by-id', async (_event, id: number) => {
    return appointmentService.getAppointmentById(id)
  })

  ipcMain.handle(
    'appointments:update',
    async (_event, id: number, data) => {
      const validatedData = updateAppointmentSchema.parse(data)

      return appointmentService.updateAppointment(id, validatedData)
    }
  )

  ipcMain.handle('appointments:delete', async (_event, id: number) => {
    return appointmentService.deleteAppointment(id)
  })
}
