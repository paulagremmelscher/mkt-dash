/**
 * data2025.js — Datos REALES del Excel CDI_ROYAL_marketing_2025.xlsx
 * Hardcodeado — no requiere conexión externa.
 * 
 * Columnas: Ene=C(2), Feb=D(3), Mar=E(4), Abr=G(6), May=H(7), Jun=I(8),
 *           Jul=K(10), Ago=L(11), Sep=M(12), Oct=O(14), Nov=P(15), Dic=Q(16)
 */

import { X25 } from './excelData'

// Meses del 2025 (mismos índices que la planilla)
const M = ['Ene/25','Feb/25','Mar/25','Abr/25','May/25','Jun/25',
           'Jul/25','Ago/25','Sep/25','Oct/25','Nov/25','Dic/25']

function series(vals) {
  return M.map((mes, i) => ({ mes, valor: vals[i] || 0 }))
}
function seriesReal(vals) {
  return M.map((mes, i) => ({ mes, real: vals[i] || 0 }))
}

export function getMockData2025() {

  // ── INVERSIÓN (hoja Awr - SQLs - Rep) ────────────────────────
  // Meta USD (R4):       0, 0, 885, 933, 338, 423, 226, 191, 175.7, 196, 213, 194
  // Google USD (R6):     1550, 844, 845, 971, 1600, 2100, 2200, 2575, 2950, 2860, 3180, 2114
  // ML (R12):            0, 0, 0, 337.6, 471.3, 461.1, 480.9, 794.0, 446, 501.3, 386.7, 365.9
  // TOTAL USD (R14):     1550, 844, 1730, 2241.6, 2409.3, 2984.1, 2906.9, 3560, 3571.7, 3557.3, 3779.7, 2673.9

  // Excel CDI 2025 actualizado (hoja Awr - SQLs - Rep)
  const inversionMensual = series(X25.awr.invTot)

  const invPorCanal = M.map((mes, i) => ({
    mes,
    Google:          X25.awr.google[i] || 0,
    Meta:            X25.awr.meta[i] || 0,
    LinkedIn:        [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0  ][i] || 0,
    'Mercado Libre': X25.awr.ml[i] || 0,
  }))

  // ── WEB TRAFFIC (R35): 7500, 8600, 9211, 11891, 7248, 8600, 10700, 11407, 11433, 9268, 10450, 10450
  const webTraffic = seriesReal([7500,8600,9211,11891,7248,8600,10700,11407,11433,9268,10450,10450])

  // ── FORMULARIOS WEB (R118): 53, 59, 52, 62, 100, 133, 140, 113, 138, 81, 95, 69
  const leadsForm = M.map((mes,i) => ({
    mes, real: [53,59,52,62,100,133,140,113,138,81,95,69][i]||0
  }))

  // ── IG DMs (R129): 0, 0, 19, 20, 12, 5, 4, 2, 2, 2, 5, 2
  const leadsIG = M.map((mes,i) => ({
    mes, real: [0,0,19,20,12,5,4,2,2,2,5,2][i]||0
  }))

  // ── WA Mvd: 120, 130, 128, 150, 233, 320, 380, 271, 326, 441, 406, 308
  //    (ene–mar corregidos con el Excel actualizado; antes figuraban 50/50/50)
  const waMvd = series([120,130,128,150,233,320,380,271,326,441,406,308])

  // ── WA PdE: 90, 60, 55, 95, 95, 64, 104, 128, 106, 151, 120, 149
  //    (ene–mar corregidos con el Excel actualizado; antes figuraban 50/50/50)
  const waPdE = series([90,60,55,95,95,64,104,128,106,151,120,149])

  // ── WA Total (R155 = Mvd + PdE):
  const leadsWA = M.map((mes,i) => ({
    mes, real: waMvd[i].valor + waPdE[i].valor
  }))

  // ── LLAMADAS (R188): 133, 103, 116, 96, 113, 108, 138, 161, 130, 180, 200, 190
  const llamadas = M.map((mes,i) => ({
    mes, real: [133,103,116,96,113,108,138,161,130,180,200,190][i]||0
  }))

  // ── TOTAL LEADS (R196 — dato real de la planilla "[REAL] #Total leads")
  // ⚠️ Corregido: antes se calculaba como suma de IG+WA+Form+Llamadas, lo cual
  // no coincidía con el total real de la hoja (esa suma subestima el total,
  // ya que la planilla incluye leads de canales adicionales no desagregados aquí).
  // Valores reales R196: 426,382,400,455,593,668,838,714,760,906,849,720
  const totalLeads = series(X25.awr.leads)

  // ── VENTAS ÚNICAS (fila "[REAL] #Ventas únicas", total 1.084)
  //    Valores corregidos con el Excel actualizado. Antes: 69,60,73,88,64,91,117,123,124,124,114,114
  const ventas = series(X25.awr.ventas)   // suman 754 de Ene a Sep

  // ── IG SEGUIDORES (R46 real): 0, 0, 8887, 9129, 9250, 9419, 9993, 10900, 11510, 12300, 12700, 13500
  const igSeg = series([0,0,8887,9129,9250,9419,9993,10900,11510,12300,12700,13500])

  // ── IG NUEVOS SEGUIDORES MES (R47 calc): 0, 0, 0, 242, 121, 169, 574, 907, 610, 790, 400, 800
  const igNuevos = series([0,0,0,242,121,169,574,907,610,790,400,800])

  // ── IG VISITAS AL PERFIL (R56): 0, 0, 1197, 1399, 1016, 1074, 1765, 3535, 1707, 3335, 3976, 2243
  const igVisitas = M.map((mes,i) => ({
    mes, real: [0,0,1197,1399,1016,1074,1765,3535,1707,3335,3976,2243][i]||0
  }))

  // ── LI SEGUIDORES (R25): 132, 132, 133, 136, 157, 165, 219, 354, 397, 414, 428, 433
  const liSeg = series([132,132,133,136,157,165,219,354,397,414,428,433])

  // ── YOUTUBE VISTAS (R67): 0, 0, 0, 41, 1000, 797, 5700, 20900, 40500, 208000, 22100, 16300
  const ytVistas = series([0,0,0,41,1000,797,5700,20900,40500,208000,22100,16300])

  // ── VENTAS (hoja "Métricas ventas" del Excel 2025 actualizado) ──
  const ventasTotalUSD = series(X25.total)
  const ventasMvd = series(X25.mvdUSD)
  const ventasPdE = series(X25.pdeUSD)
  const ventasUnicasMvd = series(X25.mvdU)   // ventas únicas reales por sede
  const ventasUnicasPdE = series(X25.pdeU)
  const ventasUnicasB2B = series(X25.b2bU)
  const ventasUnicasB2C = series(X25.b2cU)
  const ventasB2BUSD = series(X25.b2bUSD)
  const ventasB2CUSD = series(X25.b2cUSD)
  const tk = (usd,u) => usd.map((v,i)=> u[i]>0 ? Math.round(v/u[i]) : 0)
  const ticketB2B  = series(tk(X25.b2bUSD,X25.b2bU))
  const ticketB2C  = series(tk(X25.b2cUSD,X25.b2cU))
  const ticketPunta = series(tk(X25.pdeUSD,X25.pdeU))
  const ticketMvd   = series(tk(X25.mvdUSD,X25.mvdU))
  // ROAS mensual = ventas USD ÷ inversión publicitaria total
  const roasSeries = series(X25.total.map((v,i)=> X25.inv[i]>0 ? Math.round(v/X25.inv[i]*10)/10 : 0))
  // Productos: ventas USD e inversión publicitaria por producto
  const productos = X25.prod.map(p=>({nombre:p.nombre, ventas:series(p.ventas), inversion:series(p.inv)}))

  // ── CPA y CPL mensual y acumulado — mismo criterio que la planilla ──
  //   CPA = inversión total / ventas únicas
  //   CPL = inversión Meta + Google / leads totales (no incluye Mercado Libre)
  const GOOGLE25 = X25.awr.google
  const META25   = X25.awr.meta
  let cumInv25=0, cumPaid25=0, cumLeads25=0, cumVentas25=0
  const convSeries = M.map((mes,i) => {
    const l = totalLeads[i].valor
    const v = ventas[i].valor
    const inv  = inversionMensual[i].valor
    const paid = GOOGLE25[i] + META25[i]
    cumInv25    += inv
    cumPaid25   += paid
    cumLeads25  += l
    cumVentas25 += v
    return {
      mes, leads:l, ventas:v, convRate: l>0 ? v/l*100 : 0,
      cpa: v>0 ? inv/v  : 0,
      cpl: l>0 ? paid/l : 0,
      cpaCum: cumVentas25>0 ? cumInv25/cumVentas25 : 0,
      cplCum: cumLeads25>0  ? cumPaid25/cumLeads25 : 0,
    }
  })

  // Tabla resumen
  const tableData = M.map((mes,i) => ({
    mes,
    inversion: inversionMensual[i].valor,
    leads:     totalLeads[i].valor,
    ventas:    ventas[i].valor,
    trafico:   webTraffic[i].real,
    convRate:  convSeries[i].convRate,
    cpl:       convSeries[i].cpl,
  }))

  return {
    inversionMensual, invPorCanal, webTraffic,
    leadsForm, leadsIG, leadsWA, waMvd, waPdE, llamadas, totalLeads,
    ventas, igSeg, igVisitas, liSeg, ytVistas,
    ventasTotalUSD, ventasMvd, ventasPdE,
    ticketB2B, ticketB2C, ticketPunta, ticketMvd,
    ventasUnicasB2B, ventasUnicasB2C, ventasB2BUSD, ventasB2CUSD, ventasUnicasMvd, ventasUnicasPdE, roasSeries, productos,
    convSeries, tableData,
    canalTotals: [
      {canal:'Google',        valor:X25.awr.google.reduce((s,v)=>s+v,0)},
      {canal:'Meta',          valor:X25.awr.meta.reduce((s,v)=>s+v,0)},
      {canal:'Mercado Libre', valor:X25.awr.ml.reduce((s,v)=>s+v,0)},
    ],
  }
}
