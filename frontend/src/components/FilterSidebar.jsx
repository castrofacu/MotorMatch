import { Car, SlidersHorizontal, X } from 'lucide-react'

export function FilterSidebar({
  brands,
  segments,
  filters,
  onChange,
  onReset,
}) {
  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white rounded-lg p-1.5">
            <Car size={20} />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            MotorMatch
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 ml-0.5">Autos 0km en Uruguay</p>
      </div>

      {/* Filters */}
      <div className="px-6 py-5 flex flex-col gap-5 flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <SlidersHorizontal size={13} />
          Filtros
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-brand" className="text-sm font-medium text-gray-700">Marca</label>
          <select
            id="filter-brand"
            value={filters.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Segment */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-segment" className="text-sm font-medium text-gray-700">Segmento</label>
          <select
            id="filter-segment"
            value={filters.segment}
            onChange={(e) => onChange('segment', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="">Todos los segmentos</option>
            {segments.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Precio (USD)</span>
          <div className="flex gap-2">
            <input
              type="number"
              aria-label="Precio mínimo en USD"
              placeholder="Mín"
              min={0}
              value={filters.minPrice}
              onChange={(e) => onChange('minPrice', e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <input
              type="number"
              aria-label="Precio máximo en USD"
              placeholder="Máx"
              min={0}
              value={filters.maxPrice}
              onChange={(e) => onChange('maxPrice', e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
        </div>

        {/* Turbo toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={filters.isTurbo}
              onChange={(e) => onChange('isTurbo', e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-gray-700">Solo autos con Turbo</span>
        </label>
      </div>

      {/* Reset */}
      <div className="px-6 py-4 border-t border-gray-100">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <X size={14} />
          Limpiar filtros
        </button>
      </div>
    </aside>
  )
}
