import { useEffect, useState } from 'react'

import { getAllPayments, type PaymentRecord } from '../../../services/payment.api'

export function usePayments(): {
  payments: PaymentRecord[]
  loading: boolean
  error: string | null
} {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadPayments = async (): Promise<void> => {
      try {
        const data = await getAllPayments()
        if (active) {
          setPayments(data)
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Impossible de charger les paiements.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPayments()

    return () => {
      active = false
    }
  }, [])

  return { payments, loading, error }
}
