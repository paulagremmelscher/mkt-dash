import React from 'react'
import { BarChart2 } from 'lucide-react'

export default function Filters({ activeMetric, onMetricChange }) {
  const metrics = [
    { id: 'inversion', label: 'Inversión' },
    { id: 'leads',     label: 'Leads' },
    { id: 'trafico',   label: 'Tráfico' },
  ]
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-[#8A8A89]">
        <BarChart2 size={12} />
        <span className="label-xs">Gráfico principal</span>
      </div>
      <div className="flex gap-1.5">
        {metrics.map(m => (
          <button key={m.id} onClick={() => onMetricChange(m.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeMetric === m.id
                ? 'bg-[#95C11F] text-white'
                : 'bg-[#F0F0EE] text-[#575756] hover:bg-[#E2E2DF]'
            }`}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
