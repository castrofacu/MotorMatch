import { Fuel, Settings2, ShieldCheck, Zap } from 'lucide-react'

function Badge({ icon, label, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {icon}
      {label}
    </span>
  )
}

function formatPrice(price) {
  return `USD ${price.toLocaleString('es-UY')}`
}

export function CarCard({ car }) {
  const {
    brand,
    model,
    price_usd,
    segment,
    transmission,
    fuel_type,
    is_turbo,
    airbags,
  } = car

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-3">
      {/* Header */}
      <div>
        {segment && (
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-1 block">
            {segment}
          </span>
        )}
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          {brand} {model}
        </h3>
      </div>

      {/* Price */}
      <div className="text-2xl font-extrabold text-indigo-600 tracking-tight">
        {formatPrice(price_usd)}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {transmission && (
          <Badge
            icon={<Settings2 size={12} />}
            label={transmission}
            color="blue"
          />
        )}
        {fuel_type && (
          <Badge
            icon={<Fuel size={12} />}
            label={fuel_type}
            color="green"
          />
        )}
        {airbags != null && (
          <Badge
            icon={<ShieldCheck size={12} />}
            label={`${airbags} airbags`}
            color="gray"
          />
        )}
        {is_turbo === true && (
          <Badge
            icon={<Zap size={12} />}
            label="Turbo"
            color="orange"
          />
        )}
      </div>
    </div>
  )
}
