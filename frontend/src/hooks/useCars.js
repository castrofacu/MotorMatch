import { useEffect, useState } from 'react'
import { fetchCars } from '../lib/api'

export function useCars(filters) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCars(filters)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.brand,
    filters.segment,
    filters.minPrice,
    filters.maxPrice,
    filters.isTurbo,
    filters.sortBy,
    filters.order,
    filters.page,
    filters.pageSize,
  ])

  return { data, loading, error }
}
