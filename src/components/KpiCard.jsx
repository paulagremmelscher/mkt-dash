import React from 'react'

export default function KpiCard({ label, value, sub, trend, icon: Icon, accent = false }) {
  const isPositive = trend > 0
  const isNeutral  = trend === null || trend === undefined

  return (
    <div className={`card p-5 flex flex-col gap-3 ${accent ? '!bg-[#1A1A1A] !border-[#1A1A1A]' : ''}`}>
      <div className="flex items-start justify-between">
        <span className={`label-xs ${accent ? '!text-[#575756]' : ''}`}>{label}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? 'bg-[#95C11F]/20' : 'bg-[#F0F7E0]'}`}>
            <Icon size={13} className={accent ? 'text-[#95C11F]' : 'text-[#7AA318]'} />
          </div>
        )}
      </div>
      <div>
        <div className={`kpi-num ${accent ? '!text-white' : ''}`}>{value}</div>
        {sub && <div className={`text-xs mt-0.5 ${accent ? 'text-[#575756]' : 'text-[#8A8A89]'}`}>{sub}</div>}
      </div>
      {!isNeutral && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span className={`badge-${isPositive ? 'green' : 'red'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className={`text-[10px] ${accent ? 'text-[#575756]' : 'text-[#C4C4C3]'}`}>vs ant.</span>
        </div>
      )}
    </div>
  )
}
