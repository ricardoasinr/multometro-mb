# Multómetro MB — Calculadora de Multas AEMP

Calculadora web estática que estima **multas administrativas en bolivianos (Bs.)** conforme a la **Resolución RA/AEMP/Nº009/2021** — Reglamento de Sanciones e Infracciones Comerciales y Contables de la Autoridad de Fiscalización de Empresas (AEMP) de Bolivia.

El usuario configura su empresa, responde un cuestionario de Sí/No sobre 48 obligaciones legales (Arts. 11–59 del reglamento) y obtiene una **multa proyectada** más un **nivel de compliance**. El resultado se genera como PDF y se envía por email o se descarga localmente.

Sin backend propio, sin base de datos activa, sin build. HTML + CSS + JavaScript puros.

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [docs/arquitectura.md](docs/arquitectura.md) | Estructura del proyecto, pantallas, ciclo de vida |
| [docs/flujo-usuario.md](docs/flujo-usuario.md) | Las 6 pantallas paso a paso y qué se captura |
| [docs/calculo-multa.md](docs/calculo-multa.md) | **Matemática del cálculo** con fórmulas y ejemplos |
| [docs/preguntas.md](docs/preguntas.md) | Catálogo de las 48 preguntas y artículos |
| [docs/reporte.md](docs/reporte.md) | Plantilla del reporte, generación PDF y envío por correo |
| [docs/base-de-datos.md](docs/base-de-datos.md) | Schema PostgreSQL (no usado por la app) |
| [docs/dependencias.md](docs/dependencias.md) | CDNs, jsPDF, html2canvas, endpoint Render |
| [docs/referencias-legales.md](docs/referencias-legales.md) | Mapeo pregunta ↔ artículo del reglamento |
| [docs/known-issues.md](docs/known-issues.md) | Bugs y comportamientos raros documentados |

---

## Requisitos

- Un navegador moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+).
- Conexión a internet para las fuentes, iconos, `html2canvas`, `jsPDF` y el envío del PDF por email. Sin internet la app **sí calcula la multa**, pero el reporte se genera como `.txt` en vez de PDF.

No hay `npm install` — no hay `package.json`, todas las dependencias vienen por CDN.

---

## Instalación y ejecución

### Opción 1 — Abrir el HTML directamente

```bash
git clone git@github.com:ricardoasinr/multometro-mb.git
cd multometro-mb
open index.html          # macOS
# xdg-open index.html    # Linux
# start index.html       # Windows
```

Funciona, pero algunos navegadores bloquean `fetch()` sobre `file://` — si el cuestionario no carga preguntas, usa la opción 2.

### Opción 2 — Servidor local (recomendado)

Con Python:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Con Node.js:

```bash
npx http-server -p 8000
# → http://localhost:8000
```

Con PHP:

```bash
php -S localhost:8000
```

---

## Estructura del proyecto

```
multometro-mb/
├── README.md
├── index.html              # 6 pantallas de la SPA
├── styles.css              # ~36 KB, tema azul-violeta + rojos
├── script.js               # ~54 KB, toda la lógica (1503 líneas)
├── preguntas.json          # 48 preguntas + coeficientes
├── preguntas.csv           # Equivalente en CSV (no lo consume la app)
├── reporte-template.html   # Plantilla PDF con placeholders {{...}}
├── database_schema.sql     # Schema PostgreSQL (no usado — ver docs/base-de-datos.md)
├── ejemplos_consultas.sql  # Queries de ejemplo (no usados)
└── docs/                   # Documentación detallada
```

---

## Cómo funciona (resumen)

1. **Bienvenida** → botón "Comenzar".
2. **Registro** — nombre, empresa, cargo, email, teléfono.
3. **Configuración de empresa** — tipo de sociedad, base de cálculo (Utilidad Bruta o Capital), monto base en Bs.
   - Del monto se deriva un **rango A–F** que define los coeficientes de multa.
4. **% de precisión** — slider 1–100. Define **cuántas preguntas del catálogo (48) se muestrean al azar**.
5. **Cuestionario** — una pregunta por pantalla, respuesta Sí/No. Cada "No" suma multa.
6. **Resultados** — total de Sí/No y botón para generar el reporte.
7. **Reporte PDF** — se genera con `html2canvas` + `jsPDF` y se envía por email a `apigmail-lunw.onrender.com/send-email`, o se descarga localmente si el envío falla.

Ver [docs/flujo-usuario.md](docs/flujo-usuario.md) para el detalle de cada pantalla y [docs/calculo-multa.md](docs/calculo-multa.md) para la matemática.

---

## Fórmula de la multa (resumen)

Para cada pregunta respondida **"No"**:

- **Preguntas 1, 2, 3, 4, 46, 47, 48** → multa fija en Bs. según tipo de sociedad (tabla en `calcularMultaEspecial`).
- **Preguntas 38 y 45** → sanciones **no monetarias** (suspensión temporal o amonestación escrita); aportan 0 Bs. al total.
- **Resto (preguntas 5–37, 39–44)** → fórmula:

$$
\text{multa}_{\text{pregunta}} = \text{baseCalculo} \times \text{montoBaseCalculo} \times \text{values}[\text{rango}]
$$

donde:

- `baseCalculo = 0.8` si se eligió Utilidad Bruta, `1.0` si se eligió Capital.
- `montoBaseCalculo` = monto ingresado por el usuario en Bs.
- `values[rango]` = coeficiente del rango A–F declarado en `preguntas.json`.

Total: suma de todas las multas parciales. Sin topes ni multiplicadores.

Ver [docs/calculo-multa.md](docs/calculo-multa.md) para ejemplos completos y edge cases.

---

## Aviso legal

Este software es una **herramienta de simulación** y **no constituye asesoría legal ni sustituye la revisión oficial de la AEMP**. Los montos calculados son estimaciones basadas en las tablas de la Resolución RA/AEMP/Nº009/2021 tal como estaban al momento de escribir este código; consulta siempre la versión vigente del reglamento y a un profesional antes de tomar decisiones.

---

## Persistencia

**Ninguna.** Toda la sesión vive en memoria:

- No hay `localStorage`, `sessionStorage`, cookies ni IndexedDB.
- No hay backend propio.
- El schema PostgreSQL en `database_schema.sql` está en el repo pero **no está conectado a nada** — es un roadmap. Ver [docs/base-de-datos.md](docs/base-de-datos.md).
- Solo el **email del usuario y el PDF** se envían al endpoint remoto de correo (`apigmail-lunw.onrender.com/send-email`) al momento de generar el reporte.

Recargar la página elimina toda la información capturada.

---

## Bugs conocidos

Ver [docs/known-issues.md](docs/known-issues.md) para la lista completa. Los más importantes:

- **Etiqueta invertida "Utilidad Bruta / Capital"** en el reporte PDF (el cálculo es correcto, solo la etiqueta está al revés).
- `userData.factor` (5%, 4%, ..., 0.5%) aparece como "informativo" en el reporte pero **no interviene en la multa** — los factores reales están en los coeficientes A–F de cada pregunta.
- El README original decía "170+ preguntas" — son **48**.

---

## Despliegue

Al ser una web estática, se puede subir tal cual a:

- Netlify / Vercel / Cloudflare Pages / GitHub Pages
- Cualquier bucket S3 / Cloudflare R2 con hosting estático
- Un servidor Apache / Nginx con solo copiar los archivos

**Importante:** el endpoint de email `apigmail-lunw.onrender.com` está en Render free tier — la primera petición puede tardar >30 s si el servicio hibernó.
