// Parámetros del dashboard que se pueden ajustar a mano.
// Margen bruto promedio por venta (0.5 = 50%). Se usa para calcular el CAC payback.
export const MARGEN_BRUTO = 0.5

// Salud del CAC: relación entre el margen bruto de una venta y el CAC (margen ÷ CAC).
// Equivale a la regla LTV:CAC de 3 a 1 aplicada a una sola compra.
export const CAC_RATIO_SALUDABLE = 3   // a partir de 3x se considera saludable
export const CAC_RATIO_MINIMO    = 1   // por debajo de 1x cada venta pierde plata
