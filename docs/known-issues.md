# Bugs y comportamientos raros

Lista de issues detectados al leer el código. Ninguno rompe el flujo, pero varios afectan al reporte o son deuda técnica.

---

## 1. Etiqueta "Utilidad Bruta / Capital" invertida en el reporte

**Impacto:** medio (visual — el cálculo es correcto).

En `generarReportePDF()` (`script.js`, línea 1283) y en `generarReporteTexto()` (línea 1469):

```js
.replace(/{{baseCalculo}}/g, userData.baseCalculo === 1 ? 'Utilidad Bruta' : 'Capital')
```

Está **invertido** respecto a la asignación en `nextPage()`:

```js
userData.baseCalculo = calculationBase.value === 'utilidad-bruta' ? 0.8 : 1;
```

Es decir:

- `baseCalculo === 1` → el usuario eligió **Capital**, pero el reporte imprime "Utilidad Bruta".
- `baseCalculo === 0.8` → el usuario eligió **Utilidad Bruta**, pero el reporte imprime "Capital".

**Fix:** intercambiar las cadenas en ambos lugares.

---

## 2. `userData.factor` no se aplica al cálculo

**Impacto:** confusión conceptual.

El reporte muestra `"Rango: A (Factor: 5%)"`, `"Rango: B (Factor: 4%)"`, etc. Da a entender que el factor multiplica la multa. **No es así:** los factores reales están codificados dentro de los coeficientes A–F de cada pregunta en `preguntas.json`.

`userData.factor` es informativo y podría eliminarse sin afectar el cálculo. Alternativamente, si se quiere que sea funcional, habría que revisar la fórmula.

---

## 3. README original decía "170+ preguntas" — son 48

**Impacto:** documentación.

El archivo `preguntas.json` tiene exactamente 48 preguntas, no 170+. El README nuevo lo aclara.

---

## 4. Barra de progreso global mal calibrada

**Impacto:** cosmético.

`updateProgress()` calcula:

```js
const progress = ((currentPage + 1) / 5) * 100
```

Con 6 pantallas (índices 0–5), esto llega al 100% cuando `currentPage === 4` (pantalla del cuestionario). La última (`success-page`) muestra la barra ya a 100% en lugar de progresar.

**Fix:** cambiar `/ 5` a `/ 6` — o mejor, `/ pages.length`.

---

## 5. `updateSteps()` solo maneja 4 pasos

**Impacto:** cosmético.

Los círculos numerados de `.progress-steps` son 4, pero el flujo real tiene 6 pantallas. Los pasos 5 y 6 nunca se marcan como `.completed` porque el loop en `updateSteps()` va de `i = 1` a `i = 4`.

Es un residuo de una versión anterior del flujo. Se puede:

- Ampliar a 6 pasos (más HTML + más iteración).
- O eliminar los círculos y dejar sólo la barra continua.

---

## 6. Tres listeners `DOMContentLoaded`

**Impacto:** ninguno funcional; deuda técnica.

`script.js` declara `document.addEventListener('DOMContentLoaded', ...)` en las líneas 138, 553 y 610. Los tres se ejecutan en orden, pero es más limpio consolidarlos en uno solo.

---

## 7. `</button>` sobrante en `index.html`

**Impacto:** parser tolerante lo ignora, pero el HTML no valida.

Línea 426, junto al botón "Descargar Reporte" en la `success-page`. Un cierre de más.

---

## 8. Pregunta 1 hardcoded a 16 000 sin distinguir sociedad

**Impacto:** ninguno hoy (el mapping del JSON tiene los cuatro tipos con el mismo valor), pero es inconsistente.

`calcularMultaEspecial(nro=1)` devuelve `return 16000` fijo, sin leer `pregunta.values`. Si algún día se decide diferenciar por sociedad (por ejemplo, unipersonal 8 000 vs SA 16 000), habría que:

1. Editar el mapping en `preguntas.json`.
2. También editar `calcularMultaEspecial` para que use el mapping en vez del literal.

Idem para la pregunta 48 (`return 18000`).

---

## 9. Schema SQL sin columna de multa

**Impacto:** roadmap.

`database_schema.sql` define `evaluaciones` y `respuestas_detalladas` pero **no incluye columnas para el monto de multa**. Quedó de una iteración previa. Si se conecta el schema hay que migrar (ver [base-de-datos.md § Limitación importante](base-de-datos.md#limitación-importante)).

---

## 10. Sin persistencia

**Impacto:** UX.

Recargar la página elimina todo: datos del registro, respuestas del cuestionario, multa calculada. No hay historial ni "recuperar mi resultado".

Alternativa mínima: guardar en `localStorage` una copia del `userData` + `questionAnswers` al final del cuestionario, y ofrecer un botón "Recuperar última evaluación" en la pantalla de bienvenida.

---

## 11. Endpoint de correo en Render free tier

**Impacto:** UX.

`apigmail-lunw.onrender.com` hiberna tras ~15 min de inactividad. La primera petición tras hibernación puede tardar **más de 30 segundos** ("cold start" de Render). El usuario ve un spinner interminable si no está avisado.

Mitigaciones posibles:

- Mostrar un mensaje "Puede tardar hasta 30 segundos en la primera petición…".
- Migrar el endpoint a Vercel/Netlify (que no hibernan) o a un tier pago de Render.
- Pre-calentar el endpoint con un ping al abrir la app.

---

## 12. Fallback de preguntas con solo 4 hardcoded

**Impacto:** funcional (si el fetch falla).

Si `fetch('preguntas.json')` falla (por CORS al abrir el HTML con `file://` en ciertos navegadores, o por 404), `loadQuestions()` carga un array hardcoded de **4 preguntas** para que la app no crashee. El cuestionario funciona pero produce un resultado trivial (máximo 4 preguntas, coeficientes probablemente inventados).

Es útil para dev, peligroso en producción. Considerar:

- Mostrar un banner de error visible si se activa el fallback.
- O directamente abortar y mostrar "No se pudieron cargar las preguntas".

---

## 13. Rango F penaliza menos en relativo

**Impacto:** diseño (heredado del reglamento).

Los coeficientes A–F decrecen conforme el rango sube. Una empresa rango A (monto ≤ Bs. 10M) tiene coeficiente base 0.0016; una rango F (>Bs. 160M) tiene 0.00016 — **10 veces menos**. Combinado con el monto mayor, la multa absoluta es mayor pero la **proporción sobre el capital** es mucho menor.

No es un bug del código — refleja las tablas del reglamento. Vale la pena documentarlo como característica del modelo, no como sorpresa.

---

## Prioridad sugerida para arreglar

1. **#1 (etiqueta invertida)** — cambio de 2 líneas, error de cara al usuario.
2. **#4 y #5 (barra + steps)** — pequeño ajuste, se ven raros.
3. **#7 (`</button>` sobrante)** — 5 segundos.
4. **#12 (fallback silencioso)** — dev-time UX.
5. **#11 (Render hibernación)** — mensaje explicativo.
6. Resto: nice-to-have / refactor.
