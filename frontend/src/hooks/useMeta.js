import { useEffect, useState } from 'react'
import { fetchBrands, fetchSegments } from '../lib/api'

export function useMeta() {
  const [brands, setBrands] = useState([])
  const [segments, setSegments] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchBrands()
      .then((data) => { if (!cancelled) setBrands(data) })
      .catch(console.error)
    fetchSegments()
      .then((data) => { if (!cancelled) setSegments(data) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [])

  return { brands, segments }
}
