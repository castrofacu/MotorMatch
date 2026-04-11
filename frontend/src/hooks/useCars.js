import { useEffect, useState } from 'react'
import { fetchCars } from '../lib/api'

export function useCars({
  brand,
  segment,
  minPrice,
  maxPrice,
  isTurbo,
  sortBy,
  order,
  page,
  pageSize,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCars({ brand, segment, minPrice, maxPrice, isTurbo, sortBy, order, page, pageSize })
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
  }, [brand, segment, minPrice, maxPrice, isTurbo, sortBy, order, page, pageSize])

  return { data, loading, error }
}
