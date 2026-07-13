# Dependencias externas

No hay `package.json` ni bundler. Todo se carga por CDN desde `index.html`.

## CDNs cargados por `index.html`

| Recurso | URL | Uso |
|---------|-----|-----|
| **Google Fonts — Inter** (300–700) | `fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700` | Tipografía global |
| **Font Awesome 6.0.0** | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css` | Iconos (`fa-calculator`, `fa-user`, `fa-check-circle`, ...) |
| **html2canvas 1.4.1** | `cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js` | Convierte el HTML del reporte a `<canvas>` |
| **jsPDF 2.5.1** | `cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` | Convierte el canvas a PDF |

### Fallbacks de jsPDF

El `<head>` incluye 3 URLs en cascada para jsPDF:

1. `cdnjs.cloudflare.com/...`  (primaria)
2. `cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js`
3. `unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js`

`generarReportePDF()` verifica `window.jsPDF || window.jspdf` antes de usarlo. Si ninguna URL responde, cae a `generarReporteTexto()` (reporte `.txt`).

## Endpoint remoto de correo

**`https://apigmail-lunw.onrender.com/send-email`** — POST multipart con `email` y `pdf`.

- No es un CDN, pero es una dependencia crítica del flujo "enviar por email".
- Sin token de autenticación en el cliente.
- Corre en **Render.com free tier**:
  - Hiberna tras ~15 min de inactividad.
  - La primera petición tras hibernación puede tardar **>30 s** (cold start).
- Su código y logs viven en un repo separado (no incluido aquí).

Si el endpoint falla, el PDF se descarga localmente como fallback.

## Comportamiento offline

Sin internet:

| Feature | Estado |
|---------|--------|
| Cálculo de multa | ✅ Funciona |
| Cuestionario | ✅ Funciona (si `preguntas.json` ya se cargó) |
| Fuente Inter | ❌ Cae a `sans-serif` genérico |
| Iconos FontAwesome | ❌ Se ven cuadrados vacíos |
| Reporte PDF | ❌ Cae a `.txt` |
| Envío por email | ❌ Descarga local |

Los archivos locales (`preguntas.json`, `reporte-template.html`) se sirven desde el mismo origen, por lo que funcionan siempre que el servidor esté vivo.

## Sin backend propio

- No hay Node.js, Python, PHP ni base de datos activa.
- No hay build step (`webpack`, `vite`, etc.).
- No hay tests.
- No hay CI.

Es un proyecto **puro cliente + un endpoint de correo externo**.

## Compatibilidad de navegador

Requiere:

- `fetch` API (para cargar `preguntas.json` y `reporte-template.html`).
- ES6 (arrow functions, `const`/`let`, template strings, `async/await`).
- `<input type="range">` con soporte del pseudo-elemento `::-webkit-slider-thumb`.

Navegadores probados: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+.

## Actualización de dependencias

Para actualizar html2canvas o jsPDF:

1. Cambiar la URL del `<script>` en `index.html`.
2. Verificar la API — jsPDF cambió el constructor entre 1.x y 2.x.
3. Probar el flujo completo: click "generar PDF" → verificar que el archivo se descarga y se lee bien.

Font Awesome 6.0.0 está pineado; si se actualiza a 6.x más reciente conviene verificar que los nombres de iconos siguen existiendo (`fa-calculator`, `fa-user`, etc.).
