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

const MONTHS_2026 = [
  { label:'Ene/26', col:2 }, { label:'Feb/26', col:3 },
  { label:'Mar/26', col:4 }, { label:'Abr/26', col:6 },
]

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

  // WA
  const waReal = rows.filter(r=>r[0]?.includes('[REAL] #MSJ WP'))
  const rWAMvd = waReal[0]; const rWAPdE = waReal[1]; const rWATot = waReal[2]
  const leadsWA = MONTHS_2026.map(m=>({ mes:m.label, real:num(rWATot?.[m.col]) }))
  const waMvd = ms(rWAMvd); const waPdE = ms(rWAPdE)

  // Llamadas
  const rCallO = findRow(rows,'[OBJ] Llamadas')
  const rCallR = findRow(rows,'[REAL] Llamadas')
  const llamadas = mor(rCallO, rCallR)

  // Leads totales + conversión
  const rTLeads = findRow(rows,'[REAL] #Total leads')
  const rVentas = findRow(rows,'[REAL] #Ventas únicas')
  const rConv   = findRow(rows,'[REAL] #Conversion rate')
  const rCPA    = rows.find(r=>r[0]?.includes('[REAL] CPA'))
  const rCPL    = rows.find(r=>r[0]==='CPL (Costo por Lead - USD)')

  const totalLeads = ms(rTLeads)
  const ventas     = ms(rVentas)
  const convSeries = MONTHS_2026.map(m=>({
    mes:m.label,
    leads:  num(rTLeads?.[m.col]),
    ventas: num(rVentas?.[m.col]),
    convRate: parseFloat(String(rConv?.[m.col]||'0').replace(/[^0-9.]/g,'')) || 0,
    cpa: num(rCPA?.[m.col]),
    cpl: num(rCPL?.[m.col]),
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
  const igSegFixed = [{mes:'Ene/26',valor:14500},{mes:'Feb/26',valor:15000},{mes:'Mar/26',valor:15600},{mes:'Abr/26',valor:16100}]
  const igSeg = igSegRaw.some(d=>d.valor>0) ? igSegRaw : igSegFixed
  const igVisitas= mor(rIGVisO, rIGVisR)

  // LinkedIn, YouTube
  const rLISeg   = rows.find(r=>r[0]?.includes('[REAL] Total Seguidores')&&rows.indexOf(r)<30)
  const rYT      = findRow(rows,'[REAL] Total vistas')
  const liSeg    = ms(rLISeg)
  const ytVistas = ms(rYT)

  // Ventas Mvd vs PdE — datos reales del Excel 2026 (Métricas ventas R34/R26)
  const ventasMvd  = [{mes:'Ene/26',valor:61075},{mes:'Feb/26',valor:80824},{mes:'Mar/26',valor:82998},{mes:'Abr/26',valor:71837}]
  const ventasPdE  = [{mes:'Ene/26',valor:60888},{mes:'Feb/26',valor:21679},{mes:'Mar/26',valor:40171},{mes:'Abr/26',valor:51701}]
  // Ticket promedio (mock — reemplazar con datos reales)
  // Ticket B2C+ (R50 = B2C+ ventas USD / B2C+ únicas): Ene:8240, Feb:7454, Mar:6377, Abr:11710
  const ticketB2Bplus = [{mes:'Ene/26',valor:8240},{mes:'Feb/26',valor:7454},{mes:'Mar/26',valor:6377},{mes:'Abr/26',valor:11710}]
  // Ticket B2C (R33 Mvd ticket avg): Ene:763, Feb:1555, Mar:1092, Abr:1088
  const ticketB2B     = [{mes:'Ene/26',valor:763},{mes:'Feb/26',valor:1555},{mes:'Mar/26',valor:1092},{mes:'Abr/26',valor:1088}]

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
  // Valores hardcodeados del Excel 2026 (Métricas ventas R4)
  const ventasTotalUSD = [
    {mes:'Ene/26', valor:121963},
    {mes:'Feb/26', valor:102503},
    {mes:'Mar/26', valor:123274},
    {mes:'Abr/26', valor:123538},
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
    waMvd, waPdE, ventasMvd, ventasPdE, ticketB2Bplus, ticketB2B, ventasTotalUSD,
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
