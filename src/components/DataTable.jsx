import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters'

export default function DataTable({ data = [] }) {
  const [search, setSearch] = useState('')
  const filtered = data.filter(r => r.mes.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C4C3]" />
        <input type="text" placeholder="Filtrar por mes..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F5F5F3] border border-[#E2E2DF] rounded-xl outline-none focus:border-[#95C11F] transition-colors placeholder:text-[#C4C4C3]" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E2DF]">
              {['Período','Inversión','Leads','Ventas','Tráfico Web','Conv. Rate','CPL'].map(h => (
                <th key={h} className="label-xs text-left pb-3 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-[#8A8A89] text-sm">Sin resultados</td></tr>
            ) : filtered.map((row, i) => (
              <tr key={row.mes}
                className={`border-b border-[#F0F0EE] hover:bg-[#F5F5F3] transition-colors ${i%2===1?'bg-[#FAFAFA]':''}`}>
                <td className="py-3 pr-4 font-medium">{row.mes}</td>
                <td className="py-3 pr-4 text-[#575756]">{row.inversion > 0 ? formatCurrency(row.inversion) : '—'}</td>
                <td className="py-3 pr-4 text-[#575756]">{row.leads > 0 ? formatNumber(row.leads) : '—'}</td>
                <td className="py-3 pr-4">
                  {row.ventas > 0
                    ? <span className="badge-green">{formatNumber(row.ventas)}</span>
                    : '—'}
                </td>
                <td className="py-3 pr-4 text-[#575756]">{row.trafico > 0 ? formatNumber(row.trafico) : '—'}</td>
                <td className="py-3 pr-4">
                  {row.convRate !== '—'
                    ? <span className={`badge-${parseFloat(row.convRate) >= 15 ? 'green' : 'gray'}`}>{row.convRate}%</span>
                    : '—'}
                </td>
                <td className="py-3 pr-4 text-[#575756]">
                  {row.cpl !== '—' ? formatCurrency(row.cpl, 1) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
