import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { FilterSidebar } from './components/FilterSidebar'
import { CarCard } from './components/CarCard'
import { SkeletonCard } from './components/SkeletonCard'
import { Pagination } from './components/Pagination'
import { useDebounce } from './hooks/useDebounce'
import { useCars } from './hooks/useCars'
import { useMeta } from './hooks/useMeta'

const PAGE_SIZE = 20

const DEFAULT_FILTERS = {
  brand: '',
  segment: '',
  minPrice: '',
  maxPrice: '',
  isTurbo: false,
}

export default function App() {
  const { brands, segments } = useMeta()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('price_usd')
  const [order, setOrder] = useState('asc')
  const [page, setPage] = useState(1)

  const debouncedMinPrice = useDebounce(filters.minPrice, 300)
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 300)

  useEffect(() => {
    setPage(1)
  }, [
    filters.brand,
    filters.segment,
    debouncedMinPrice,
    debouncedMaxPrice,
    filters.isTurbo,
    sortBy,
    order,
  ])

  const { data, loading, error } = useCars({
    brand: filters.brand,
    segment: filters.segment,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    isTurbo: filters.isTurbo,
    sortBy,
    order,
    page,
    pageSize: PAGE_SIZE,
  })

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
    setSortBy('price_usd')
    setOrder('asc')
    setPage(1)
  }

  function handleSortChange(e) {
    const val = e.target.value
    if (val === 'price_asc') { setSortBy('price_usd'); setOrder('asc') }
    if (val === 'price_desc') { setSortBy('price_usd'); setOrder('desc') }
  }

  const total = data?.total ?? 0
  const results = data?.results ?? []
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const sortValue = order === 'asc' ? 'price_asc' : 'price_desc'

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <FilterSidebar
        brands={brands}
        segments={segments}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <main className="flex-1 flex flex-col overflow-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            {loading ? (
              <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <span className="font-semibold text-gray-900 text-base">{total.toLocaleString('es-UY')}</span>
                {' '}resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap">Ordenar por:</label>
            <select
              value={sortValue}
              onChange={handleSortChange}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </header>

        <div className="p-8 flex-1">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
              <AlertCircle size={40} />
              <p className="text-base font-medium">Error al cargar los datos</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <p className="text-base font-medium">No se encontraron autos con esos filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>

        {!loading && results.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        )}
      </main>
    </div>
  )
}
