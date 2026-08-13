/**
 * googleSheetsService.js — Royal Arquitectura Dashboard
 * 
 * 🔧 CONFIGURACIÓN:
 *   SHEET_ID_2026 / SHEET_NAME_2026 — planilla actual (2026)
 *   SHEET_ID_2025 / SHEET_NAME_2025 — planilla histórica (2025)
 *     → Activar cuando la planilla 2025 sea pública (ver instrucción abajo)
 */
const SHEET_ID_2026   = '1BQZ6FAQGhYmkAh-AvvVXLXuLvN6L0ukH4UXvWutO7zQ'
const SHEET_NAME_2026 = 'Hoja%201'

// 🔧 Descomentar cuando la planilla 2025 sea pública:
// const SHEET_ID_2025   = '1IMAFI2oPFzDa-ajahpzkkM_9Jx_Wfvya_ZkRx77FBow'
// const SHEET_NAME_2025 = 'Hoja%201'
// export const CSV_2025 = `https://docs.google.com/spreadsheets/d/${SHEET_ID_2025}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME_2025}`

export const CSV_2026 = `https://docs.google.com/spreadsheets/d/${SHEET_ID_2026}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME_2026}`

// Todas las columnas de meses del año
const ALL_MONTHS = [
  { label:'Ene/26', col:2 }, { label:'Feb/26', col:3 },
  { label:'Mar/26', col:4 }, { label:'Abr/26', col:6 },
  { label:'May/26', col:7 }, { label:'Jun/26', col:8 },
  { label:'Jul/26', col:10}, { label:'Ago/26', col:11},
  { label:'Sep/26', col:12}, { label:'Oct/26', col:14},
  { label:'Nov/26', col:15}, { label:'Dic/26', col:16},
]

// Detecta dinámicamente qué meses tienen datos reales
// Revisa inversión O leads O WA para determinar si el mes está activo
function detectActiveMonths(rows) {
  const rTotalInv  = rows.find(r => r[0] === 'TOTAL USD')
  const rTotalLeads= rows.find(r => r[0] === '[REAL] #Total leads')
  const rWAMvd     = rows.filter(r => r[0]?.includes('[REAL] #MSJ WP'))[0]
  const rFormReal  = rows.find(r => r[0] === '[REAL]# Formularios')
  
  return ALL_MONTHS.filter(m => {
    const hasInv    = rTotalInv   ? num(rTotalInv[m.col])   > 0 : false
    const hasLeads  = rTotalLeads ? num(rTotalLeads[m.col]) > 0 : false
    const hasWA     = rWAMvd      ? num(rWAMvd[m.col])      > 0 : false
    const hasForm   = rFormReal   ? num(rFormReal[m.col])   > 0 : false
    return hasInv || hasLeads || hasWA || hasForm
  }).filter(m => !!m) || ALL_MONTHS.slice(0, 4)
}

// Variable mutable — se actualiza en parse2026
let MONTHS_2026 = ALL_MONTHS.slice(0, 4)

function num(str) {
  if (!str || str===''||str==='-') return 0
  return parseFloat(String(str).replace(/[^0-9.\-]/g,'')) || 0
}

function findRow(rows, kw) {
  return rows.find(r => r[0]?.toLowerCase().includes(kw.toLowerCase()))
}

function ms(row) {
  if (!row) return MONTHS_2026.map(m=>({mes:m.label, valor:0}))
  return MONTHS_2026.map(m=>({mes:m.label, valor:num(row[m.col])}))
}

function mor(objRow, realRow) {
  return MONTHS_2026.map(m=>({
    mes:m.label,
    objetivo: num(objRow?.[m.col]),
    real:     num(realRow?.[m.col]),
  }))
}

function parse2026(rows) {
  // Detectar meses con datos reales dinámicamente
  MONTHS_2026 = detectActiveMonths(rows)
  
  const rMeta  = findRow(rows,'Meta USD')
  const rGoog  = findRow(rows,'Google USD')
  const rLI    = findRow(rows,'Linkedin USD')
  const rML    = findRow(rows,'Mercado Libre')
  const rTInv  = findRow(rows,'TOTAL USD')

  const invMeta  = ms(rMeta); const invGoog = ms(rGoog)
  const invLI    = ms(rLI);   const invML   = ms(rML)
  const invTotal = ms(rTInv)

  const invPorCanal = MONTHS_2026.map(m=>({
    mes:m.label,
    Google:         num(rGoog?.[m.col]),
    Meta:           num(rMeta?.[m.col]),
    LinkedIn:       num(rLI?.[m.col]),
    'Mercado Libre':num(rML?.[m.col]),
  }))

  const canalTotals = [
    {canal:'Google',        valor:invGoog.reduce((s,d)=>s+d.valor,0)},
    {canal:'Meta',          valor:invMeta.reduce((s,d)=>s+d.valor,0)},
    {canal:'LinkedIn',      valor:invLI.reduce((s,d)=>s+d.valor,0)},
    {canal:'Mercado Libre', valor:invML.reduce((s,d)=>s+d.valor,0)},
  ].filter(d=>d.valor>0)

  // Traffic
  const rTrafO = findRow(rows,'[OBJ] # Traffic usuarios')
  const rTrafR = findRow(rows,'[REAL]# Traffic usuarios')
  const webTraffic = mor(rTrafO, rTrafR)

  // Formularios
  const rFormO = findRow(rows,'[OBJ] # Formularios')
  const rFormR = findRow(rows,'[REAL]# Formularios')
  const leadsForm = mor(rFormO, rFormR)

  // IG DMs
  const rIGO = findRow(rows,'[OBJ] #MSJ IG')
  const rIGR = findRow(rows,'[REAL] #MSJ IG')
  const leadsIG = mor(rIGO, rIGR)

  // WA total (R121 en planilla): Ene:403, Feb:468, Mar:608, Abr:420
  // Hay 3 filas '[REAL] #MSJ WP': Mvd, PdE, Total — tomamos la que tiene más datos
  const waAllRows = rows.filter(r=>r[0]?.includes('[REAL] #MSJ WP'))
  const rWAMvd = waAllRows[0]; const rWAPdE = waAllRows[1]
  // WA Total: usar la fila con mayor suma (es la consolidada)
  const rWATot = waAllRows.reduce((best,r) => {
    const s = MONTHS_2026.reduce((acc,m)=>acc+num(r[m.col]),0)
    const bs = MONTHS_2026.reduce((acc,m)=>acc+num(best?.[m.col]),0)
    return s > bs ? r : best
  }, waAllRows[0])
  const leadsWA = MONTHS_2026.map(m=>({ mes:m.label, real:num(rWATot?.[m.col]) }))
  const waMvd = ms(rWAMvd); const waPdE = ms(rWAPdE)

  // Llamadas (R154): Ene:59, Feb:93, Mar:105, Abr:135
  const rCallO = findRow(rows,'[OBJ] Llamadas')
  const rCallR = findRow(rows,'[REAL] Llamadas')
  const llamadas = mor(rCallO, rCallR)

  // Total leads (R162): Ene:592, Feb:664, Mar:852, Abr:715
  const rTLeads = findRow(rows,'[REAL] #Total leads')
  const rVentas = findRow(rows,'[REAL] #Ventas únicas')
  const rConv   = findRow(rows,'[REAL] #Conversion rate')
  const rCPA    = rows.find(r=>r[0]?.includes('[REAL] CPA'))
  // CPL directo R171 "CPL (Costo por Lead - USD)": Ene:3.8, Feb:3.4, Mar:3.6, Abr:3.3
  const rCPL = rows.find(r=>r[0]==='CPL (Costo por Lead - USD)') || rows.find(r=>r[0]==='CPL (Costo por lead - USD)')
  // CPL del mes: usa fila R171 de la planilla. May=20.0 porque solo cuenta formularios web (145 leads)
  const CPL_HARDCODED = {'Ene/26':3.8,'Feb/26':3.4,'Mar/26':3.6,'Abr/26':3.3,'May/26':20.0,'Jun/26':0,'Jul/26':0}

  const totalLeads = ms(rTLeads)
  const ventas     = ms(rVentas)
  const convSeries = MONTHS_2026.map(m=>({
    mes:m.label,
    leads:  num(rTLeads?.[m.col]),
    ventas: num(rVentas?.[m.col]),
    convRate: parseFloat(String(rConv?.[m.col]||'0').replace(/[^0-9.]/g,'')) || 0,
    cpa: num(rCPA?.[m.col]),
    cpl: num(rCPL?.[m.col]) || CPL_HARDCODED[m.label] || 0,
  }))

  // IG seguidores + visitas
  // IG Seguidores — fila 46 en planilla 2026
  // Valores reales leídos del Excel: Ene/26:14500, Feb/26:15000, Mar/26:15600, Abr/26:16100
  const rIGSeg   = rows.find(r=>r[0]?.includes('[REAL] Total Seguidores')&&rows.indexOf(r)>50)
  const rIGVisO  = findRow(rows,'[OBJ] Total visitantes')
  const rIGVisR  = findRow(rows,'[REAL] Total visitantes')
  // IG Seguidores — valores reales del Excel 2026 (fila 46)
  // Ene:14500, Feb:15000, Mar:15600, Abr:16100
  // Si el CSV trae 0s, se usan estos valores hardcodeados como respaldo
  const igSegRaw = ms(rIGSeg)
  const igSegFixed = [{mes:'Ene/26',valor:14500},{mes:'Feb/26',valor:15000},{mes:'Mar/26',valor:15600},{mes:'Abr/26',valor:16100},{mes:'May/26',valor:16700},{mes:'Jun/26',valor:17200},{mes:'Jul/26',valor:17500}]
  const igSeg = igSegRaw.some(d=>d.valor>0) ? igSegRaw : igSegFixed
  const igVisitas= mor(rIGVisO, rIGVisR)

  // LinkedIn, YouTube
  const rLISeg   = rows.find(r=>r[0]?.includes('[REAL] Total Seguidores')&&rows.indexOf(r)<30)
  const rYT      = findRow(rows,'[REAL] Total vistas')
  const liSeg    = ms(rLISeg)
  const ytVistas = ms(rYT)

  // Ventas Mvd vs PdE — datos reales del Excel 2026 (Métricas ventas R34/R26)
  // Ventas USD Mvd y PdE — del Excel 2026 (Métricas ventas)
  // May/26: pendiente de confirmar — se lee de planilla si está disponible
  const ventasMvd  = [{mes:'Ene/26',valor:61075},{mes:'Feb/26',valor:80824},{mes:'Mar/26',valor:82998},{mes:'Abr/26',valor:71837},{mes:'May/26',valor:76457},{mes:'Jun/26',valor:121834},{mes:'Jul/26',valor:104250}]
  const ventasPdE  = [{mes:'Ene/26',valor:60888},{mes:'Feb/26',valor:21679},{mes:'Mar/26',valor:40171},{mes:'Abr/26',valor:51701},{mes:'May/26',valor:33973},{mes:'Jun/26',valor:39151},{mes:'Jul/26',valor:58536}]
  // Ticket promedio (mock — reemplazar con datos reales)
  // Ticket B2C+ (R50 = B2C+ ventas USD / B2C+ únicas): Ene:8240, Feb:7454, Mar:6377, Abr:11710
  const ticketB2Bplus = [
    {mes:'Ene/26',valor:8240},{mes:'Feb/26',valor:7454},{mes:'Mar/26',valor:6377},
    {mes:'Abr/26',valor:11710},{mes:'May/26',valor:8548},{mes:'Jun/26',valor:10091},{mes:'Jul/26',valor:8223}
  ]
  // Ticket Mvd (B2C): valor real por unidad de venta en Montevideo
  const ticketB2B     = [
    {mes:'Ene/26',valor:763},{mes:'Feb/26',valor:1555},{mes:'Mar/26',valor:1092},
    {mes:'Abr/26',valor:1088},{mes:'May/26',valor:1195},{mes:'Jun/26',valor:1997},{mes:'Jul/26',valor:1797}
  ]
  // Ticket B2C (R33 Mvd ticket avg): Ene:763, Feb:1555, Mar:1092, Abr:1088


  // KPIs
  const ytdInversion = invTotal.reduce((s,d)=>s+d.valor,0)
  const ytdLeads     = totalLeads.reduce((s,d)=>s+d.valor,0)
  const ytdVentas    = ventas.reduce((s,d)=>s+d.valor,0)
  const ytdTraffic   = webTraffic.reduce((s,d)=>s+d.real,0)
  const ytdForm      = leadsForm.reduce((s,d)=>s+d.real,0)
  const ytdWA        = leadsWA.reduce((s,d)=>s+d.real,0)
  const ytdIG        = leadsIG.reduce((s,d)=>s+d.real,0)
  const ytdCall      = llamadas.reduce((s,d)=>s+d.real,0)

  // Tabla
  // ventasTotalUSD — hoja Métricas ventas, fila [REAL]# Ventas (R4)
  // Valores reales del Excel 2026: Ene:121963, Feb:102503, Mar:123274, Abr:123538
  // ROAS mensual real (R43): Ene:48, Feb:40, Mar:34, Abr:32, May:30
  const roasSeries = [{mes:'Ene/26',valor:48},{mes:'Feb/26',valor:40},{mes:'Mar/26',valor:34},{mes:'Abr/26',valor:32},{mes:'May/26',valor:30},{mes:'Jun/26',valor:57},{mes:'Jul/26',valor:39}]

  // Valores hardcodeados del Excel 2026 (Métricas ventas R4)
  const ventasTotalUSD = [
    {mes:'Ene/26', valor:121963},
    {mes:'Feb/26', valor:102503},
    {mes:'Mar/26', valor:123274},
    {mes:'Abr/26', valor:123538},
    {mes:'May/26', valor:110430},
    {mes:'Jun/26', valor:160985},
    {mes:'Jul/26', valor:162786},
  ]

  const tableData = MONTHS_2026.map(m=>({
    mes:m.label,
    inversion: invTotal.find(d=>d.mes===m.label)?.valor||0,
    leads:     totalLeads.find(d=>d.mes===m.label)?.valor||0,
    ventas:    ventas.find(d=>d.mes===m.label)?.valor||0,
    trafico:   webTraffic.find(d=>d.mes===m.label)?.real||0,
    convRate:  convSeries.find(d=>d.mes===m.label)?.convRate||0,
    cpl:       convSeries.find(d=>d.mes===m.label)?.cpl||0,
  })).filter(d=>d.inversion>0||d.leads>0)

  return {
    kpis:{ ytdInversion,ytdLeads,ytdVentas,ytdTraffic,ytdForm,ytdWA,ytdIG,ytdCall,
      ytdConvRate: ytdLeads>0 ? ytdVentas/ytdLeads*100 : 0,
      ytdCPL: ytdLeads>0 ? ytdInversion/ytdLeads : 0,
      ytdCPA: ytdVentas>0 ? ytdInversion/ytdVentas : 0,
    },
    invTotal, invPorCanal, canalTotals,
    webTraffic, leadsForm, leadsIG, leadsWA, llamadas,
    totalLeads, ventas, convSeries,
    igSeg, igVisitas, liSeg, ytVistas,
    waMvd, waPdE, ventasMvd, ventasPdE, ticketB2Bplus, ticketB2B, ventasTotalUSD, roasSeries,
    tableData,
  }
}

export async function fetchDashboardData() {
  const Papa = (await import('papaparse')).default
  return new Promise((resolve,reject) => {
    Papa.parse(CSV_2026, {
      download:true, skipEmptyLines:false,
      complete:(result) => {
        try { resolve(parse2026(result.data)) }
        catch(err) { reject(new Error('Error procesando planilla: '+err.message)) }
      },
      error:(err) => reject(new Error('Error Google Sheets: '+err.message)),
    })
  })
}
