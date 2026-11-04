/**
 * leadQualityData.js
 * Datos de calidad de leads del formulario web.
 * Fuente: bbdd_formulario_web.xlsx — scoring automático por contenido del mensaje.
 * 
 * Categorías:
 *   A = Lead calificado alto (solicita precio + medidas + instalación, proyecto/empresa)
 *   B = Lead calificado medio (solicita precio o tiene medidas)
 *   C = Lead tibio (mensaje genérico, poca info)
 *   D = Lead frío (sin mensaje, muy corto)
 * 
 * 🔧 Para actualizar: reemplazar con fetch al Google Sheet cuando sea público.
 */

export const QUALITY_MONTHLY = [
  { mes:'Oct/25', total:84,  A:20, B:28, C:17, D:19 },
  { mes:'Nov/25', total:97,  A:13, B:28, C:38, D:18 },
  { mes:'Dic/25', total:71,  A:17, B:28, C:13, D:13 },
  { mes:'Ene/26', total:138, A:35, B:48, C:36, D:19 },
  { mes:'Feb/26', total:98,  A:29, B:28, C:20, D:21 },
  { mes:'Mar/26', total:136, A:26, B:48, C:39, D:23 },
  { mes:'Abr/26', total:161, A:44, B:51, C:35, D:31 },
  { mes:'May/26', total:100, A:28, B:31, C:27, D:14 },
]

// Totales globales
export const QUALITY_TOTAL = { A:212, B:290, C:225, D:158, total:885 }

// Colores por categoría
export const Q_COLORS = { A:'#95C11F', B:'#B8DC5A', C:'#8A8A89', D:'#D8E8B8' }
export const Q_LABELS = {
  A: 'Calificado Alto — precio + medidas + instalación',
  B: 'Calificado Medio — solicita precio o tiene medidas',
  C: 'Tibio — mensaje genérico',
  D: 'Frío — sin mensaje o muy corto',
}
