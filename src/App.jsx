import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, ComposedChart,
} from 'recharts'
import {
  TrendingUp, Users, Globe, ShoppingBag, DollarSign, Phone,
  MessageCircle, Instagram, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Youtube, Linkedin as LIIcon,
} from 'lucide-react'
import { useDashboardData } from './hooks/useDashboardData'
import { formatCurrency, formatNumber, formatPercent } from './utils/formatters'

// ── Paleta Royal ─────────────────────────────────────────────────
const C = {
  green:   '#95C11F', greenD:  '#7AA318', greenM: '#5D8010',
  greenL:  '#B8DC5A', greenXL: '#D4EE96', greenBg: '#EEF8D4',
  gray:    '#575756', grayL:   '#8A8A89', grayXL: '#D8E8B8',
  bg:      '#F4F7EE', surface: '#FAFDF5', border: '#D8E8B8',
  black:   '#1C1C1B',
}
const CH = { v1:'#95C11F', v2:'#7AA318', v3:'#B8DC5A', v4:'#D4EE96', g1:'#8A8A89', g2:'#C8DFA0' }
const CANAL_C = { Google: CH.v2, Meta: CH.v1, LinkedIn: CH.v3, 'Mercado Libre': CH.g1 }

// ── Logo Royal SVG — fiel al original verde ───────────────────────
// Isotipo: forma de R compacta. Cuerpo verde con corte diagonal gris.
// Sin palo izquierdo — la R nace de una sola pieza.
function RoyalLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cuerpo principal verde: palo izq + arco superior + pata diagonal */}
      {/* Palo vertical izquierdo */}
      <rect x="10" y="8" width="22" height="84" rx="5" fill="#95C11F"/>
      {/* Arco superior (barriga de la R) */}
      <path d="M32 8 H62 Q90 8 90 34 Q90 58 62 58 H32 Z" fill="#95C11F"/>
      {/* Pata diagonal */}
      <polygon points="32,54 56,54 86,92 62,92" fill="#95C11F"/>
      {/* Corte diagonal — color gris oscuro que cruza diagonalmente */}
      <polygon points="44,8 62,8 32,58 14,58" fill="#575756" opacity="0.55"/>
    </svg>
  )
}

// ── Tooltip ──────────────────────────────────────────────────────
function RT({ active, payload, label, prefix='', suffix='' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px',boxShadow:'0 4px 16px rgba(87,119,22,0.12)',minWidth:140}}>
      <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.14em',color:C.grayL,marginBottom:6}}>{label}</p>
      {payload.map((p,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginBottom:2}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:p.color,flexShrink:0}}/>
            <span style={{fontSize:11,color:C.grayL}}>{p.name}</span>
          </div>
          <span style={{fontSize:11,fontWeight:500,color:C.black}}>
            {prefix}{typeof p.value==='number'?p.value.toLocaleString('es-UY'):p.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  )
}

function DonutLabel({cx,cy,midAngle,innerRadius,outerRadius,percent}) {
  if(percent<0.06)return null
  const R=Math.PI/180,r=innerRadius+(outerRadius-innerRadius)*0.55
  const x=cx+r*Math.cos(-midAngle*R),y=cy+r*Math.sin(-midAngle*R)
  return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>{(percent*100).toFixed(0)}%</text>
}

function Loading() {
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,border:`2px solid ${C.border}`,borderTopColor:C.green,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{color:C.gray,fontSize:13}}>Cargando datos…</p>
      </div>
    </div>
  )
}

function ErrorState({message}) {
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div className="card" style={{padding:32,maxWidth:420,width:'100%',textAlign:'center'}}>
        <AlertCircle size={28} color="#E24B4A" style={{margin:'0 auto 12px'}}/>
        <p style={{fontSize:16,fontWeight:500,marginBottom:8}}>Error al cargar datos</p>
        <p style={{fontSize:13,color:C.gray,marginBottom:16}}>{message}</p>
        <button onClick={()=>window.location.reload()} style={{background:C.green,color:'#fff',border:'none',borderRadius:10,padding:'8px 20px',fontSize:13,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6}}>
          <RefreshCw size={13}/> Reintentar
        </button>
      </div>
    </div>
  )
}

function Section({title,icon:Icon,children,open:initOpen=true}) {
  const [open,setOpen]=useState(initOpen)
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:8,marginBottom:open?16:0,background:'none',border:'none',cursor:'pointer',padding:0,width:'100%',textAlign:'left'}}>
        {Icon&&<Icon size={16} color={C.green}/>}
        <span style={{fontSize:16,fontWeight:500,color:C.black}}>{title}</span>
        <span style={{marginLeft:'auto',color:C.grayL}}>{open?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</span>
      </button>
      {open&&children}
    </div>
  )
}

// KPI card estándar
function KCard({label,value,sub,pct,icon:Icon,inv=false}) {
  const isPos=pct>0,isNeutral=pct===null||pct===undefined
  return (
    <div className="card" style={{padding:'18px 16px',background:inv?C.black:C.surface,borderColor:inv?C.black:C.border,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.15em',fontWeight:500,color:C.grayL}}>{label}</span>
        {Icon&&<div style={{width:26,height:26,borderRadius:7,background:inv?'rgba(149,193,31,0.2)':C.greenBg,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={12} color={inv?C.greenL:C.greenD}/></div>}
      </div>
      <div>
        <div style={{fontSize:'1.75rem',fontWeight:300,lineHeight:1,color:inv?'#fff':C.black,letterSpacing:'-0.02em'}}>{value}</div>
        {sub&&<div style={{fontSize:11,marginTop:4,color:C.grayL}}>{sub}</div>}
      </div>
      {!isNeutral&&(
        <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,padding:'2px 8px',borderRadius:999,background:isPos?(inv?'rgba(149,193,31,0.2)':C.greenBg):'rgba(226,75,74,0.1)',color:isPos?(inv?C.greenL:C.greenD):'#A32D2D',width:'fit-content'}}>
          {isPos?'▲':'▼'} {Math.abs(pct||0).toFixed(1)}% vs 2025
        </span>
      )}
    </div>
  )
}

// Botón métrica seleccionable (para gráfico interactivo)
function MBtn({label,value,sub,active,onClick}) {
  return (
    <button onClick={onClick} style={{display:'flex',flexDirection:'column',gap:3,padding:'12px 14px',background:active?C.greenBg:C.surface,border:`1.5px solid ${active?C.green:C.border}`,borderRadius:12,cursor:'pointer',textAlign:'left',width:'100%',transition:'all 0.15s'}}>
      <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.14em',color:active?C.greenD:C.grayL,fontWeight:500}}>{label}</span>
      <span style={{fontSize:'1.3rem',fontWeight:300,color:active?C.greenD:C.black,lineHeight:1}}>{value}</span>
      {sub&&<span style={{fontSize:10,color:active?C.greenM:C.grayL}}>{sub}</span>}
    </button>
  )
}

function CC({title,sub,children,style={}}) {
  return (
    <div className="card" style={{padding:'18px 16px',...style}}>
      {(title||sub)&&<div style={{marginBottom:14}}>{title&&<p style={{fontSize:14,fontWeight:500,color:C.black,margin:0}}>{title}</p>}{sub&&<p style={{fontSize:11,color:C.grayL,margin:'2px 0 0'}}>{sub}</p>}</div>}
      {children}
    </div>
  )
}

function growthPct(v26,v25) {
  if(!v25||v25===0)return null
  return((v26-v25)/v25)*100
}

const MAP_MONTHS={'Ene/26':'Ene/25','Feb/26':'Feb/25','Mar/26':'Mar/25','Abr/26':'Abr/25'}

// ─────────────────────────────────────────────────────────────────
export default function App() {
  const {data,loading,error}=useDashboardData()
  const [selMonth,setSelMonth]=useState('Abr/26')

  // Métricas activas por sección (para gráfico interactivo)
  const [invMetric,  setInvMetric]  = useState('totalInv')
  const [brandMetric,setBrandMetric]= useState('igSeg')
  const [ventaMetric,setVentaMetric]= useState('ventas')
  const [leadsMetric,setLeadsMetric]= useState('totalLeads')

  if(loading)return <Loading/>
  if(error)return <ErrorState message={error}/>

  const {d2026,d2025}=data
  const allMonths=d2026.invTotal?.map(d=>d.mes)||[]
  const prevMonth=MAP_MONTHS[selMonth]

  // ── Helper: valor de un mes ────────────────────────────────────
  function gv(series,mes,key='valor'){
    return series?.find(d=>d.mes===mes)?.[key]||0
  }

  // ── Valores del mes seleccionado 2026 ─────────────────────────
  const mInv26    = gv(d2026.invTotal,    selMonth)
  const mInv25    = gv(d2025.inversionMensual, prevMonth)
  const mLeads26  = gv(d2026.totalLeads,  selMonth)
  const mLeads25  = gv(d2025.totalLeads,  prevMonth)
  const mVentas26 = gv(d2026.ventas,      selMonth)
  const mVentas25 = gv(d2025.ventas,      prevMonth)
  const mTraf26   = gv(d2026.webTraffic,  selMonth,'real')
  const mTraf25   = gv(d2025.webTraffic,  prevMonth,'real')
  const mForm26   = gv(d2026.leadsForm,   selMonth,'real')
  const mWA26     = gv(d2026.leadsWA,     selMonth,'real')
  const mIG26     = gv(d2026.leadsIG,     selMonth,'real')
  const mCall26   = gv(d2026.llamadas,    selMonth,'real')
  const mIGSeg26  = gv(d2026.igSeg,       selMonth)
  const mIGSeg25  = gv(d2025.igSeg,       prevMonth)
  const mIGVis26  = gv(d2026.igVisitas,   selMonth,'real')
  const mIGVis25  = gv(d2025.igVisitas,   prevMonth,'real')
  const mLI26     = gv(d2026.liSeg,       selMonth)
  const mLI25     = gv(d2025.liSeg,       prevMonth)
  const mYT26     = gv(d2026.ytVistas,    selMonth)
  const mYT25     = gv(d2025.ytVistas,    prevMonth)
  const mMvd26    = gv(d2026.ventasMvd,   selMonth)
  const mPdE26    = gv(d2026.ventasPdE,   selMonth)
  const mConvRate = mLeads26>0 ? mVentas26/mLeads26*100 : 0

  // ── Canal mix del mes seleccionado ────────────────────────────
  const mCanalMix = (() => {
    const row = d2026.invPorCanal?.find(d=>d.mes===selMonth)||{}
    return [
      {canal:'Google',        valor:row.Google||0},
      {canal:'Meta',          valor:row.Meta||0},
      {canal:'LinkedIn',      valor:row.LinkedIn||0},
      {canal:'Mercado Libre', valor:row['Mercado Libre']||0},
    ].filter(d=>d.valor>0)
  })()

  // ── Serie comparativa año móvil para un campo ─────────────────
  function yearSeries(series26,series25,vk='valor') {
    return (series26||[]).map(d=>{
      const pm=MAP_MONTHS[d.mes]
      const v25 = (series25||[]).find(x=>x.mes===pm)?.[vk] || (series25||[]).find(x=>x.mes===pm)?.valor || 0
      return {mes:d.mes,'2026':d[vk]||d.valor||0,'2025':v25}
    })
  }

  // ── Inversión: métricas disponibles ──────────────────────────
  const invMetrics = [
    {id:'totalInv', label:'Inversión total', value:formatCurrency(mInv26), sub:`${prevMonth}: ${formatCurrency(mInv25)}`, pct:growthPct(mInv26,mInv25),
     series: yearSeries(d2026.invTotal, d2025.inversionMensual), yFmt:v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`, prefix:'USD '},
    {id:'cpl', label:'CPL (costo por lead)', value:formatCurrency(mLeads26>0?mInv26/mLeads26:0,1), sub:'Costo por lead', pct:null,
     series: yearSeries(d2026.invTotal?.map((d,i)=>({...d,valor:gv(d2026.totalLeads,d.mes)>0?d.valor/gv(d2026.totalLeads,d.mes):0})),
       d2025.inversionMensual?.map((d,i)=>({...d,valor:gv(d2025.totalLeads,d.mes)>0?d.valor/gv(d2025.totalLeads,d.mes):0}))),
     yFmt:v=>`$${v.toFixed(0)}`, prefix:'USD '},
    {id:'trafico', label:'Tráfico web', value:formatNumber(mTraf26), sub:`${prevMonth}: ${formatNumber(mTraf25)}`, pct:growthPct(mTraf26,mTraf25),
     series: yearSeries(d2026.webTraffic?.map(d=>({mes:d.mes,valor:d.real})), d2025.webTraffic?.map(d=>({mes:d.mes,valor:d.real}))),
     yFmt:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v, prefix:''},
    {id:'cpa', label:'CPA (costo por venta)', value:formatCurrency(mVentas26>0?mInv26/mVentas26:0,1), sub:'Costo por venta', pct:null,
     series: yearSeries(d2026.invTotal?.map(d=>({...d,valor:gv(d2026.ventas,d.mes)>0?d.valor/gv(d2026.ventas,d.mes):0})),
       d2025.inversionMensual?.map(d=>({...d,valor:gv(d2025.ventas,d.mes)>0?d.valor/gv(d2025.ventas,d.mes):0}))),
     yFmt:v=>`$${v.toFixed(0)}`, prefix:'USD '},
  ]
  const activeInv = invMetrics.find(m=>m.id===invMetric)||invMetrics[0]

  // ── Brand Awareness: métricas ─────────────────────────────────
  const brandMetrics = [
    {id:'igSeg',     label:'IG Seguidores',    icon:Instagram, value:formatNumber(mIGSeg26),  sub:`${prevMonth}: ${formatNumber(mIGSeg25)}`,  pct:growthPct(mIGSeg26,mIGSeg25),
     series: yearSeries(d2026.igSeg, d2025.igSeg)},
    {id:'igVisitas', label:'Visitas perfil IG', icon:Instagram, value:formatNumber(mIGVis26),  sub:`${prevMonth}: ${formatNumber(mIGVis25)}`,  pct:growthPct(mIGVis26,mIGVis25),
     series: yearSeries(d2026.igVisitas?.map(d=>({mes:d.mes,valor:d.real})), d2025.igVisitas?.map(d=>({mes:d.mes,valor:d.real})))},
    {id:'liSeg',     label:'LinkedIn Seg.',     icon:LIIcon,    value:formatNumber(mLI26),      sub:`${prevMonth}: ${formatNumber(mLI25)}`,      pct:growthPct(mLI26,mLI25),
     series: yearSeries(d2026.liSeg, d2025.liSeg)},
    {id:'ytVistas',  label:'YouTube Vistas',    icon:Youtube,   value:formatNumber(mYT26),      sub:`${prevMonth}: ${formatNumber(mYT25)}`,      pct:growthPct(mYT26,mYT25),
     series: yearSeries(d2026.ytVistas, d2025.ytVistas)},
    {id:'trafWeb',   label:'Tráfico Web',        icon:Globe,     value:formatNumber(mTraf26),    sub:`${prevMonth}: ${formatNumber(mTraf25)}`,    pct:growthPct(mTraf26,mTraf25),
     series: yearSeries(d2026.webTraffic?.map(d=>({mes:d.mes,valor:d.real})), d2025.webTraffic?.map(d=>({mes:d.mes,valor:d.real})))},
  ]
  const activeBrand = brandMetrics.find(m=>m.id===brandMetric)||brandMetrics[0]

  // ── Leads: métricas interactivas ────────────────────────────────
  const mWAMvd26  = gv(d2026.waMvd,   selMonth)
  const mWAPdE26  = gv(d2026.waPdE,   selMonth)
  const leadsMetrics = [
    {id:'totalLeads', label:'Leads totales',    value:formatNumber(mLeads26),  sub:`${prevMonth}: ${formatNumber(mLeads25)}`,  pct:growthPct(mLeads26,mLeads25),
     series: yearSeries(d2026.totalLeads, d2025.totalLeads)},
    {id:'formularios',label:'Formularios web',  value:formatNumber(mForm26),   sub:`${prevMonth}: ${formatNumber(gv(d2025.leadsForm,prevMonth,'real'))}`,  pct:growthPct(mForm26,gv(d2025.leadsForm,prevMonth,'real')),
     series: yearSeries(d2026.leadsForm?.map(d=>({mes:d.mes,valor:d.real})), d2025.leadsForm?.map(d=>({mes:d.mes,valor:d.real})))},
    {id:'whatsapp',   label:'WhatsApp total',   value:formatNumber(mWA26),     sub:`${prevMonth}: ${formatNumber(gv(d2025.leadsWA,prevMonth,'real'))}`,     pct:growthPct(mWA26,gv(d2025.leadsWA,prevMonth,'real')),
     series: yearSeries(d2026.leadsWA?.map(d=>({mes:d.mes,valor:d.real})), d2025.leadsWA?.map(d=>({mes:d.mes,valor:d.real})))},


    {id:'llamadas',   label:'Llamadas entr.',   value:formatNumber(mCall26),   sub:`${prevMonth}: ${formatNumber(gv(d2025.llamadas,prevMonth,'real'))}`,    pct:growthPct(mCall26,gv(d2025.llamadas,prevMonth,'real')),
     series: yearSeries(d2026.llamadas?.map(d=>({mes:d.mes,valor:d.real})), d2025.llamadas?.map(d=>({mes:d.mes,valor:d.real})))},
  ]
  const activeLead = leadsMetrics.find(m=>m.id===leadsMetric)||leadsMetrics[0]

  // ── Ventas: métricas ──────────────────────────────────────────
  const mTickB2B26 = gv(d2026.ticketB2Bplus, selMonth)
  const mTickB2B25 = gv(d2025.ticketB2B, prevMonth)
  const mTickB2C26 = gv(d2026.ticketB2B, selMonth)
  const mTickB2C25 = gv(d2025.ticketB2C, prevMonth)

  const ventaMetrics = [
    {id:'ventas',  label:'Ventas únicas',    value:formatNumber(mVentas26),  sub:`${prevMonth}: ${formatNumber(mVentas25)}`,  pct:growthPct(mVentas26,mVentas25),
     series: yearSeries(d2026.ventas, d2025.ventas), yFmt:v=>v, prefix:''},
    {id:'convRate',label:'Conv. Rate',        value:formatPercent(mConvRate), sub:'Leads → Ventas', pct:null,
     series: (d2026.convSeries||[]).map(d=>{const pm=MAP_MONTHS[d.mes];const l25=gv(d2025.totalLeads,pm);const v25=gv(d2025.ventas,pm);return{mes:d.mes,'2026':d.convRate||0,'2025':l25>0?v25/l25*100:0}}),
     yFmt:v=>`${v.toFixed(1)}%`, suffix:'%'},
    {id:'cpa',     label:'CPA',               value:formatCurrency(mVentas26>0?mInv26/mVentas26:0,1), sub:'Costo por venta', pct:null,
     series: yearSeries(d2026.ventas?.map(d=>({mes:d.mes,valor:gv(d2026.ventas,d.mes)>0?gv(d2026.invTotal,d.mes)/gv(d2026.ventas,d.mes):0})),
       d2025.ventas?.map(d=>({mes:d.mes,valor:gv(d2025.ventas,d.mes)>0?gv(d2025.inversionMensual,d.mes)/gv(d2025.ventas,d.mes):0}))),
     yFmt:v=>`$${v.toFixed(0)}`, prefix:'USD '},
    {id:'tickB2B', label:'Ticket B2B+',       value:formatCurrency(mTickB2B26,0), sub:`${prevMonth}: ${formatCurrency(mTickB2B25,0)}`, pct:growthPct(mTickB2B26,mTickB2B25),
     series: yearSeries(d2026.ticketB2Bplus, d2025.ticketB2B), yFmt:v=>`$${v>=1000?(v/1000).toFixed(1)+'k':v}`, prefix:'USD '},
    {id:'tickB2C', label:'Ticket B2C',         value:formatCurrency(mTickB2C26,0), sub:`${prevMonth}: ${formatCurrency(mTickB2C25,0)}`, pct:growthPct(mTickB2C26,mTickB2C25),
     series: yearSeries(d2026.ticketB2B, d2025.ticketB2C), yFmt:v=>`$${v>=1000?(v/1000).toFixed(1)+'k':v}`, prefix:'USD '},
    {id:'ventasUSD',label:'Ventas USD totales',value:formatCurrency(gv(d2026.ventasTotalUSD||[],selMonth)||0,0),
     sub:`${prevMonth}: ${formatCurrency(gv(d2025.ventasTotalUSD,prevMonth)||0,0)}`,
     pct:growthPct(gv(d2026.ventasTotalUSD||[],selMonth),gv(d2025.ventasTotalUSD,prevMonth)),
     series: yearSeries(d2026.ventasTotalUSD||[], d2025.ventasTotalUSD||[]),
     yFmt:v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`, prefix:'USD '},
    {id:'mvdPdE',  label:'Mvd vs PdE',         value:`${formatNumber(mMvd26)} / ${formatNumber(mPdE26)}`, sub:'Unidades Mvd / PdE', pct:null,
     series: d2026.ventasMvd?.map((d,i)=>({mes:d.mes,'Mvd 26':d.valor,'PdE 26':d2026.ventasPdE?.[i]?.valor||0,'Mvd 25':gv(d2025.ventasUnicasB2C,MAP_MONTHS[d.mes]),'PdE 25':gv(d2025.ventasUnicasB2B,MAP_MONTHS[d.mes])})),
     isMulti:true},
  ]
  const activeVenta = ventaMetrics.find(m=>m.id===ventaMetric)||ventaMetrics[0]

  // ── Gráfico de línea/área universal ──────────────────────────
  function AreaSeries({series, yFmt, prefix='', suffix='', height=220}) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={series} margin={{top:4,right:4,left:-10,bottom:0}}>
          <defs>
            <linearGradient id="ga26" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CH.v1} stopOpacity={0.22}/><stop offset="95%" stopColor={CH.v1} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="ga25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CH.g1} stopOpacity={0.10}/><stop offset="95%" stopColor={CH.g1} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
          <XAxis dataKey="mes" tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false} tickFormatter={yFmt||(v=>v)}/>
          <Tooltip content={<RT prefix={prefix} suffix={suffix}/>}/>
          <Legend wrapperStyle={{paddingTop:8,fontSize:11}}/>
          {/* 2025 primero = queda debajo; 2026 al final = queda encima visualmente */}
          <Area type="monotone" dataKey="2025" stroke={CH.g1} strokeWidth={1.5} strokeDasharray="5 3" fill="url(#ga25)" dot={false}/>
          <Area type="monotone" dataKey="2026" stroke={CH.v1} strokeWidth={2.5} fill="url(#ga26)" dot={{fill:CH.v1,r:3,strokeWidth:0}} activeDot={{r:5,strokeWidth:0}}/>
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Gráfico multi-barra para Mvd vs PdE
  function MultiBarSeries({series,height=220}) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={series} margin={{top:4,right:4,left:-10,bottom:0}} barGap={3} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
          <XAxis dataKey="mes" tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
          <Tooltip content={<RT/>}/>
          <Legend wrapperStyle={{paddingTop:8,fontSize:11}}/>
          <Bar dataKey="Mvd 25" fill={CH.v4} radius={[2,2,0,0]} barSize={9}/>
          <Bar dataKey="Mvd 26" fill={CH.v1} radius={[2,2,0,0]} barSize={9}/>
          <Bar dataKey="PdE 25" fill={CH.g2} radius={[2,2,0,0]} barSize={9}/>
          <Bar dataKey="PdE 26" fill={CH.v2} radius={[2,2,0,0]} barSize={9}/>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:'Roboto,sans-serif'}}>

      {/* ══ HEADER ═════════════════════════════════════════════ */}
      <header style={{background:C.black}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <RoyalLogo size={40}/>
            <div>
              <div style={{display:'flex',alignItems:'baseline',gap:8}}>
                <span style={{color:'#fff',fontWeight:700,letterSpacing:'0.16em',fontSize:15,textTransform:'uppercase'}}>ROYAL</span>
                <span style={{color:C.green,fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',fontWeight:500}}>Dashboard</span>
              </div>
              <p style={{fontSize:9,color:C.grayL,letterSpacing:'0.14em',textTransform:'uppercase',margin:0}}>Más valor para su proyecto</p>
            </div>
          </div>
          {/* Titular central */}
          <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',textAlign:'center',pointerEvents:'none'}}>
            <p style={{color:'#fff',fontSize:13,fontWeight:400,letterSpacing:'0.04em',margin:0,opacity:0.85}}>Resumen Mensual de métricas Marketing</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:C.grayL}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:C.green,display:'inline-block'}}/>
            Datos en vivo · Google Sheets
          </div>
        </div>
        <div style={{height:2,background:`linear-gradient(90deg,${C.greenD},${C.green},${C.greenL})`}}/>
      </header>

      <main style={{maxWidth:1280,margin:'0 auto',padding:'22px 24px',display:'flex',flexDirection:'column',gap:24}}>

        {/* ── SELECTOR DE MES ────────────────────────────────── */}
        <div className="card" style={{padding:'12px 18px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
            <div>
              <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.15em',color:C.grayL,margin:0}}>Período analizado</p>
              <p style={{fontSize:15,fontWeight:500,color:C.black,margin:'2px 0 0'}}>
                {selMonth} vs {prevMonth}
                <span style={{fontSize:11,color:C.grayL,fontWeight:400,marginLeft:8}}>— comparación año anterior</span>
              </p>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {allMonths.map(m=>(
                <button key={m} onClick={()=>setSelMonth(m)}
                  style={{padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:500,cursor:'pointer',transition:'all 0.15s',
                    background:selMonth===m?C.green:'transparent',color:selMonth===m?'#fff':C.gray,border:`1px solid ${selMonth===m?C.green:C.border}`}}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 1. INVERSIÓN ══════════════════════════════════════ */}
        <Section title="Inversión en Medios" icon={DollarSign}>
          <p style={{fontSize:11,color:C.grayL,marginTop:-8,marginBottom:14}}>Clic en una métrica para ver su evolución mensual comparada con 2025</p>
          <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:16,marginBottom:16}}>
            {/* Botones métricas inversión */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {invMetrics.map(m=>(
                <MBtn key={m.id} label={m.label} value={m.value} sub={m.pct!==null&&m.pct!==undefined?`${m.pct>=0?'▲':'▼'} ${Math.abs(m.pct).toFixed(1)}% vs 2025`:m.sub} active={invMetric===m.id} onClick={()=>setInvMetric(m.id)}/>
              ))}
            </div>
            {/* Gráfico dinámico */}
            <CC title={`${activeInv.label} — ${selMonth} vs ${prevMonth}`} sub="Evolución mensual comparada">
              <AreaSeries series={activeInv.series} yFmt={activeInv.yFmt} prefix={activeInv.prefix} height={230}/>
            </CC>
          </div>

          {/* Inversión por canal + donut del mes */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
            <CC title={`Inversión por canal — ${selMonth}`} sub="Desglose del mes en USD">
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={[d2026.invPorCanal?.find(d=>d.mes===selMonth)||{}].filter(d=>Object.keys(d).length>1)}
                  margin={{top:4,right:4,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="mes" tick={{fontSize:11,fill:C.grayL}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:C.grayL}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`}/>
                  <Tooltip content={<RT prefix="USD "/>}/>
                  <Legend wrapperStyle={{paddingTop:8}}/>
                  {Object.entries(CANAL_C).map(([c,col])=>(
                    <Bar key={c} dataKey={c} fill={col} radius={[4,4,0,0]}/>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CC>

            <CC title={`Mix canales — ${selMonth}`} sub="Distribución del mes">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={mCanalMix} dataKey="valor" nameKey="canal" cx="50%" cy="50%" innerRadius={40} outerRadius={66} paddingAngle={2} labelLine={false} label={DonutLabel}>
                    {mCanalMix.map((d,i)=><Cell key={i} fill={CANAL_C[d.canal]||[CH.v1,CH.v2,CH.v3,CH.g1][i%4]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>[`USD ${v.toLocaleString('es-UY')}`]} contentStyle={{fontFamily:'Roboto',fontSize:12,borderRadius:10,border:`1px solid ${C.border}`}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6}}>
                {mCanalMix.map((d,i)=>{
                  const tot=mCanalMix.reduce((s,x)=>s+x.valor,0)
                  return(
                    <div key={d.canal} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:8,height:8,borderRadius:'50%',background:CANAL_C[d.canal]||[CH.v1,CH.v2,CH.v3,CH.g1][i%4]}}/>
                        <span style={{fontSize:11,color:C.gray}}>{d.canal}</span>
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        <span style={{fontSize:11,fontWeight:500}}>{formatCurrency(d.valor)}</span>
                        <span style={{fontSize:10,color:C.grayL}}>{tot>0?((d.valor/tot)*100).toFixed(0):0}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CC>
          </div>
        </Section>

        {/* ══ 2. BRAND AWARENESS ════════════════════════════════ */}
        <Section title="Brand Awareness" icon={Globe} open={false}>
          <p style={{fontSize:11,color:C.grayL,marginTop:-8,marginBottom:14}}>Clic en una métrica para ver su evolución comparada con 2025</p>
          <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:16}}>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {brandMetrics.map(m=>(
                <MBtn key={m.id} label={m.label} value={m.value} sub={m.pct!==null&&m.pct!==undefined?`${m.pct>=0?'▲':'▼'} ${Math.abs(m.pct).toFixed(1)}% vs 2025`:`${selMonth}`} active={brandMetric===m.id} onClick={()=>setBrandMetric(m.id)}/>
              ))}
            </div>
            <CC title={`${activeBrand.label} — ${selMonth} vs ${prevMonth}`} sub="Evolución mensual comparada">
              <AreaSeries series={activeBrand.series} height={290}/>
            </CC>
          </div>
        </Section>

        {/* ══ 3. LEADS ══════════════════════════════════════════ */}
        <Section title="Leads y Canales de Contacto" icon={Users} open={false}>
          <p style={{fontSize:11,color:C.grayL,marginTop:-8,marginBottom:14}}>Clic en una métrica para ver su evolución comparada con 2025</p>
          <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:16,marginBottom:14}}>
            {/* Botones métricas leads */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {leadsMetrics.map(m=>(
                <MBtn key={m.id} label={m.label} value={m.value}
                  sub={m.pct!==null&&m.pct!==undefined?`${m.pct>=0?'▲':'▼'} ${Math.abs(m.pct).toFixed(1)}% vs 2025`:m.sub}
                  active={leadsMetric===m.id} onClick={()=>setLeadsMetric(m.id)}/>
              ))}
            </div>
            {/* Gráfico dinámico */}
            <CC title={`${activeLead.label} — ${selMonth} vs ${prevMonth}`} sub="Evolución mensual comparada">
              <AreaSeries series={activeLead.series} height={300}/>
            </CC>
          </div>

          {/* Mix del mes */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
            <CC title={`Mix de leads — ${selMonth}`} sub="Distribución del mes por canal">
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={[
                      {name:'Formularios',valor:mForm26},{name:'WhatsApp',valor:mWA26},
                      {name:'Instagram', valor:mIG26}, {name:'Llamadas',valor:mCall26},
                    ].filter(d=>d.valor>0)} dataKey="valor" nameKey="name"
                      cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={2} labelLine={false} label={DonutLabel}>
                      {[CH.v1,CH.v2,CH.v3,CH.g1].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip formatter={v=>[formatNumber(v)]} contentStyle={{fontFamily:'Roboto',fontSize:12,borderRadius:10,border:`1px solid ${C.border}`}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
                  {[{n:'Formularios',v:mForm26,c:CH.v1},{n:'WhatsApp',v:mWA26,c:CH.v2},{n:'Instagram',v:mIG26,c:CH.v3},{n:'Llamadas',v:mCall26,c:CH.g1}]
                    .filter(d=>d.v>0).map(d=>{
                      const tot=mForm26+mWA26+mIG26+mCall26||1
                      return(
                        <div key={d.n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 10px',background:C.bg,borderRadius:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:d.c}}/><span style={{fontSize:12,color:C.black,fontWeight:500}}>{d.n}</span>
                          </div>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <span style={{fontSize:13,fontWeight:600,color:C.greenD}}>{formatNumber(d.v)}</span>
                            <span style={{fontSize:10,color:C.grayL,background:C.greenBg,padding:'1px 6px',borderRadius:999}}>{((d.v/tot)*100).toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </CC>
            <CC title="Leads totales" sub={`${selMonth} vs ${prevMonth}`}>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <span style={{fontSize:10,color:C.grayL,textTransform:'uppercase',letterSpacing:'0.12em'}}>2026</span>
                  <span style={{fontSize:'1.8rem',fontWeight:300,color:C.greenD}}>{formatNumber(mLeads26)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <span style={{fontSize:10,color:C.grayL,textTransform:'uppercase',letterSpacing:'0.12em'}}>2025</span>
                  <span style={{fontSize:'1.3rem',fontWeight:300,color:C.grayL}}>{formatNumber(mLeads25)}</span>
                </div>
                {growthPct(mLeads26,mLeads25)!==null&&(
                  <span style={{alignSelf:'flex-end',display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:500,padding:'3px 10px',borderRadius:999,background:growthPct(mLeads26,mLeads25)>=0?C.greenBg:'rgba(226,75,74,0.1)',color:growthPct(mLeads26,mLeads25)>=0?C.greenD:'#A32D2D'}}>
                    {growthPct(mLeads26,mLeads25)>=0?'▲':'▼'} {Math.abs(growthPct(mLeads26,mLeads25)).toFixed(1)}% vs 2025
                  </span>
                )}
              </div>
            </CC>
          </div>
        </Section>

        {/* ══ 4. VENTAS ═════════════════════════════════════════ */}
        <Section title="Ventas — Análisis Principal" icon={ShoppingBag} open={true}>
          {/* Banner destacado del mes */}
          <div style={{background:'linear-gradient(135deg,#1C2A08 0%,#2A3A10 100%)',borderRadius:16,padding:'20px 20px',marginBottom:16}}>
            <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.16em',color:C.grayL,margin:'0 0 14px'}}>{selMonth} vs {prevMonth}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14}}>
              {[
                {label:`Ventas ${selMonth}`,val:formatNumber(mVentas26),sub:`${prevMonth}: ${formatNumber(mVentas25)}`,pct:growthPct(mVentas26,mVentas25)},
                {label:'Conv. Rate',val:formatPercent(mConvRate),sub:'Leads → Ventas',pct:null},
                {label:'CPA',val:formatCurrency(mVentas26>0?mInv26/mVentas26:0,1),sub:'Costo por venta',pct:null},
                {label:'Inversión',val:formatCurrency(mInv26),sub:`${prevMonth}: ${formatCurrency(mInv25)}`,pct:growthPct(mInv26,mInv25)},
                {label:'Mvd / PdE',val:`${formatNumber(mMvd26)} / ${formatNumber(mPdE26)}`,sub:'Unidades por ciudad',pct:null},
              ].map((k,i)=>(
                <div key={i}>
                  <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.14em',color:C.grayL,margin:'0 0 4px'}}>{k.label}</p>
                  <p style={{fontSize:'1.8rem',fontWeight:300,color:'#fff',lineHeight:1,letterSpacing:'-0.02em',margin:'0 0 3px'}}>{k.val}</p>
                  <p style={{fontSize:11,color:C.grayL,margin:0}}>{k.sub}</p>
                  {k.pct!==null&&<span style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,padding:'2px 8px',borderRadius:999,background:(k.pct||0)>=0?'rgba(149,193,31,0.2)':'rgba(226,75,74,0.1)',color:(k.pct||0)>=0?C.greenL:'#F09595'}}>
                    {(k.pct||0)>=0?'▲':'▼'} {Math.abs(k.pct||0).toFixed(1)}%
                  </span>}
                </div>
              ))}
            </div>
          </div>

          <p style={{fontSize:11,color:C.grayL,marginBottom:14}}>Clic en una métrica para ver su evolución comparada con 2025</p>
          <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:16}}>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {ventaMetrics.map(m=>(
                <MBtn key={m.id} label={m.label} value={m.value} sub={m.pct!==null&&m.pct!==undefined?`${m.pct>=0?'▲':'▼'} ${Math.abs(m.pct).toFixed(1)}% vs 2025`:m.sub} active={ventaMetric===m.id} onClick={()=>setVentaMetric(m.id)}/>
              ))}
            </div>
            <CC title={`${activeVenta.label} — evolución mensual`} sub={`${selMonth} vs ${prevMonth}`}>
              {activeVenta.isMulti
                ? <MultiBarSeries series={activeVenta.series} height={290}/>
                : <AreaSeries series={activeVenta.series} yFmt={activeVenta.yFmt} prefix={activeVenta.prefix} suffix={activeVenta.suffix||''} height={290}/>
              }
            </CC>
          </div>

          {/* Gráfico histórico multi-año Ene-Abr */}
          <CC title="Ventas totales — comparativo histórico" sub="Ene a Abr · 2021–2026 · USD consolidadas Mvd + PdE" style={{marginTop:14}}>
            {(() => {
              // 🔧 Datos históricos hardcodeados — reemplazar col. 2021-2024 cuando estén disponibles
              // Completar con datos reales de cada año cuando se disponga de ellos
              // 2025 datos reales del Excel; 2026 del Google Sheet en vivo
              // ✅ Datos reales de la hoja "Ventas mensuales x año" del Excel 2026
              const HIST = [
                {mes:'Ene', '2021':34509, '2022':45220, '2023':150590,'2024':41423,
                  '2025':87579,  '2026': gv(d2026.ventasTotalUSD||[], 'Ene/26') || 121963},
                {mes:'Feb', '2021':66773, '2022':104600,'2023':146061,'2024':72094,
                  '2025':101231, '2026': gv(d2026.ventasTotalUSD||[], 'Feb/26') || 102503},
                {mes:'Mar', '2021':77143, '2022':116672,'2023':134950,'2024':56016,
                  '2025':102299, '2026': gv(d2026.ventasTotalUSD||[], 'Mar/26') || 123169},
                {mes:'Abr', '2021':73759, '2022':84848, '2023':85868, '2024':107902,
                  '2025':96646,  '2026': gv(d2026.ventasTotalUSD||[], 'Abr/26') || 123538},
              ]
              const YEARS = ['2021','2022','2023','2024','2025','2026']
              const YCOLS = [CH.g1+'80','#C8DFA0','#B8DC5A','#95C11F88',CH.g1,CH.v1]
              const YWID  = [1,1.5,1.5,1.5,1.5,3]
              const YDASH = ['6 4','6 4','4 3','4 3','3 3','0']
              return (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={HIST} margin={{top:8,right:16,left:-10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                    <XAxis dataKey="mes" tick={{fontSize:11,fill:C.grayL}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}
                      tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`}/>
                    <Tooltip content={<RT prefix="USD "/>}/>
                    <Legend wrapperStyle={{paddingTop:10,fontSize:11}}/>
                    {YEARS.map((y,i)=>(
                      <Line key={y} type="monotone" dataKey={y}
                        stroke={YCOLS[i]} strokeWidth={YWID[i]}
                        strokeDasharray={YDASH[i]}
                        dot={y==='2026'?{fill:CH.v1,r:5,strokeWidth:0}:false}
                        activeDot={{r:5,strokeWidth:0}}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )
            })()}

          </CC>

          {/* Tabla detalle */}
          <CC title="Detalle mensual" sub="" style={{marginTop:14}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    {['Período','Inversión','Leads','Ventas','Mvd','PdE','Conv. Rate','CPL','CPA'].map(h=>(
                      <th key={h} style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.14em',color:C.grayL,textAlign:'left',paddingBottom:9,paddingRight:10,fontWeight:500,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d2026.tableData||[]).map((r,i)=>{
                    const mvd=d2026.ventasMvd?.find(d=>d.mes===r.mes)?.valor||0
                    const pde=d2026.ventasPdE?.find(d=>d.mes===r.mes)?.valor||0
                    const cr=r.convRate||0
                    const isSelected=r.mes===selMonth
                    return(
                      <tr key={r.mes} style={{borderBottom:`1px solid ${i%2===0?C.border:'transparent'}`,background:isSelected?C.greenBg:i%2===1?C.greenBg+'33':'transparent'}}>
                        <td style={{padding:'9px 10px 9px 0',fontWeight:isSelected?600:500,color:isSelected?C.greenD:C.black}}>{r.mes}{isSelected&&<span style={{marginLeft:6,fontSize:9,background:C.green,color:'#fff',padding:'1px 6px',borderRadius:999}}>selec.</span>}</td>
                        <td style={{padding:'9px 10px 9px 0',color:C.gray}}>{r.inversion>0?formatCurrency(r.inversion):'—'}</td>
                        <td style={{padding:'9px 10px 9px 0',color:C.gray}}>{r.leads>0?formatNumber(r.leads):'—'}</td>
                        <td style={{padding:'9px 10px 9px 0'}}>{r.ventas>0?<span style={{background:C.greenBg,color:C.greenD,padding:'2px 8px',borderRadius:999,fontSize:11,fontWeight:500}}>{formatNumber(r.ventas)}</span>:'—'}</td>
                        <td style={{padding:'9px 10px 9px 0',color:C.gray}}>{mvd>0?formatNumber(mvd):'—'}</td>
                        <td style={{padding:'9px 10px 9px 0',color:C.gray}}>{pde>0?formatNumber(pde):'—'}</td>
                        <td style={{padding:'9px 10px 9px 0'}}>{cr>0?<span style={{background:cr>=15?C.greenBg:'#FFF3E0',color:cr>=15?C.greenD:'#E65100',padding:'2px 8px',borderRadius:999,fontSize:11,fontWeight:500}}>{cr.toFixed(1)}%</span>:'—'}</td>
                        <td style={{padding:'9px 10px 9px 0',color:C.gray}}>{r.cpl>0?formatCurrency(r.cpl,1):'—'}</td>
                        <td style={{padding:'9px 10px 9px 0',color:C.gray}}>{r.ventas>0&&r.inversion>0?formatCurrency(r.inversion/r.ventas,1):'—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CC>
        </Section>

      </main>

      <footer style={{marginTop:20,borderTop:`1px solid ${C.border}`,background:C.surface}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <RoyalLogo size={18}/>
            <span style={{color:C.greenD,fontWeight:600,fontSize:12,letterSpacing:'0.12em'}}>ROYAL</span>
            <span style={{fontSize:11,color:C.grayL}}>· Más valor para su proyecto</span>
          </div>
          <span style={{fontSize:11,color:C.grayL}}>Fuente: Google Sheets · Datos en tiempo real</span>
        </div>
      </footer>
    </div>
  )
}
