import React from 'react'

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="sec-title">{title}</h3>}
          {subtitle && <p className="text-xs text-[#8A8A89] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
