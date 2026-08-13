# Royal Dashboard

Dashboard de marketing para Royal Arquitectura. Conectado a Google Sheets en tiempo real.

## Stack
- **React 18** + **Vite**
- **Tailwind CSS** (tipografía: Cormorant Garamond + DM Sans)
- **Recharts** para gráficos
- **PapaParse** para parsing CSV

---

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Build para producción

```bash
npm run build
```

Resultado en `/dist` — listo para Netlify, Vercel o cualquier host estático.

---

## ⚙️ Configuración de la planilla

Editá `src/services/googleSheetsService.js`:

```js
// 🔧 ID de la planilla de Google
const SHEET_ID = '1BQZ6FAQGhYmkAh-AvvVXLXuLvN6L0ukH4UXvWutO7zQ'

// 🔧 Nombre de la hoja (pestaña) — URL-encoded
// Ejemplos: 'Hoja%201', 'Dashboard', 'Data%20Mensual'
const SHEET_NAME = 'Hoja%201'
```

> La planilla debe estar publicada como "cualquiera con el enlace puede ver".

---

## Estructura del proyecto

```
src/
├── components/
│   ├── KpiCard.jsx      # Tarjeta de KPI individual
│   ├── ChartCard.jsx    # Wrapper de card para gráficos
│   ├── DataTable.jsx    # Tabla filtrable con búsqueda
│   └── Filters.jsx      # Barra de filtros de métrica
├── services/
│   └── googleSheetsService.js  # Fetch + parse CSV de Google Sheets
├── hooks/
│   └── useDashboardData.js     # Hook de datos con loading/error
├── utils/
│   └── formatters.js    # Formateo de moneda, números, porcentajes
├── App.jsx              # Layout principal y gráficos
├── main.jsx
└── index.css
```

---

## Deploy en Netlify

1. Conectá el repo en [app.netlify.com](https://app.netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. El archivo `netlify.toml` ya está configurado.

---

## Personalización de diseño

Los colores del tema están en `tailwind.config.js` bajo `theme.extend.colors.royal`.
La tipografía se importa en `index.html` desde Google Fonts.
