export function formatCurrency(value, decimals=0) {
  if(!value&&value!==0||isNaN(value)) return '—'
  return new Intl.NumberFormat('es-UY',{style:'currency',currency:'USD',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value)
}
export function formatNumber(value) {
  if(!value&&value!==0||isNaN(value)) return '—'
  return new Intl.NumberFormat('es-UY').format(value)
}
export function formatPercent(value, decimals=1) {
  if(!value&&value!==0||isNaN(value)) return '—'
  return `${Number(value).toFixed(decimals)}%`
}
