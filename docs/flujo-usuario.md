# Flujo de usuario

Las 6 pantallas del flujo, en orden. Todo el estado se acumula en la variable global `userData` de `script.js`.

## 1. Bienvenida — `welcome-page`

- Icono `fa-calculator`, título "Multómetro Challenge".
- Lista de features (`.feature-list`), pasos (`.steps-list`), aviso importante (`.important-notice`).
- Sección "Antes de comenzar recuerda…" (`.remember-section`) con disclaimers.
- Botón **"🎯 Comenzar"** → `nextPage()`.

Datos capturados: ninguno.

## 2. Registro — `form-page`

Formulario con validación en tiempo real (`setupFormValidation`):

| Campo | Regla |
|-------|-------|
| Nombre completo | Requerido, min 2 caracteres |
| Empresa | Requerido, min 2 caracteres |
| Cargo | Requerido, min 2 caracteres |
| Email | Formato válido |
| Teléfono | Formato boliviano: `591[67]\d{7}` o `[67]\d{7}` |

- El campo teléfono se auto-formatea a `+591 XXX XXX XX` con `formatPhone()`.
- Los errores se muestran inline con `showFieldError`.
- Submit del form → `handleFormSubmit(e)`:
  - Valida todos los campos.
  - Guarda `userData.email`.
  - Delay artificial de 2 s (spinner).
  - `nextPage()`.

Datos que quedan en `userData`: **solo `email`**. Nombre, empresa, cargo y teléfono se validan pero no se persisten en `userData` (viven como valor del `<input>` hasta que la página se recarga).

## 3. Configuración de empresa — `company-config-page`

Tres controles:

| Control | Opciones |
|---------|----------|
| Tipo de sociedad (`<select>`) | Empresa Unipersonal · SRL · Sociedad Colectiva o Comandita · Anónima o Mixta |
| Base de cálculo (`<select>`) | Utilidad Bruta · Capital |
| Monto base (`<input type="number">`) | Bs. |

- Botón "Continuar" arranca **deshabilitado**; se habilita cuando los tres campos son válidos (`setupCompanyConfigValidation`).
- Al hacer click se llama a `validateAndContinue()` → `nextPage()`.
- **En `nextPage()`, al salir de esta pantalla, se calcula:**

  ```js
  userData.tipoSociedad     = tipoSociedad.value
  userData.baseCalculo      = calculationBase.value === 'utilidad-bruta' ? 0.8 : 1
  userData.montoBaseCalculo = parseFloat(baseAmount.value)
  ```

- Se deriva el **rango A–F** según el monto:

  | Monto (Bs.) | Rango | Factor (informativo) |
  |-------------|-------|----------------------|
  | ≤ 10 000 000 | A | 5% |
  | ≤ 20 000 000 | B | 4% |
  | ≤ 40 000 000 | C | 3% |
  | ≤ 80 000 000 | D | 2% |
  | ≤ 160 000 000 | E | 1% |
  | > 160 000 000 | F | 0.5% |

  `userData.factor` sólo se muestra en el reporte, **no se aplica al cálculo**.

## 4. % de precisión — `progress-page`

- Slider `<input type="range" min="1" max="100" value="75">`.
- 4 botones rápidos: 25% · 50% · 75% · 100%.
- Cada uno llama a `setTargetPercentage(pct)` que actualiza el slider.

El nombre "precisión" es engañoso. En realidad este valor determina **cuántas preguntas del catálogo de 48 se muestrean al azar**:

$$
n = \lceil (pct/100) \times 48 \rceil
$$

| % | Preguntas |
|---|-----------|
| 25 | 12 |
| 50 | 24 |
| 75 | 36 |
| 100 | 48 |

Click en **"Iniciar Cuestionario"** dispara `startProgressAnimation()`:

1. `await loadQuestions()` — asegura que el catálogo esté cargado.
2. `selectRandomQuestions(pct)` — muestra aleatoria uniforme sin reposición.
3. Delay artificial de 1.5 s.
4. `nextPage()` + `startQuestionnaire()`.

## 5. Cuestionario — `questions-page`

- Una pregunta por pantalla.
- Header: badge de categoría (`Comercial` / `Contable`), contador "Pregunta X de Y", barra de progreso.
- Cuerpo: texto de la pregunta, dos radios `<input name="answer">` — Sí y No.
- Click en cualquiera dispara `answerQuestion(answer)`:
  1. Calcula la multa parcial con `calcularMulta(pregunta, respuesta)`.
  2. Guarda `{question, category, answer, values, multa, nro, articulo}` en `questionAnswers`.
  3. Suma al `userData.multaTotal`.
  4. Si quedan preguntas → `displayCurrentQuestion()`. Si no → `completeQuestionnaire()`.

No hay botón "Anterior" en el cuestionario — una vez respondida una pregunta no se puede corregir salvo reiniciando desde el inicio.

## 6. Resultados — `success-page`

- Icono `fa-check-circle`, mensaje "¡Cuestionario completado!".
- `updateSuccessPageWithResults(yesAnswers, noAnswers)` inyecta 3 tarjetas: Sí · No · Total.
- Dos botones:
  - **"Quiero saber mi resultado por correo"** → `generarReportePDF()`.
  - **"Realizar nueva evaluación"** → `restartForm()` (resetea `userData` y vuelve a `welcome-page`).

Ver [reporte.md](reporte.md) para el detalle de la generación del PDF y el envío por email.

## Reinicio

`restartForm()` limpia el estado global:

```js
currentPage = 0
userData = { tipoSociedad: '', baseCalculo: 0, montoBaseCalculo: 0, rango: '',
             factor: 0, multaTotal: 0, email: '' }
allQuestions = []
selectedQuestions = []
currentQuestionIndex = 0
questionAnswers = []
```

Y muestra la pantalla de bienvenida. No borra los datos ya enviados al backend de correo si el reporte ya se generó.

## Atajos de teclado

`document.addEventListener('keydown', ...)`:

- **Alt + ←** → `prevPage()`.
- **Alt + →** → `nextPage()`.
- **Enter** sobre un `.btn` con foco → click().

No hay atajo para responder Sí/No en el cuestionario — requiere mouse.
