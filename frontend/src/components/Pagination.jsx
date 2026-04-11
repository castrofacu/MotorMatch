import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={16} />
        Anterior
      </button>
      <span className="text-sm text-gray-500">
        Página <span className="font-semibold text-gray-800">{page}</span>{' '}
        de <span className="font-semibold text-gray-800">{totalPages}</span>
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Siguiente
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
