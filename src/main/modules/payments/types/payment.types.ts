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
