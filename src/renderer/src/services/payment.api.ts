export interface PaymentRecord {
  id: number
  patientId: number
  patientFirstName?: string
  patientLastName?: string
  amountCents: number
  paymentDate: Date
  createdAt: Date
}

export interface CreatePaymentInput {
  patientId: number
  amountCents: number
}

export interface UpdatePaymentInput {
  amountCents: number
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  return window.api.payments.getAll()
}

export async function getPatientPayments(patientId: number): Promise<PaymentRecord[]> {
  return window.api.payments.getByPatientId(patientId)
}

export async function createPayment(data: CreatePaymentInput): Promise<PaymentRecord> {
  return window.api.payments.create(data)
}

export async function updatePayment(
  id: number,
  data: UpdatePaymentInput
): Promise<PaymentRecord> {
  return window.api.payments.update(id, data)
}

export async function deletePayment(id: number): Promise<boolean> {
  return window.api.payments.delete(id)
}
