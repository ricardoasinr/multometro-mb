# Arquitectura

Web estática pura (HTML + CSS + JS sin build) que corre íntegramente en el navegador. No hay backend propio; una única dependencia externa activa es un endpoint remoto de correo (`apigmail-lunw.onrender.com`) para enviar el PDF generado.

```
┌──────────────────────────────────────────────┐
│  Navegador                                    │
│                                               │
│  index.html                                   │
│    ├─ 6 pantallas (<div class="page">)        │
│    └─ carga por CDN:                          │
│         - Google Fonts (Inter)                │
│         - Font Awesome 6                      │
│         - html2canvas 1.4.1                   │
│         - jsPDF 2.5.1                         │
│                                               │
│  script.js  ── fetch('preguntas.json')        │
│             ── fetch('./reporte-template.html')│
│                                               │
└──────────────────────────────────────────────┘
                       │
                       ▼
          POST /send-email   (solo al generar PDF)
                       │
                       ▼
        apigmail-lunw.onrender.com
```

## Archivos

| Archivo | Tamaño aprox. | Rol |
|---------|--------------|-----|
| `index.html` | 20 KB | Layout de las 6 pantallas + carga de CDNs |
| `styles.css` | 36 KB | Tema visual, sistema de pantallas activas, animaciones |
| `script.js` | 54 KB | Toda la lógica: navegación, validación, cálculo, generación de reporte |
| `preguntas.json` | 13 KB | Catálogo de 48 preguntas con coeficientes y artículos |
| `preguntas.csv` | 4 KB | Equivalente en CSV (no consumido por la app) |
| `reporte-template.html` | 11 KB | Plantilla del PDF con placeholders `{{...}}` |
| `database_schema.sql` | 8 KB | Schema PostgreSQL (roadmap, no conectado) |
| `ejemplos_consultas.sql` | 9 KB | Queries de ejemplo sobre el schema |

## Sistema de pantallas

`script.js` mantiene un array `pages` con los 6 IDs y un `currentPage` que apunta a la activa. Solo una `<div class="page">` lleva la clase `.active` a la vez; el resto está oculta con `display: none`.

| # | id | Rol |
|---|----|-----|
| 0 | `welcome-page` | Bienvenida, disclaimers |
| 1 | `form-page` | Registro (nombre, empresa, cargo, email, teléfono) |
| 2 | `company-config-page` | Tipo sociedad + base de cálculo + monto base |
| 3 | `progress-page` | Selector del % de precisión |
| 4 | `questions-page` | Cuestionario, una pregunta por pantalla |
| 5 | `success-page` | Resumen + botón para generar el reporte |

Transiciones: `nextPage()` y `prevPage()` cambian `currentPage`. Un listener `keydown` permite `Alt + ←/→` para navegar y Enter para hacer click en botones enfocados.

## Estado global (`script.js`)

Todo el estado vive en variables globales (no hay clases, no hay módulos):

- `currentPage` — índice de la pantalla activa.
- `userData` — objeto con datos del usuario, tipo sociedad, monto base, rango, factor, multaTotal, email.
- `allQuestions` — catálogo cargado desde `preguntas.json`.
- `selectedQuestions` — muestra aleatoria filtrada por el % elegido.
- `currentQuestionIndex` — pregunta activa dentro del cuestionario.
- `questionAnswers` — array de `{question, category, answer, values, multa, nro, articulo}` acumulado a medida que el usuario responde.

## Ciclo de vida

1. `DOMContentLoaded` (declarado tres veces en `script.js` — funcional pero refactor pendiente):
   - Inicializa validación del formulario.
   - Precarga `preguntas.json` con `loadQuestions()`.
   - Inyecta CSS extra dinámicamente.
   - Configura los controles del slider.
2. El usuario navega pantalla por pantalla. `nextPage()` valida y actualiza `userData` si corresponde (por ejemplo, calcula el rango A–F al salir de la config de empresa).
3. En `progress-page`, `startProgressAnimation()`:
   - Asegura que `allQuestions` esté cargado.
   - `selectRandomQuestions(pct)` toma `Math.ceil((pct/100) * 48)` preguntas al azar sin reposición.
   - Delay artificial de 1.5 s y avanza al cuestionario.
4. Cada respuesta llama a `answerQuestion(answer)`, que:
   - Calcula la multa parcial con `calcularMulta(pregunta, respuesta)`.
   - Añade el registro a `questionAnswers`.
   - Suma al `userData.multaTotal`.
   - Avanza a la siguiente pregunta o llama a `completeQuestionnaire()`.
5. En `success-page`, click en "Ver reporte por correo" dispara `generarReportePDF()`:
   - Fetch de `reporte-template.html`.
   - Reemplaza placeholders con `String.replace`.
   - Monta el HTML offscreen, `html2canvas` → canvas → JPEG.
   - `jsPDF` inserta el JPEG en A4 y pagina.
   - POST multipart al endpoint de correo con `email` y `pdf`.
   - Si falla el envío, descarga local del PDF.
   - Si falla `html2canvas`/`jsPDF`, `generarReporteTexto()` genera un `.txt`.

## Persistencia

Ninguna del lado cliente:

- Sin `localStorage`, sin `sessionStorage`, sin cookies, sin IndexedDB.
- Al recargar la página se pierde todo.

Del lado remoto solo se envía el email + PDF al momento de generar el reporte. Los datos del registro (nombre, empresa, cargo, teléfono) **no se envían** — solo el email como campo del multipart.

## Barra de progreso global

`index.html` incluye una `.progress-container` inferior con 4 círculos numerados. Es un residuo de una versión anterior con 4 pasos:

- `updateProgress()` calcula `((currentPage + 1) / 5) × 100` — con 6 pantallas la barra llega al 100% antes de la última.
- `updateSteps()` sólo itera `i = 1..4` — el paso 5 nunca se marca.

Ver [known-issues.md](known-issues.md).

## Fallback offline

Si `preguntas.json` no se puede cargar (por ejemplo, `file://` bloqueando fetch en algunos navegadores), `loadQuestions()` cae a un array de 4 preguntas hardcoded. El cuestionario funciona pero pierde toda la matemática real. Este fallback está pensado para dev, no para uso real.
