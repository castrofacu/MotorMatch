export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="flex gap-2 flex-wrap">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
      </div>
    </div>
  )
}
