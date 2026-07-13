# Reporte — plantilla, PDF y envío por correo

## Plantilla — `reporte-template.html`

Archivo HTML autocontenido (~11 KB, CSS inline) con placeholders `{{...}}` que se sustituyen por `String.replace` en `generarReportePDF()`.

### Placeholders

| Placeholder | Valor |
|-------------|-------|
| `{{fecha}}` | `new Date().toLocaleDateString('es-ES')` |
| `{{tipoSociedad}}` | Nombre legible (map `tipoSociedadNombres` en `script.js`) |
| `{{baseCalculo}}` | `"Utilidad Bruta"` o `"Capital"` — **⚠️ etiqueta invertida, ver [known-issues.md](known-issues.md)** |
| `{{montoBase}}` | `Bs. NNN.NNN` con separador de miles |
| `{{rango}}` | `A (Factor: 5%)` |
| `{{totalPreguntas}}` | Conteo de preguntas de la muestra |
| `{{respuestasSi}}` | Conteo de "Sí" |
| `{{respuestasNo}}` | Conteo de "No" |
| `{{compliance}}` | `% Sí/Total` |
| `{{totalMultas}}` | `Bs. NNN.NNN,NN` |

Además del reemplazo por placeholders, el contenedor `#multas-list` se rellena dinámicamente desde JS con una `.multa-item` por cada respuesta "No" que aportó multa monetaria — incluye pregunta, `multa-articulo` y monto formateado.

### Estructura visual

| Bloque | Rol |
|--------|-----|
| `.header` | Título "Reporte Multómetro", gradiente azul-violeta |
| `.info-section` | Info de empresa (tipo, base, monto, rango) |
| `.metrics-section` | 4 tarjetas: total preguntas, Sí, No, compliance |
| `.progress-section` | Barra visual del % de compliance |
| `.total-section` | Total en Bs., gradiente rojo |
| `.multas-section` | Lista detallada de infracciones |
| `.disclaimer` | Recuadro amarillo con aviso legal |

La media query `@media print` está definida pero **no se usa** — el flujo real es HTML offscreen → canvas → JPEG → PDF, no `window.print()`.

---

## Generación del PDF — `generarReportePDF()`

Flujo:

1. `fetch('./reporte-template.html')` → string HTML crudo.
2. Reemplaza todos los `{{placeholder}}` con `String.replace`.
3. Crea un `<div>` offscreen (`position: absolute; left: -9999px`), le inyecta el HTML y agrega `.multa-item` por cada infracción monetaria.
4. `await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 800 })` → canvas.
5. `canvas.toDataURL('image/jpeg', 0.95)` → data URL.
6. `new jsPDF('p', 'mm', 'a4')` — hoja A4 vertical.
7. Escala la imagen al ancho A4 (210 mm) manteniendo aspect ratio.
8. Si la altura excede 297 mm, pagina con `pdf.addPage()` + `pdf.addImage(..., position, ...)` iterando hasta agotar.
9. Nombre del archivo: `Reporte_Multometro_YYYY-MM-DD.pdf`.

## Fallbacks de librería

`jsPDF` se precarga con **triple fallback** en el `<head>` de `index.html`:

1. `cdnjs.cloudflare.com` (primaria).
2. `cdn.jsdelivr.net`.
3. `unpkg.com`.

Si las tres fallan, `window.jsPDF || window.jspdf` es undefined y `generarReportePDF()` cae a `generarReporteTexto()` — un `.txt` plano descargable con los mismos datos.

---

## Envío por correo

Endpoint: **`https://apigmail-lunw.onrender.com/send-email`**

Método: `POST` con `Content-Type: multipart/form-data`.

Campos:

- `email` — string del usuario (validado en `form-page`).
- `pdf` — Blob del PDF generado.

Sin autenticación ni token en el cliente. El endpoint corre en **Render.com free tier**:

- Hiberna tras periodos de inactividad.
- La primera petición tras hibernación puede tardar **>30 s** ("cold start").
- Es un servicio externo separado del repo; su código y logs no están aquí.

### Manejo de errores

```js
try {
  await fetch(endpoint, { method: 'POST', body: formData })
} catch (e) {
  // Fallback: descargar el PDF localmente
  pdf.save(fileName)
  alert("No se pudo enviar el correo. Descargando el reporte localmente.")
}
```

Si el usuario no dio email o el envío falla, se descarga el PDF localmente. Si `html2canvas`/`jsPDF` también fallan, se cae a `generarReporteTexto()`.

---

## Reporte alternativo en texto — `generarReporteTexto()`

Genera un `.txt` con toda la información en formato legible:

```
=== REPORTE MULTÓMETRO ===
Fecha: 12/03/2025
Empresa: SRL
Base de cálculo: Utilidad Bruta   ← ⚠️ etiqueta invertida
Monto base: Bs. 15 000 000
Rango: B (Factor: 4%)

Preguntas: 24 (12 Sí / 12 No)
Compliance: 50%

--- Detalle de multas ---
[Art. 15] ¿... ? — Bs. 19 200,00
[Art. 22] ¿... ? — Bs. 13 200,00
...
Total: Bs. 71 600,00
```

Se descarga como `Reporte_Multometro_YYYY-MM-DD.txt`.

---

## Datos que salen del navegador

**Solo dos:**

- `email` del usuario.
- El PDF binario generado.

No se envía nombre, empresa, cargo, teléfono, respuestas individuales ni multa desglosada. Todo lo demás vive en memoria del navegador y desaparece al recargar.

---

## Debug del reporte

Para inspeccionar el HTML final antes de convertirlo a canvas:

1. Modificar `generarReportePDF()` para no remover el `<div>` offscreen.
2. En DevTools → Elements, buscar el `<div>` con estilo `position: absolute; left: -9999px`.
3. Cambiar temporalmente `left` a `0` para verlo en pantalla.

O bien reemplazar la parte de `html2canvas` con `document.body.innerHTML = html` para verlo directo (destructivo — recargar después).

Otra alternativa: abrir `reporte-template.html` directamente en el navegador. Se ve la maqueta con los placeholders sin reemplazar.
