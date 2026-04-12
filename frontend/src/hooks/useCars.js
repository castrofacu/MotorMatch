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
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchCars(
      { brand, segment, minPrice, maxPrice, isTurbo, sortBy, order, page, pageSize },
      controller.signal,
    )
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      controller.abort()
    }
  }, [brand, segment, minPrice, maxPrice, isTurbo, sortBy, order, page, pageSize])

  return { data, loading, error }
}
