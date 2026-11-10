
import { ipcMain } from 'electron'

import { patientService } from './patient.container'

import {
  createPatientSchema,
  updatePatientSchema
} from './validators/patient.validator'

/**
 * Patient IPC Handlers
 *
 * Handles communication between:
 * Renderer (React) <-> Main (Electron)
 */

export function registerPatientIpcHandlers(): void {
  // Remove existing handlers to avoid duplicate registration
  ipcMain.removeHandler('patients:create')
  ipcMain.removeHandler('patients:get-all')
  ipcMain.removeHandler('patients:get-by-id')
  ipcMain.removeHandler('patients:update')
  ipcMain.removeHandler('patients:delete')

  // CREATE PATIENT
  ipcMain.handle('patients:create', async (_event, data) => {
    const validatedData = createPatientSchema.parse(data)

    return patientService.createPatient(validatedData)
  })

  // GET ALL PATIENTS
  ipcMain.handle('patients:get-all', async () => {
    return patientService.getAllPatients()
  })

  // GET PATIENT BY ID
  ipcMain.handle('patients:get-by-id', async (_event, id: number) => {
    return patientService.getPatientById(id)
  })

  // UPDATE PATIENT
  ipcMain.handle(
    'patients:update',
    async (_event, id: number, data) => {
      const validatedData = updatePatientSchema.parse(data)

      return patientService.updatePatient(id, validatedData)
    }
  )

  // DELETE PATIENT
  ipcMain.handle('patients:delete', async (_event, id: number) => {
    return patientService.deletePatient(id)
  })
}
