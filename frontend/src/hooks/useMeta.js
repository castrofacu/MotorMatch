import { useEffect, useState } from 'react'
import { fetchBrands, fetchSegments } from '../lib/api'

export function useMeta() {
  const [brands, setBrands] = useState([])
  const [segments, setSegments] = useState([])

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error)
    fetchSegments().then(setSegments).catch(console.error)
  }, [])

  return { brands, segments }
}
