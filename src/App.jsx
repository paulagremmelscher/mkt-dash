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
import { jsPDF } from 'jspdf'
import { QUALITY_MONTHLY, QUALITY_TOTAL, Q_COLORS, Q_LABELS } from './services/leadQualityData'
import { CORRELACION, CORR_SERIES } from './services/correlacionData'
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

// ── Logo Royal SVG — R verde con corte diagonal negro ─────────────
// Forma exacta del isotipo: semicírculo superior derecho + palo diagonal
// que baja a la izquierda + pata diagonal abajo-derecha.
// Corte diagonal negro que atraviesa de arriba-derecha a abajo-izquierda.
function RoyalLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cuerpo principal verde de la R */}
      {/* Bloque izquierdo + arco superior */}
      <path d="M12 6 H58 Q88 6 88 33 Q88 58 60 60 L12 60 Z" fill="#95C11F"/>
      {/* Pata diagonal abajo-derecha */}
      <polygon points="28,56 52,56 82,99 58,99" fill="#95C11F"/>
      {/* Corte diagonal negro — característica del logo */}
      <polygon points="38,6 62,6 38,60 14,60" fill="#1C1C1B"/>
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
function KCard({label,value,sub,pct,icon:Icon,inv=false,momPct,momLabel,pctLabel}) {
  const isPos=pct>0,isNeutral=pct===null||pct===undefined
  const isDark = inv===true || inv==='gray'
  const isGreenBg = inv==='green'
  const bg = isGreenBg ? C.green : (isDark ? C.gray : C.surface)
  const txtColor = (isGreenBg||isDark) ? '#fff' : C.black
  return (
    <div className="card" style={{padding:'18px 16px',background:bg,borderColor:bg===C.surface?C.border:bg,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.15em',fontWeight:500,color:(isGreenBg||isDark)?'rgba(255,255,255,0.75)':C.grayL}}>{label}</span>
        {Icon&&<div style={{width:26,height:26,borderRadius:7,background:(isGreenBg||isDark)?'rgba(255,255,255,0.2)':C.greenBg,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={12} color={(isGreenBg||isDark)?'#fff':C.greenD}/></div>}
      </div>
      <div>
        <div style={{fontSize:'1.75rem',fontWeight:300,lineHeight:1,color:txtColor,letterSpacing:'-0.02em'}}>{value}</div>
        {sub&&<div style={{fontSize:11,marginTop:4,color:(isGreenBg||isDark)?'rgba(255,255,255,0.75)':C.grayL}}>{sub}</div>}
      </div>
      {!isNeutral&&(
        <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,padding:'2px 8px',borderRadius:999,background:isPos?((isGreenBg||isDark)?'rgba(255,255,255,0.2)':C.greenBg):'rgba(226,75,74,0.1)',color:isPos?((isGreenBg||isDark)?'#fff':C.greenD):'#A32D2D',width:'fit-content'}}>
          {isPos?'▲':'▼'} {Math.abs(pct||0).toFixed(1)}% {pctLabel||'vs 2025'}
        </span>
      )}
      {momPct!==null&&momPct!==undefined&&(
        <span style={{fontSize:10,fontWeight:500,color:(isGreenBg||isDark)?'rgba(255,255,255,0.85)':(momPct>=0?C.greenD:'#A32D2D')}}>
          {momPct>=0?'▲':'▼'} {Math.abs(momPct).toFixed(1)}% {momLabel||''}
        </span>
      )}
    </div>
  )
}

// Botón métrica seleccionable (para gráfico interactivo)
function MBtn({label,value,sub,active,onClick,momPct,momLabel}) {
  const momPos = momPct > 0
  return (
    <button onClick={onClick} style={{display:'flex',flexDirection:'column',gap:3,padding:'12px 14px',background:active?C.greenBg:C.surface,border:`1.5px solid ${active?C.green:C.border}`,borderRadius:12,cursor:'pointer',textAlign:'left',width:'100%',transition:'all 0.15s'}}>
      <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.14em',color:active?C.greenD:C.grayL,fontWeight:500}}>{label}</span>
      <span style={{fontSize:'1.3rem',fontWeight:300,color:active?C.greenD:C.black,lineHeight:1}}>{value}</span>
      {sub&&<span style={{fontSize:10,color:active?C.greenM:C.grayL}}>{sub}</span>}
      {momPct!==null&&momPct!==undefined&&(
        <span style={{fontSize:10,fontWeight:500,color:momPos?C.greenD:'#A32D2D'}}>
          {momPos?'▲':'▼'} {Math.abs(momPct).toFixed(1)}% {momLabel||''}
        </span>
      )}
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

const MAP_MONTHS={'Ene/26':'Ene/25','Feb/26':'Feb/25','Mar/26':'Mar/25','Abr/26':'Abr/25','May/26':'May/25','Jun/26':'Jun/25','Jul/26':'Jul/25','Ago/26':'Ago/25','Sep/26':'Sep/25','Oct/26':'Oct/25','Nov/26':'Nov/25','Dic/26':'Dic/25'}


// ── Lead Quality Section Component ──────────────────────────────
function LeadQualitySection({ selMonth, C, CH }) {
  const mData = QUALITY_MONTHLY.find(d => d.mes === selMonth)
    || QUALITY_MONTHLY[QUALITY_MONTHLY.length - 1]

  const total = mData ? mData.total : 0
  const pctAB = total > 0 ? Math.round((mData.A + mData.B) / total * 100) : 0
  const pctA  = total > 0 ? Math.round(mData.A / total * 100) : 0

  const donutData = ['A','B','C','D'].map(k => ({
    name: `Cat. ${k}`, valor: mData?.[k] || 0
  })).filter(d => d.valor > 0)

  const barData = QUALITY_MONTHLY.map(d => ({
    mes: d.mes, A: d.A, B: d.B, C: d.C, D: d.D,
    'A+B': d.A + d.B, pctAB: Math.round((d.A+d.B)/d.total*100)
  }))

  return (
    <>
      <p style={{fontSize:11,color:C.grayL,marginTop:-8,marginBottom:16}}>
        Scoring automático por contenido del mensaje · A=alto, B=medio, C=tibio, D=frío
      </p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          {label:`Leads formulario ${selMonth}`, value: total > 0 ? total : '—', sub:'Total del mes', inv:true},
          {label:'Calificados A+B', value: total > 0 ? `${pctAB}%` : '—', sub:`${(mData?.A||0)+(mData?.B||0)} leads`, inv:false},
          {label:'Cat. A — Alto', value: total > 0 ? `${pctA}%` : '—', sub:`${mData?.A || 0} leads`, inv:false},
          {label:'Cat. B — Medio', value: total > 0 ? `${Math.round((mData?.B||0)/total*100)}%` : '—', sub:`${mData?.B || 0} leads`, inv:false},
        ].map((k,i) => (
          <div key={i} className="card" style={{padding:'18px 16px',background:k.inv?C.gray:C.surface,borderColor:k.inv?C.gray:C.border,display:'flex',flexDirection:'column',gap:8}}>
            <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.14em',fontWeight:500,color:C.grayL}}>{k.label}</span>
            <span style={{fontSize:'1.75rem',fontWeight:300,lineHeight:1,color:k.inv?'#fff':C.black,letterSpacing:'-0.02em'}}>{k.value}</span>
            <span style={{fontSize:11,color:C.grayL}}>{k.sub}</span>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card" style={{padding:'18px 16px'}}>
          <div style={{marginBottom:14}}>
            <p style={{fontSize:14,fontWeight:500,color:C.black,margin:0}}>Distribución de calidad mensual</p>
            <p style={{fontSize:11,color:C.grayL,margin:'2px 0 0'}}>Leads por categoría A/B/C/D</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{top:4,right:4,left:-10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:9,fill:C.grayL}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{fontFamily:'Roboto',fontSize:12,borderRadius:10,border:`1px solid ${C.border}`}}/>
              <Legend wrapperStyle={{paddingTop:8,fontSize:11}}/>
              <Bar dataKey="A" stackId="s" fill={Q_COLORS.A} radius={[0,0,0,0]}/>
              <Bar dataKey="B" stackId="s" fill={Q_COLORS.B} radius={[0,0,0,0]}/>
              <Bar dataKey="C" stackId="s" fill={Q_COLORS.C} radius={[0,0,0,0]}/>
              <Bar dataKey="D" stackId="s" fill={Q_COLORS.D} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{padding:'18px 16px'}}>
          <div style={{marginBottom:14}}>
            <p style={{fontSize:14,fontWeight:500,color:C.black,margin:0}}>% Leads calificados (A+B)</p>
            <p style={{fontSize:11,color:C.grayL,margin:'2px 0 0'}}>Evolución mensual</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={barData} margin={{top:4,right:4,left:-10,bottom:0}}>
              <defs>
                <linearGradient id="gAB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.22}/>
                  <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:9,fill:C.grayL}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} domain={[0,100]}/>
              <Tooltip formatter={v=>[`${v}%`,'Calificados A+B']} contentStyle={{fontFamily:'Roboto',fontSize:12,borderRadius:10,border:`1px solid ${C.border}`}}/>
              <Area type="monotone" dataKey="pctAB" name="% A+B" stroke={C.green} strokeWidth={2.5} fill="url(#gAB)" dot={{fill:C.green,r:4,strokeWidth:0}} activeDot={{r:6,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
        <div className="card" style={{padding:'18px 16px'}}>
          <div style={{marginBottom:14}}>
            <p style={{fontSize:14,fontWeight:500,color:C.black,margin:0}}>Mix calidad — {selMonth}</p>
            <p style={{fontSize:11,color:C.grayL,margin:'2px 0 0'}}>Distribución del mes</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} dataKey="valor" nameKey="name"
                cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                paddingAngle={2} labelLine={false} label={DonutLabel}>
                {donutData.map((d,i)=><Cell key={i} fill={Object.values(Q_COLORS)[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>[v,'leads']} contentStyle={{fontFamily:'Roboto',fontSize:12,borderRadius:10,border:`1px solid ${C.border}`}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6}}>
            {['A','B','C','D'].map(k=>(
              <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:Q_COLORS[k]}}/>
                  <span style={{fontSize:11,color:C.gray}}>Cat. {k}</span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:12,fontWeight:500}}>{mData?.[k]||0}</span>
                  <span style={{fontSize:10,color:C.grayL}}>{total>0?Math.round((mData?.[k]||0)/total*100):0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{padding:'18px 16px'}}>
          <div style={{marginBottom:14}}>
            <p style={{fontSize:14,fontWeight:500,color:C.black,margin:0}}>Criterios de clasificación</p>
            <p style={{fontSize:11,color:C.grayL,margin:'2px 0 0'}}>Scoring automático por contenido del mensaje</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {Object.entries(Q_LABELS).map(([k,desc])=>(
              <div key={k} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 12px',background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
                <span style={{minWidth:28,height:28,borderRadius:8,background:Q_COLORS[k],display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0}}>{k}</span>
                <div>
                  <p style={{margin:0,fontSize:12,fontWeight:500,color:C.black}}>{desc.split('—')[0]}</p>
                  <p style={{margin:'2px 0 0',fontSize:11,color:C.grayL}}>{desc.split('—')[1]}</p>
                </div>
                <div style={{marginLeft:'auto',textAlign:'right'}}>
                  <p style={{margin:0,fontSize:13,fontWeight:600,color:Q_COLORS[k]}}>{QUALITY_TOTAL[k]}</p>
                  <p style={{margin:0,fontSize:10,color:C.grayL}}>total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}



// ─────────────────────────────────────────────────────────────────
export default function App() {
  const {data,loading,error}=useDashboardData()
  const [selMonth,setSelMonth]=useState('Abr/26')  // se actualiza al cargar datos

  // Métricas activas por sección (para gráfico interactivo)
  const [brandMetric,setBrandMetric]= useState('igSeg')
  const [ventaMetric,setVentaMetric]= useState('ventas')
  const [leadsMetric,setLeadsMetric]= useState('totalLeads')

  if(loading)return <Loading/>
  if(error)return <ErrorState message={error}/>

  const {d2026,d2025}=data
  const allMonths=d2026.invTotal?.map(d=>d.mes)||[]
  
  // Auto-seleccionar el último mes disponible si el mes actual no tiene datos
  const latestMonth = allMonths.length > 0 ? allMonths[allMonths.length-1] : 'Abr/26'
  const effectiveMonth = allMonths.includes(selMonth) ? selMonth : latestMonth
  const prevMonth = MAP_MONTHS[effectiveMonth]||'Abr/25'
  // Mes anterior en 2026 (para conclusiones)
  const idxCur = allMonths.indexOf(effectiveMonth)
  const prevMonth2026 = idxCur > 0 ? allMonths[idxCur-1] : null

  // ── Helper: valor de un mes ────────────────────────────────────
  function gv(series,mes,key='valor'){
    return series?.find(d=>d.mes===mes)?.[key]||0
  }

  // ── Valores del mes seleccionado 2026 ─────────────────────────
  const mInv26    = gv(d2026.invTotal,    effectiveMonth)
  const mInv25    = gv(d2025.inversionMensual, prevMonth)
  const mLeads26  = gv(d2026.totalLeads,  effectiveMonth)
  const mLeads25  = gv(d2025.totalLeads,  prevMonth)
  const mVentas26 = gv(d2026.ventas,      effectiveMonth)
  const mVentas25 = gv(d2025.ventas,      prevMonth)
  const mTraf26   = gv(d2026.webTraffic,  effectiveMonth,'real')
  const mTraf25   = gv(d2025.webTraffic,  prevMonth,'real')
  const mForm26   = gv(d2026.leadsForm,   effectiveMonth,'real')
  const mWA26     = gv(d2026.leadsWA,     effectiveMonth,'real')
  const mIG26     = gv(d2026.leadsIG,     effectiveMonth,'real')
  const mCall26   = gv(d2026.llamadas,    effectiveMonth,'real')
  const mIGSeg26  = gv(d2026.igSeg,       effectiveMonth)
  const mIGSeg25  = gv(d2025.igSeg,       prevMonth)
  const mIGVis26  = gv(d2026.igVisitas,   effectiveMonth,'real')
  const mIGVis25  = gv(d2025.igVisitas,   prevMonth,'real')
  const mLI26     = gv(d2026.liSeg,       effectiveMonth)
  const mLI25     = gv(d2025.liSeg,       prevMonth)
  const mYT26     = gv(d2026.ytVistas,    effectiveMonth)
  const mYT25     = gv(d2025.ytVistas,    prevMonth)
  const mMvd26    = gv(d2026.ventasMvd,   effectiveMonth)
  const mPdE26    = gv(d2026.ventasPdE,   effectiveMonth)
  // CPL del mes — leer directo de la planilla (más preciso que recalcular)
  const mCPL26 = d2026.convSeries?.find(d=>d.mes===effectiveMonth)?.cpl || (mLeads26>0 ? mInv26/mLeads26 : 0)
  const mCPL25 = d2025.convSeries?.find(d=>d.mes===prevMonth)?.cpl || (mLeads25>0 ? mInv25/mLeads25 : 0)
  const mConvRate = mLeads26>0 ? mVentas26/mLeads26*100 : 0

  // ── Canal mix del mes seleccionado ────────────────────────────
  const mCanalMix = (() => {
    const row = d2026.invPorCanal?.find(d=>d.mes===effectiveMonth)||{}
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
  // Inversión: solo el total — gráfico barras 2025 vs 2026
  const invBarSeries = d2026.invTotal?.map(d => {
    const pm = MAP_MONTHS[d.mes]
    return { mes: d.mes, '2026': d.valor, '2025': gv(d2025.inversionMensual, pm) }
  }) || []

  // ── Brand Awareness: métricas ─────────────────────────────────
  // Helper: valor del mes anterior en 2026
  function getPrevMonth2026(series, mes, key='valor') {
    const idx = allMonths.indexOf(mes)
    if (idx <= 0) return null
    const prevM = allMonths[idx - 1]
    return series?.find(d=>d.mes===prevM)?.[key] || null
  }

  const igSegPrevMoM  = getPrevMonth2026(d2026.igSeg, effectiveMonth)
  const igVisPrevMoM  = getPrevMonth2026(d2026.igVisitas?.map(d=>({mes:d.mes,valor:d.real})), effectiveMonth)
  const liPrevMoM     = getPrevMonth2026(d2026.liSeg, effectiveMonth)
  const ytPrevMoM     = getPrevMonth2026(d2026.ytVistas, effectiveMonth)
  const trafPrevMoM   = getPrevMonth2026(d2026.webTraffic?.map(d=>({mes:d.mes,valor:d.real})), effectiveMonth)

  const brandMetrics = [
    {id:'igSeg',     label:'IG Seguidores',    icon:Instagram, value:formatNumber(mIGSeg26),
     sub:`${prevMonth}: ${formatNumber(mIGSeg25)}`, pct:growthPct(mIGSeg26,mIGSeg25),
     momPct: growthPct(mIGSeg26, igSegPrevMoM), momLabel: 'vs mes ant. 2026',
     series: yearSeries(d2026.igSeg, d2025.igSeg)},
    {id:'igVisitas', label:'Visitas perfil IG', icon:Instagram, value:formatNumber(mIGVis26),
     sub:`${prevMonth}: ${formatNumber(mIGVis25)}`, pct:growthPct(mIGVis26,mIGVis25),
     momPct: growthPct(mIGVis26, igVisPrevMoM), momLabel: 'vs mes ant. 2026',
     series: yearSeries(d2026.igVisitas?.map(d=>({mes:d.mes,valor:d.real})), d2025.igVisitas?.map(d=>({mes:d.mes,valor:d.real})))},
    {id:'liSeg',     label:'LinkedIn Seg.',     icon:LIIcon,    value:formatNumber(mLI26),
     sub:`${prevMonth}: ${formatNumber(mLI25)}`, pct:growthPct(mLI26,mLI25),
     momPct: growthPct(mLI26, liPrevMoM), momLabel: 'vs mes ant. 2026',
     series: yearSeries(d2026.liSeg, d2025.liSeg)},
    {id:'ytVistas',  label:'YouTube Vistas',    icon:Youtube,   value:formatNumber(mYT26),
     sub:`${prevMonth}: ${formatNumber(mYT25)}`, pct:growthPct(mYT26,mYT25),
     momPct: growthPct(mYT26, ytPrevMoM), momLabel: 'vs mes ant. 2026',
     series: yearSeries(d2026.ytVistas, d2025.ytVistas)},
    {id:'trafWeb',   label:'Tráfico Web',        icon:Globe,     value:formatNumber(mTraf26),
     sub:`${prevMonth}: ${formatNumber(mTraf25)}`, pct:growthPct(mTraf26,mTraf25),
     momPct: growthPct(mTraf26, trafPrevMoM), momLabel: 'vs mes ant. 2026',
     series: yearSeries(d2026.webTraffic?.map(d=>({mes:d.mes,valor:d.real})), d2025.webTraffic?.map(d=>({mes:d.mes,valor:d.real})))},
  ]
  const activeBrand = brandMetrics.find(m=>m.id===brandMetric)||brandMetrics[0]

  // ── Leads: métricas interactivas ────────────────────────────────
  const mWAMvd26  = gv(d2026.waMvd,   effectiveMonth)
  const mWAPdE26  = gv(d2026.waPdE,   effectiveMonth)
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
  const mTickPdE26  = gv(d2026.ticketB2Bplus, effectiveMonth)  // Ticket Punta del Este
  const mTickMvd26  = gv(d2026.ticketB2B,     effectiveMonth)  // Ticket Montevideo
  const mTickPdE25  = gv(d2025.ticketPunta,   prevMonth)
  const mTickMvd25  = gv(d2025.ticketMvd,     prevMonth)
  const mVentasTotUSD26 = gv(d2026.ventasTotalUSD||[], effectiveMonth)
  const mVentasTotUSD25 = gv(d2025.ventasTotalUSD,      prevMonth)
  const mROAS26 = gv(d2026.roasSeries||[], effectiveMonth)
  const mMvdUSD26 = gv(d2026.ventasMvd, effectiveMonth)
  const mPdEUSD26 = gv(d2026.ventasPdE, effectiveMonth)

  const ventaMetrics = [
    {id:'ventasUSD', label:'Ventas USD totales',    value:formatCurrency(mVentasTotUSD26,0),
     sub:`${prevMonth}: ${formatCurrency(mVentasTotUSD25,0)}`, pct:growthPct(mVentasTotUSD26,mVentasTotUSD25),
     series: yearSeries(d2026.ventasTotalUSD||[], d2025.ventasTotalUSD||[]),
     yFmt:v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`, prefix:'USD '},
    {id:'ventas',    label:'Ventas únicas',           value:formatNumber(mVentas26),
     sub:`${prevMonth}: ${formatNumber(mVentas25)}`, pct:growthPct(mVentas26,mVentas25),
     series: yearSeries(d2026.ventas, d2025.ventas), yFmt:v=>v, prefix:''},
    {id:'mvdPdE',    label:'Mvd vs PdE (USD)',        value:`${formatCurrency(mMvdUSD26,0)} / ${formatCurrency(mPdEUSD26,0)}`,
     sub:'Ventas USD por ciudad', pct:null,
     series: d2026.ventasMvd?.map((d,i)=>({mes:d.mes,'Mvd 26':d.valor,'PdE 26':d2026.ventasPdE?.[i]?.valor||0,
       'Mvd 25':gv(d2025.ventasTotalUSD,MAP_MONTHS[d.mes])*0.62||0,
       'PdE 25':gv(d2025.ventasTotalUSD,MAP_MONTHS[d.mes])*0.38||0})),
     isMulti:true},
    {id:'roas',      label:'ROAS',                    value:mROAS26>0?`${mROAS26}x`:'—',
     sub:'Retorno sobre inversión', pct:null,
     series: (d2026.roasSeries||[]).map(d=>({mes:d.mes,'2026':d.valor})),
     onlyCurrentYear:true,
     yFmt:v=>`${v}x`, prefix:''},
    {id:'tickPdE',   label:'Ticket promedio B2B',   value:formatCurrency(mTickPdE26,0),
     sub:`${prevMonth}: ${formatCurrency(mTickPdE25,0)}`, pct:growthPct(mTickPdE26,mTickPdE25),
     series: yearSeries(d2026.ticketB2Bplus, d2025.ticketPunta||[]),
     yFmt:v=>`$${v>=1000?(v/1000).toFixed(1)+'k':v}`, prefix:'USD '},
    {id:'tickMvd',   label:'Ticket promedio B2C',        value:formatCurrency(mTickMvd26,0),
     sub:`${prevMonth}: ${formatCurrency(mTickMvd25,0)}`, pct:growthPct(mTickMvd26,mTickMvd25),
     series: yearSeries(d2026.ticketB2B, d2025.ticketMvd||[]),
     yFmt:v=>`$${v>=1000?(v/1000).toFixed(1)+'k':v}`, prefix:'USD '},
    {id:'convRate',  label:'Conv. Rate',               value:formatPercent(mConvRate), sub:'Leads → Ventas', pct:null,
     series: (d2026.convSeries||[]).map(d=>{const pm=MAP_MONTHS[d.mes];const l25=gv(d2025.totalLeads,pm);const v25=gv(d2025.ventas,pm);return{mes:d.mes,'2026':d.convRate||0,'2025':l25>0?v25/l25*100:0}}),
     yFmt:v=>`${v.toFixed(1)}%`, suffix:'%'},
  ]
  const activeVenta = ventaMetrics.find(m=>m.id===ventaMetric)||ventaMetrics[0]

  // ── Gráfico de línea/área universal ──────────────────────────
  function AreaSeries({series, yFmt, prefix='', suffix='', height=220, onlyCurrentYear=false}) {
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
          {!onlyCurrentYear && <Area type="monotone" dataKey="2025" stroke={CH.g1} strokeWidth={1.5} strokeDasharray="5 3" fill="url(#ga25)" dot={false}/>}
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
          {/* 2025 = grises | 2026 = verdes */}
          <Bar dataKey="Mvd 25" fill={C.grayXL} radius={[2,2,0,0]} barSize={9}/>
          <Bar dataKey="Mvd 26" fill={CH.v1} radius={[2,2,0,0]} barSize={9}/>
          <Bar dataKey="PdE 25" fill={C.grayL} radius={[2,2,0,0]} barSize={9}/>
          <Bar dataKey="PdE 26" fill={CH.v2} radius={[2,2,0,0]} barSize={9}/>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // ── Generar informe PDF del mes seleccionado ──────────────────
  function generatePDF() {
    const doc = new jsPDF()
    const GREEN = [149,193,31]
    const GRAY  = [87,87,86]
    const LGRAY = [138,138,137]
    let y = 20

    // Header
    doc.setFillColor(...GREEN)
    doc.rect(0,0,210,18,'F')
    doc.setTextColor(255,255,255)
    doc.setFontSize(14); doc.setFont(undefined,'bold')
    doc.text('ROYAL ARQUITECTURA', 14, 11)
    doc.setFontSize(9); doc.setFont(undefined,'normal')
    doc.text('Resumen Mensual de Métricas Marketing', 14, 16)

    y = 28
    doc.setTextColor(30,30,30)
    doc.setFontSize(16); doc.setFont(undefined,'bold')
    doc.text(`Informe ${effectiveMonth}`, 14, y)
    doc.setFontSize(10); doc.setFont(undefined,'normal')
    doc.setTextColor(...LGRAY)
    doc.text(`Comparativo vs ${prevMonth}${prevMonth2026?` y vs ${prevMonth2026} (mes anterior 2026)`:''}`, 14, y+6)
    y += 16

    function section(title) {
      doc.setFillColor(240,248,224)
      doc.rect(14, y-5, 182, 8, 'F')
      doc.setTextColor(...GRAY)
      doc.setFontSize(11); doc.setFont(undefined,'bold')
      doc.text(title, 16, y)
      y += 10
      doc.setFont(undefined,'normal')
    }

    function row(label, val26, val25, valPrev) {
      doc.setFontSize(10)
      doc.setTextColor(60,60,60)
      doc.text(label, 16, y)
      doc.setTextColor(...GREEN)
      doc.setFont(undefined,'bold')
      doc.text(String(val26), 100, y, {align:'right'})
      doc.setFont(undefined,'normal')
      doc.setTextColor(...LGRAY)
      doc.text(`vs ${prevMonth}: ${val25}`, 145, y)
      if (valPrev !== undefined) doc.text(`vs ${prevMonth2026||'-'}: ${valPrev}`, 145, y+4.5)
      y += valPrev !== undefined ? 11 : 7
    }

    // INVERSIÓN
    section('INVERSIÓN EN MEDIOS')
    row('Inversión total (USD)', formatCurrency(mInv26), formatCurrency(mInv25),
      prevMonth2026 ? formatCurrency(gv(d2026.invTotal,prevMonth2026)) : undefined)
    y += 3

    // BRAND AWARENESS
    section('BRAND AWARENESS')
    row('IG Seguidores', formatNumber(mIGSeg26), formatNumber(mIGSeg25), igSegPrevMoM?formatNumber(igSegPrevMoM):'-')
    row('Visitas perfil IG', formatNumber(mIGVis26), formatNumber(mIGVis25), igVisPrevMoM?formatNumber(igVisPrevMoM):'-')
    row('LinkedIn Seguidores', formatNumber(mLI26), formatNumber(mLI25), liPrevMoM?formatNumber(liPrevMoM):'-')
    row('YouTube Vistas', formatNumber(mYT26), formatNumber(mYT25), ytPrevMoM?formatNumber(ytPrevMoM):'-')
    row('Tráfico Web', formatNumber(mTraf26), formatNumber(mTraf25), trafPrevMoM?formatNumber(trafPrevMoM):'-')
    y += 3

    // LEADS
    section('LEADS Y CANALES DE CONTACTO')
    row('Leads totales', formatNumber(mLeads26), formatNumber(mLeads25),
      prevMonth2026 ? formatNumber(gv(d2026.totalLeads,prevMonth2026)) : undefined)
    row('Formularios web', formatNumber(mForm26), formatNumber(gv(d2025.leadsForm,prevMonth,'real')))
    row('WhatsApp total', formatNumber(mWA26), formatNumber(gv(d2025.leadsWA,prevMonth,'real')))
    row('Llamadas entrantes', formatNumber(mCall26), formatNumber(gv(d2025.llamadas,prevMonth,'real')))
    y += 3

    // VENTAS
    if (y > 230) { doc.addPage(); y = 20 }
    section('VENTAS — ANÁLISIS PRINCIPAL')
    row('Ventas USD totales', formatCurrency(mVentasTotUSD26,0), formatCurrency(mVentasTotUSD25,0),
      prevMonth2026 ? formatCurrency(gv(d2026.ventasTotalUSD||[],prevMonth2026),0) : undefined)
    row('Ventas únicas', formatNumber(mVentas26), formatNumber(mVentas25),
      prevMonth2026 ? formatNumber(gv(d2026.ventas,prevMonth2026)) : undefined)
    row('Ventas Montevideo (USD)', formatCurrency(mMvdUSD26,0), '—')
    row('Ventas Punta del Este (USD)', formatCurrency(mPdEUSD26,0), '—')
    row('ROAS', mROAS26>0?`${mROAS26}x`:'—', '—')
    row('Ticket Punta del Este (USD)', formatCurrency(mTickPdE26,0), formatCurrency(mTickPdE25,0))
    row('Ticket Montevideo (USD)', formatCurrency(mTickMvd26,0), formatCurrency(mTickMvd25,0))
    row('Conversion Rate', formatPercent(mConvRate), '—')
    y += 3

    // CALIDAD DE LEADS
    if (y > 230) { doc.addPage(); y = 20 }
    section('CALIDAD DE LEADS — FORMULARIO WEB')
    const qd = QUALITY_MONTHLY.find(d=>d.mes===effectiveMonth)
    if (qd) {
      const pctAB = Math.round((qd.A+qd.B)/qd.total*100)
      row('Total leads formulario', String(qd.total), '—')
      row('Calificados A+B', `${pctAB}% (${qd.A+qd.B})`, '—')
      row('Cat. A — Alto', `${Math.round(qd.A/qd.total*100)}% (${qd.A})`, '—')
      row('Cat. B — Medio', `${Math.round(qd.B/qd.total*100)}% (${qd.B})`, '—')
      row('Cat. C — Tibio', `${Math.round(qd.C/qd.total*100)}% (${qd.C})`, '—')
      row('Cat. D — Frío', `${Math.round(qd.D/qd.total*100)}% (${qd.D})`, '—')
    } else {
      doc.setFontSize(10); doc.setTextColor(...LGRAY)
      doc.text('Sin datos de calidad para este mes', 16, y)
      y += 7
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(...LGRAY)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-UY')} · Royal Arquitectura — Dashboard de Marketing`, 14, 290)

    doc.save(`Royal_Informe_${effectiveMonth.replace('/','_')}.pdf`)
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:'Roboto,sans-serif'}}>

      {/* ══ HEADER ═════════════════════════════════════════════ */}
      <header style={{background:'#95C11F'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{color:'#fff',fontSize:15,fontWeight:600,letterSpacing:'0.06em',margin:0,textTransform:'uppercase'}}>Royal Arquitectura</p>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',margin:'2px 0 0'}}>Resumen Mensual de métricas Marketing</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'rgba(255,255,255,0.85)'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#fff',display:'inline-block'}}/>
              Datos en vivo
            </div>
            <button
              onClick={()=>generatePDF()}
              style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.2)',color:'#fff',border:'1px solid rgba(255,255,255,0.4)',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:500,cursor:'pointer',transition:'all 0.15s'}}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.3)'}
              onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
            >
              ↓ Descargar informe {effectiveMonth}
            </button>
          </div>
        </div>
      </header>

      <main style={{maxWidth:1280,margin:'0 auto',padding:'22px 24px',display:'flex',flexDirection:'column',gap:24}}>

        {/* ── SELECTOR DE MES ────────────────────────────────── */}
        <div className="card" style={{padding:'12px 18px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
            <div>
              <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.15em',color:C.grayL,margin:0}}>Período analizado</p>
              <p style={{fontSize:15,fontWeight:500,color:C.black,margin:'2px 0 0'}}>
                {effectiveMonth} vs {prevMonth}
                <span style={{fontSize:11,color:C.grayL,fontWeight:400,marginLeft:8}}>— comparación año anterior</span>
              </p>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {allMonths.map(m=>(
                <button key={m} onClick={()=>setSelMonth(m)}
                  style={{padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:500,cursor:'pointer',transition:'all 0.15s',
                    background:effectiveMonth===m?C.green:'transparent',color:effectiveMonth===m?'#fff':C.gray,border:`1px solid ${effectiveMonth===m?C.green:C.border}`}}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 1. INVERSIÓN ══════════════════════════════════════ */}
        <Section title="Inversión en Medios" icon={DollarSign}>
          {/* KPI único — inversión del mes */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:20}}>
            <KCard label={`Inversión ${effectiveMonth}`} value={formatCurrency(mInv26)}
              sub={`${prevMonth}: ${formatCurrency(mInv25)}`} pct={growthPct(mInv26,mInv25)}
              momPct={prevMonth2026?growthPct(mInv26,gv(d2026.invTotal,prevMonth2026)):null}
              momLabel={`vs ${prevMonth2026||''} 2026`}
              icon={DollarSign} inv="green"/>
            {/* Inversión mes anterior 2026 */}
            {allMonths.indexOf(effectiveMonth) > 0 && (() => {
              const prevM26 = allMonths[allMonths.indexOf(effectiveMonth)-1]
              const prevV26 = gv(d2026.invTotal, prevM26)
              return <KCard label={`Inversión ${prevM26}`} value={formatCurrency(prevV26)} sub="Mes anterior 2026" icon={DollarSign}/>
            })()}
          </div>
          {/* Gráfico barras 2025 vs 2026 */}
          <CC title="Inversión mensual 2025 vs 2026" sub="Comparación año a año (USD)">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={invBarSeries} margin={{top:4,right:4,left:-10,bottom:0}} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`}/>
                <Tooltip content={<RT prefix="USD "/>}/>
                <Legend wrapperStyle={{paddingTop:8,fontSize:11}}/>
                <Bar dataKey="2025" fill={CH.g1} radius={[3,3,0,0]} barSize={18}/>
                <Bar dataKey="2026" fill={CH.v1} radius={[3,3,0,0]} barSize={18}/>
              </BarChart>
            </ResponsiveContainer>
          </CC>

          {/* Mix de canales del mes — solo donut */}
          <div style={{display:'grid',gridTemplateColumns:'1fr',maxWidth:420,gap:16}}>
            <CC title={`Mix canales — ${effectiveMonth}`} sub="Distribución del mes">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={mCanalMix} dataKey="valor" nameKey="canal" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} labelLine={false} label={DonutLabel}>
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
                <MBtn key={m.id} label={m.label} value={m.value}
                  sub={m.pct!==null&&m.pct!==undefined?`${m.pct>=0?'▲':'▼'} ${Math.abs(m.pct).toFixed(1)}% vs ${prevMonth}`:effectiveMonth}
                  momPct={m.momPct} momLabel={m.momLabel}
                  active={brandMetric===m.id} onClick={()=>setBrandMetric(m.id)}/>
              ))}
            </div>
            <div>
              <CC title={`${activeBrand.label} — ${effectiveMonth} vs ${prevMonth}`} sub="Evolución mensual comparada">
                <AreaSeries series={activeBrand.series} height={260}/>
              </CC>
            </div>
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
            <CC title={`${activeLead.label} — ${effectiveMonth} vs ${prevMonth}`} sub="Evolución mensual comparada">
              <AreaSeries series={activeLead.series} height={300}/>
            </CC>
          </div>

          {/* Mix del mes */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
            <CC title={`Mix de leads — ${effectiveMonth}`} sub="Distribución del mes por canal">
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
            <CC title="Leads totales" sub={`${effectiveMonth} vs ${prevMonth}`}>
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
          <div style={{background:'linear-gradient(135deg,#575756 0%,#6E6E6D 100%)',borderRadius:16,padding:'20px 20px',marginBottom:16}}>
            <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.16em',color:C.grayL,margin:'0 0 14px'}}>{effectiveMonth} vs {prevMonth}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14}}>
              {[
                {label:`Ventas USD ${effectiveMonth}`,val:formatCurrency(mVentasTotUSD26,0),sub:`${prevMonth}: ${formatCurrency(mVentasTotUSD25,0)}`,pct:growthPct(mVentasTotUSD26,mVentasTotUSD25)},
                {label:'Conv. Rate',val:formatPercent(mConvRate),sub:'Leads → Ventas',pct:null},
                {label:'ROAS',val:mROAS26>0?`${mROAS26}x`:'—',sub:'Retorno inversión',pct:null},
                {label:'Mvd USD',val:formatCurrency(mMvdUSD26,0),sub:`PdE: ${formatCurrency(mPdEUSD26,0)}`,pct:null},
                {label:'Inversión',val:formatCurrency(mInv26),sub:`${prevMonth}: ${formatCurrency(mInv25)}`,pct:growthPct(mInv26,mInv25)},
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
            <CC title={`${activeVenta.label} — evolución mensual`} sub={`${effectiveMonth} vs ${prevMonth}`}>
              {activeVenta.isMulti
                ? <MultiBarSeries series={activeVenta.series} height={290}/>
                : <AreaSeries series={activeVenta.series} yFmt={activeVenta.yFmt} prefix={activeVenta.prefix} suffix={activeVenta.suffix||''} height={290} onlyCurrentYear={activeVenta.onlyCurrentYear}/>
              }
            </CC>
          </div>

          {/* Gráfico histórico multi-año Ene-Abr */}
          {/* Coeficiente de correlación */}
          <CC title="Análisis de correlación" sub="Relación entre inversión, leads y ventas · 2026" style={{marginTop:14}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
              {[
                {label:'Leads vs Inversión', value:CORRELACION.leadsPublicidad, desc:'Alta correlación — más inversión genera más leads'},
                {label:'Ventas vs Leads',    value:CORRELACION.leadsVentas,      desc:'Correlación media — los leads se convierten moderadamente'},
                {label:'Ventas vs Inversión',value:CORRELACION.ventasPublicidad, desc:'Baja correlación — las ventas dependen de otros factores'},
              ].map((c,i)=>{
                const color = c.value >= 0.7 ? C.greenD : c.value >= 0.5 ? C.green : C.grayL
                const bg    = c.value >= 0.7 ? C.greenBg : c.value >= 0.5 ? '#F0F8DC' : C.bg
                return (
                  <div key={i} style={{background:bg,borderRadius:12,padding:'14px 16px',border:`1px solid ${C.border}`}}>
                    <p style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.13em',color:C.grayL,margin:'0 0 6px',fontWeight:500}}>{c.label}</p>
                    <p style={{fontSize:'2rem',fontWeight:300,color,margin:'0 0 4px',lineHeight:1}}>{c.value.toFixed(2)}</p>
                    <p style={{fontSize:11,color:C.grayL,margin:0}}>{c.desc}</p>
                  </div>
                )
              })}
            </div>
            <p style={{fontSize:11,color:C.grayL,margin:'0 0 10px'}}>
              Eje izquierdo: Ventas USD · Eje derecho: Leads y Inversión
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={CORR_SERIES} margin={{top:4,right:40,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="ventas" tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}
                  tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(0)+'k':v}`}/>
                <YAxis yAxisId="otros" orientation="right" tick={{fontSize:10,fill:C.grayL}} axisLine={false} tickLine={false}/>
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'Ventas USD') return [`$${value.toLocaleString('es-UY')}`, name]
                    if (name === 'Inversión USD') return [`$${value.toLocaleString('es-UY')}`, name]
                    return [value.toLocaleString('es-UY'), name]
                  }}
                  contentStyle={{fontFamily:'Roboto',fontSize:12,borderRadius:10,border:`1px solid ${C.border}`}}/>
                <Legend wrapperStyle={{paddingTop:10,fontSize:11}}/>
                {/* Ventas como barras en eje izquierdo */}
                <Bar yAxisId="ventas" dataKey="ventas" name="Ventas USD" fill={CH.v1} opacity={0.85} radius={[3,3,0,0]} barSize={20}/>
                {/* Leads como línea en eje derecho */}
                <Line yAxisId="otros" type="monotone" dataKey="leads" name="Leads"
                  stroke={CH.g1} strokeWidth={2.5} strokeDasharray="5 3"
                  dot={{fill:CH.g1,r:4,strokeWidth:0}} activeDot={{r:6}}/>
                {/* Inversión como línea en eje derecho */}
                <Line yAxisId="otros" type="monotone" dataKey="inversion" name="Inversión USD"
                  stroke={CH.v3} strokeWidth={2.5}
                  dot={{fill:CH.v3,r:4,strokeWidth:0}} activeDot={{r:6}}/>
              </ComposedChart>
            </ResponsiveContainer>
          </CC>

          <CC title="Ventas totales — comparativo histórico" sub="Ene a Jul · 2021–2026 · USD consolidadas Mvd + PdE" style={{marginTop:14}}>
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
                {mes:'May', '2021':111204, '2022':152304, '2023':98613, '2024':114080,
                  '2025':68045,  '2026': gv(d2026.ventasTotalUSD||[], 'May/26') || 110430},
                {mes:'Jun', '2021':111945, '2022':102878, '2023':173025, '2024':148824,
                  '2025':154060, '2026': gv(d2026.ventasTotalUSD||[], 'Jun/26') || 160985},
                {mes:'Jul', '2021':63885,  '2022':175355, '2023':113317, '2024':188226,
                  '2025':177653, '2026': gv(d2026.ventasTotalUSD||[], 'Jul/26') || 162786},
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
                    const isSelected=r.mes===effectiveMonth
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

        {/* ══ 5. CALIDAD DE LEADS ══════════════════════════ */}
        <Section title="Calidad de Leads — Formulario Web" icon={TrendingUp} open={false}>
          <LeadQualitySection selMonth={effectiveMonth} C={C} CH={CH}/>
          {/* Conclusión Calidad */}
          {(() => {
            const qd = (typeof QUALITY_MONTHLY !== 'undefined' ? QUALITY_MONTHLY : []).find(d=>d.mes===effectiveMonth)
            const qdPrev = (typeof QUALITY_MONTHLY !== 'undefined' ? QUALITY_MONTHLY : []).find(d=>d.mes===(prevMonth2026||''))
            const pctAB = qd ? Math.round((qd.A+qd.B)/qd.total*100) : 0
            const pctABPrev = qdPrev ? Math.round((qdPrev.A+qdPrev.B)/qdPrev.total*100) : 0
            return
          })()}
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
