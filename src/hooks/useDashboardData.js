import { useState, useEffect } from 'react'
import { fetchDashboardData } from '../services/googleSheetsService'
import { getMockData2025 }    from '../services/mockData2025'

export function useDashboardData() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(null)
    fetchDashboardData()
      .then(d2026 => {
        if (cancelled) return
        const d2025 = getMockData2025()  // datos reales del Excel 2025
        setData({ d2026, d2025 })
        setLoading(false)
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
