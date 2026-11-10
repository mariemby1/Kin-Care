import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Patient API exposed to React
const patientAPI = {
  create: (data: { firstName: string; lastName: string; phone?: string; notes?: string | null }) =>
    ipcRenderer.invoke('patients:create', data),

  getAll: () => ipcRenderer.invoke('patients:get-all'),

  getById: (id: number) => ipcRenderer.invoke('patients:get-by-id', id),

  update: (
    id: number,
    data: {
      firstName?: string
      lastName?: string
      phone?: string
      notes?: string | null
    }
  ) => ipcRenderer.invoke('patients:update', id, data),

  delete: (id: number) => ipcRenderer.invoke('patients:delete', id)
}

const appointmentAPI = {
  create: (data: {
    patientId: number
    appointmentDate: Date
    duration?: number
    treatment: string
    status?: 'confirmed' | 'cancelled'
    notes?: string | null
  }) => ipcRenderer.invoke('appointments:create', data),

  getAll: () => ipcRenderer.invoke('appointments:get-all'),

  getToday: () => ipcRenderer.invoke('appointments:get-today'),

  getById: (id: number) => ipcRenderer.invoke('appointments:get-by-id', id),

  update: (
    id: number,
    data: {
      patientId?: number
      appointmentDate?: Date
      duration?: number
      treatment?: string
      status?: 'confirmed' | 'cancelled'
      notes?: string | null
    }
  ) => ipcRenderer.invoke('appointments:update', id, data),

  delete: (id: number) => ipcRenderer.invoke('appointments:delete', id)
}

const paymentAPI = {
  create: (data: { patientId: number; amountCents: number }) =>
    ipcRenderer.invoke('payments:create', data),

  update: (id: number, data: { amountCents: number }) =>
    ipcRenderer.invoke('payments:update', id, data),

  getAll: () => ipcRenderer.invoke('payments:get-all'),

  getByPatientId: (patientId: number) =>
    ipcRenderer.invoke('payments:get-by-patient', patientId),

  delete: (id: number) => ipcRenderer.invoke('payments:delete', id)
}

// Custom APIs
const api = {
  patients: patientAPI,
  appointments: appointmentAPI,
  payments: paymentAPI
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose APIs:', error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
