const API_BASE = 'http://localhost:8000/api'

async function apiFetch(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}

export function fetchBrands() {
  return apiFetch('/cars/meta/brands')
}

export function fetchSegments() {
  return apiFetch('/cars/meta/segments')
}

export function fetchCars({
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
  return apiFetch('/cars', {
    brand,
    segment,
    min_price: minPrice,
    max_price: maxPrice,
    is_turbo: isTurbo === true ? true : undefined,
    sort_by: sortBy,
    order,
    page,
    page_size: pageSize,
  })
}
