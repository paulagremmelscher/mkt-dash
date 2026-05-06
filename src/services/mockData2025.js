/**
 * data2025.js — Datos REALES del Excel CDI_ROYAL_marketing_2025.xlsx
 * Hardcodeado — no requiere conexión externa.
 * 
 * Columnas: Ene=C(2), Feb=D(3), Mar=E(4), Abr=G(6), May=H(7), Jun=I(8),
 *           Jul=K(10), Ago=L(11), Sep=M(12), Oct=O(14), Nov=P(15), Dic=Q(16)
 */

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

  const inversionMensual = series([1550,844,1730,2242,2409,2984,2907,3560,3572,3557,3780,2674])

  const invPorCanal = M.map((mes, i) => ({
    mes,
    Google:          [1550,844, 845, 971,1600,2100,2200,2575,2950,2860,3180,2114][i] || 0,
    Meta:            [0,   0,   885, 933, 338, 423, 226, 191, 175.7,196, 213, 194][i] || 0,
    LinkedIn:        [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0  ][i] || 0,
    'Mercado Libre': [0,   0,   0,   337.6,471.3,461.1,480.9,794,446,501.3,386.7,365.9][i] || 0,
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

  // ── WA Mvd (R139): 50, 50, 50, 150, 233, 320, 380, 271, 326, 441, 406, 308
  const waMvd = series([50,50,50,150,233,320,380,271,326,441,406,308])

  // ── WA PdE (R147): 50, 50, 50, 95, 95, 64, 104, 128, 106, 151, 120, 149
  const waPdE = series([50,50,50,95,95,64,104,128,106,151,120,149])

  // ── WA Total (R155 = Mvd + PdE):
  const leadsWA = M.map((mes,i) => ({
    mes, real: waMvd[i].valor + waPdE[i].valor
  }))

  // ── LLAMADAS (R188): 133, 103, 116, 96, 113, 108, 138, 161, 130, 180, 200, 190
  const llamadas = M.map((mes,i) => ({
    mes, real: [133,103,116,96,113,108,138,161,130,180,200,190][i]||0
  }))

  // ── TOTAL LEADS (R196 = IG + WA-tot + Form + Llamadas)
  const totalLeads = M.map((mes,i) => {
    const v = leadsIG[i].real + leadsWA[i].real + leadsForm[i].real + llamadas[i].real
    return { mes, valor: v }
  })

  // ── VENTAS ÚNICAS (R197): 69, 60, 73, 88, 64, 91, 117, 123, 124, 124, 114, 114
  const ventas = series([69,60,73,88,64,91,117,123,124,124,114,114])

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

  // ── VENTAS TOTALES USD (hoja Métricas ventas, R4):
  //    87579, 101232, 102299, 96646, 68045, 154060, 177653, 154869, 133303, 155718, 184359, 180278
  const ventasTotalUSD = series([87579,101232,102299,96646,68045,154060,177653,154869,133303,155718,184359,180278])

  // ── VENTAS PUNTA ticket promedio (R25): 1572, 6496, 2042, 1031, 1501, 2001, 2027, 2027, 1290, 1193, 2340, null
  const ticketPunta = series([1572,6496,2042,1031,1501,2001,2027,2027,1290,1193,2340,0])

  // ── VENTAS MVD ticket promedio (R33): 1137, 947, 1235, 1116, 941, 1637, 1387, 861, 980, 1265, 1297, 0
  const ticketMvd = series([1137,947,1235,1116,941,1637,1387,861,980,1265,1297,0])

  // ── VENTAS B2B ventas únicas (R49): 4, 4, 4, 3, 2, 8, 12, 7, 1, 6, 6, 0
  const ventasUnicasB2B = series([4,4,4,3,2,8,12,7,1,6,6,0])

  // ── VENTAS B2C ventas únicas (R55): 65, 58, 69, 84, 62, 85, 105, 117, 122, 117, 107, 0
  const ventasUnicasB2C = series([65,58,69,84,62,85,105,117,122,117,107,0])

  // ── TICKET B2B promedio (R50 = B2B ventas USD / B2B únicas):
  //    31721/4=7930, 38854/4=9713, 29725/4=7431, 22719/3=7573, 14063/2=7032, 72113/8=9014
  //    91440/12=7620, 72541/7=10363, 15595/1=15595, 45489/6=7582, 63633/6=10605, 0
  const ticketB2B = series([7930,9713,7431,7573,7032,9014,7620,10363,15595,7582,10605,0])

  // ── TICKET B2C promedio (R56 = B2C ventas USD / B2C únicas):
  //    55858/65=859, 62378/58=1075, 72574/69=1051, 73927/84=880, 53982/62=871, 81947/85=964
  //    86213/105=821, 82328/117=704, 117708/122=964, 110229/117=942, 120726/107=1129, 0
  const ticketB2C = series([859,1075,1051,880,871,964,821,704,964,942,1129,0])

  // Ventas Mvd y PdE (estimado: del total B2C, Mvd ~60% PdE ~40% por tickets)
  // Usando datos reales de ticket: Punta tiene ticket más alto => menos unidades
  const ventasMvd = M.map((mes,i) => ({
    mes, valor: ventasUnicasB2C[i].valor
  }))  // placeholder — se usa en gráfico combinado
  const ventasPdE = M.map((mes,i) => ({
    mes, valor: ventasUnicasB2B[i].valor  // B2B como proxy PdE (donde se concentra)
  }))

  // Conv rate real por mes
  const convSeries = M.map((mes,i) => {
    const l = totalLeads[i].valor
    const v = ventas[i].valor
    return { mes, leads:l, ventas:v, convRate: l>0 ? v/l*100 : 0 }
  })

  // Tabla resumen
  const tableData = M.map((mes,i) => ({
    mes,
    inversion: inversionMensual[i].valor,
    leads:     totalLeads[i].valor,
    ventas:    ventas[i].valor,
    trafico:   webTraffic[i].real,
    convRate:  convSeries[i].convRate,
    cpl:       totalLeads[i].valor>0 ? inversionMensual[i].valor/totalLeads[i].valor : 0,
  }))

  return {
    inversionMensual, invPorCanal, webTraffic,
    leadsForm, leadsIG, leadsWA, waMvd, waPdE, llamadas, totalLeads,
    ventas, igSeg, igVisitas, liSeg, ytVistas,
    ventasTotalUSD, ventasMvd, ventasPdE,
    ticketB2B, ticketB2C, ticketPunta, ticketMvd,
    ventasUnicasB2B, ventasUnicasB2C,
    convSeries, tableData,
    canalTotals: [
      {canal:'Google',        valor:[1550,844,845,971,1600,2100,2200,2575,2950,2860,3180,2114].reduce((s,v)=>s+v,0)},
      {canal:'Meta',          valor:[0,0,885,933,338,423,226,191,175.7,196,213,194].reduce((s,v)=>s+v,0)},
      {canal:'Mercado Libre', valor:[0,0,0,337.6,471.3,461.1,480.9,794,446,501.3,386.7,365.9].reduce((s,v)=>s+v,0)},
    ],
  }
}
