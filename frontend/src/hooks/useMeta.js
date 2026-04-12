import { useEffect, useState } from 'react'
import { fetchBrands, fetchSegments } from '../lib/api'

export function useMeta() {
  const [brands, setBrands] = useState([])
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    Promise.all([
      fetchBrands(controller.signal),
      fetchSegments(controller.signal),
    ])
      .then(([brandsData, segmentsData]) => {
        setBrands(brandsData)
        setSegments(segmentsData)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => { controller.abort() }
  }, [])

  return { brands, segments, loading, error }
}
