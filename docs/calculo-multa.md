# Cálculo de multa — matemática

Este documento describe **exactamente** cómo se calcula la multa proyectada. Todas las fórmulas y constantes están tomadas de `script.js` (funciones `calcularMulta`, `calcularMultaEspecial`, y del bloque `nextPage` que deriva `rango` y `factor`).

Toda la aritmética corre en cliente sobre los datos que el usuario ingresó y sobre las respuestas Sí/No del cuestionario.

---

## 1. Variables de entrada

Al terminar la pantalla de configuración de empresa (`company-config-page`), `userData` contiene:

| Campo | Valor |
|-------|-------|
| `tipoSociedad` | `'empresa-unipersonal'` \| `'srl'` \| `'colectiva-comandita'` \| `'anonima-mixta'` |
| `baseCalculo` | `0.8` si se eligió "Utilidad Bruta", `1.0` si se eligió "Capital" |
| `montoBaseCalculo` | Monto en Bs. ingresado por el usuario |
| `rango` | `'A'` \| `'B'` \| `'C'` \| `'D'` \| `'E'` \| `'F'` (derivado del monto) |
| `factor` | 5, 4, 3, 2, 1, 0.5 (informativo — **no interviene en el cálculo**) |

### Derivación de `rango` y `factor`

```
monto ≤ 10 000 000       → rango A, factor 5
monto ≤ 20 000 000       → rango B, factor 4
monto ≤ 40 000 000       → rango C, factor 3
monto ≤ 80 000 000       → rango D, factor 2
monto ≤ 160 000 000      → rango E, factor 1
monto > 160 000 000      → rango F, factor 0.5
```

**Importante:** `factor` sólo aparece como texto en el reporte (`"Rango: A (Factor: 5%)"`). El coeficiente real que interviene en la fórmula está declarado por cada pregunta en `preguntas.json` bajo la clave `values.<rango>`.

---

## 2. Fórmula base (preguntas 5–37 y 39–44)

Para cada pregunta respondida **"No"**:

$$
\text{multa}_{\text{pregunta}} = \text{baseCalculo} \times \text{montoBaseCalculo} \times \text{values}[\text{rango}]
$$

donde `values[rango]` es un coeficiente decimal declarado en la pregunta. Estos coeficientes forman **4 tramos** según la gravedad del artículo:

| Coef A | Coef B | Coef C | Coef D | Coef E | Coef F | Gravedad |
|--------|--------|--------|--------|--------|--------|----------|
| 0.0016 | 0.00128 | 0.00096 | 0.00064 | 0.00032 | 0.00016 | Más grave |
| 0.0014 | 0.00112 | 0.00084 | 0.00056 | 0.00028 | 0.00014 | Grave |
| 0.0011 | 0.00088 | 0.00066 | 0.00044 | 0.00022 | 0.00011 | Medio |
| 0.0007 | 0.00056 | 0.00042 | 0.00028 | 0.00014 | 0.00007 | Leve |

Los coeficientes decrecen conforme el rango es más alto (empresas más grandes), y su magnitud depende de la gravedad del artículo violado.

### Ejemplo

Empresa Anónima (`anonima-mixta`) con **Capital = Bs. 5 000 000**:

- Rango A (monto ≤ 10M), `baseCalculo = 1.0`.
- Pregunta grave respondida "No", `values.A = 0.0016`.

$$
\text{multa} = 1.0 \times 5\,000\,000 \times 0.0016 = \text{Bs. } 8\,000
$$

Si esa misma empresa hubiera declarado **Utilidad Bruta = Bs. 5 000 000** en vez de Capital:

$$
\text{multa} = 0.8 \times 5\,000\,000 \times 0.0016 = \text{Bs. } 6\,400
$$

---

## 3. Multas fijas por tipo de sociedad — preguntas 1, 2, 3, 4, 46, 47, 48

Estas siete preguntas están hardcoded en la función `calcularMultaEspecial(nro)` y **ignoran** por completo `baseCalculo` y `montoBaseCalculo`. Devuelven un monto fijo en Bs. según el tipo de sociedad:

| Nro | Art. | Empresa Unipersonal | SRL | Colectiva / Comandita | S.A. / Mixta |
|-----|------|---------------------|-----|----------------------|--------------|
| **1** | Art. 11 | 16 000 | 16 000 | 16 000 | 16 000 |
| **2** | Art. 12 | 2 200 | 3 200 | 3 200 | 4 200 |
| **3** | Art. 13 | 1 100 | 1 600 | 1 600 | 2 100 |
| **4** | Art. 14 | 200 | 400 | 400 | 600 |
| **46** | Art. 57 | 3 100 | 6 100 | 6 100 | 9 100 |
| **47** | Art. 58 | 5 000 | 10 000 | 10 000 | 15 000 |
| **48** | Art. 59 | 18 000 | 18 000 | 18 000 | 18 000 |

Notas:

- La pregunta 1 devuelve **`return 16000`** sin mapping — todos los tipos pagan lo mismo.
- La pregunta 48 idem, 18 000 Bs. para todos.
- Las demás sí distinguen por sociedad.

Estas cifras están duplicadas en `preguntas.json` bajo `values` con la forma `{"empresa-unipersonal": ..., "srl": ..., "colectiva-comandita": ..., "anonima-mixta": ...}`, pero **el código no las lee del JSON** — las tiene hardcoded en `calcularMultaEspecial`. Si se editan en el JSON no se reflejan en la multa; hay que editar el `.js` también.

---

## 4. Sanciones no monetarias — preguntas 38 y 45

Dos preguntas contemplan sanciones que no son en Bs.:

- **Pregunta 38 (Art. 48)** — Publicación de memoria anual en S.A.:
  `"Suspensión temporal del Presidente o Gerente de hasta 6 meses"`
- **Pregunta 45 (Arts. 55 y 56)** — Normas del Colegio de Auditores:
  `"Amonestación escrita"`

`calcularMulta` retorna **0 Bs.** para ambas cuando la respuesta es "No" (solo hace `console.log`). No aparecen en el detalle de multas del reporte, pero sí en el conteo de respuestas.

---

## 5. Cómo interviene el % de precisión

**El % NO afecta a la multa por pregunta**. Sólo determina cuántas preguntas del catálogo (48) se muestrean:

$$
n_{\text{muestra}} = \lceil (pct/100) \times 48 \rceil
$$

| % | Preguntas |
|---|-----------|
| 25 | 12 |
| 50 | 24 |
| 75 | 36 |
| 100 | 48 |

Es una muestra aleatoria uniforme sin reposición (`selectRandomQuestions`).

Efecto real: al muestrear menos preguntas, la multa proyectada es menor **por omisión estadística** (menos oportunidades de responder "No"), no porque el algoritmo escale nada.

---

## 6. Fórmula global

$$
\text{multaTotal} = \sum_{i \in \text{selectedQuestions}} \text{multa}_i(\text{respuesta}_i)
$$

donde `multa_i(respuesta_i)` es la multa parcial que devuelve `calcularMulta` — 0 si respondió "Sí", 0 si es sanción no monetaria (P38, P45), un valor en Bs. si respondió "No" en una pregunta que sí penaliza.

**Sin topes, sin mínimos, sin factor multiplicativo adicional.** El `userData.factor` (5%, 4%, ..., 0.5%) que se muestra en el reporte no se aplica.

---

## 7. Nivel de compliance

Indicador cualitativo mostrado en el reporte:

$$
\text{compliance} = \operatorname{round}\left( \frac{\text{respuestasSi}}{n_{\text{muestra}}} \times 100 \right) \%
$$

Se pinta como una barra roja/naranja en el PDF. **No interviene en la multa.**

---

## 8. Ejemplo numérico completo

**Empresa:** SRL, base Capital, monto Bs. 15 000 000.

Derivación:

- `baseCalculo = 1.0` (Capital).
- Rango: `monto ≤ 20M` → **B**, factor 4 (informativo).

Elige **50% de precisión** → muestra 24 preguntas.

Supongamos que las respuestas caen así:

| Nro | Art | Categoría | Coef B | Respuesta | Multa parcial (Bs.) |
|-----|-----|-----------|--------|-----------|---------------------|
| 3 | Art. 13 | — (especial) | — | No | 1 600 (fija SRL) |
| 5 | Art. 15 | Comercial | 0.00128 (grave) | No | 1 × 15M × 0.00128 = 19 200 |
| 7 | Art. 17 | Contable | 0.00128 (más grave) | No | 1 × 15M × 0.00128 = 19 200 |
| 12 | Art. 22 | Comercial | 0.00088 (medio) | No | 1 × 15M × 0.00088 = 13 200 |
| 25 | Art. 35 | Comercial | 0.00056 (leve) | No | 1 × 15M × 0.00056 = 8 400 |
| 38 | Art. 48 | Comercial | — (no monetaria) | No | 0 |
| 47 | Art. 58 | Comercial | — (especial) | No | 10 000 (fija SRL) |
| resto | — | — | — | Sí | 0 |

**Multa total:** 1 600 + 19 200 + 19 200 + 13 200 + 8 400 + 0 + 10 000 = **Bs. 71 600**

**Compliance:** 17 Sí / 24 total = **71%**.

En el reporte aparecería:

- Tipo: Sociedad de Responsabilidad Limitada.
- Base: "Utilidad Bruta" (⚠️ **etiqueta invertida, en realidad se eligió Capital** — ver [known-issues.md](known-issues.md)).
- Monto base: Bs. 15 000 000.
- Rango: B (Factor: 4%).
- Total multas: **Bs. 71 600,00**.

---

## 9. Casos borde

### Rango F (empresas muy grandes)

Los coeficientes A–F decrecen conforme aumenta el rango; en F son la mitad de los de E. Esto significa que empresas gigantes pagan **menos por cada infracción** en términos absolutos (¿sí?). Este es un diseño del reglamento, no un bug del código — pero merece verificarse contra la fuente oficial.

Ejemplo: pregunta grave (coef F = 0.00014), monto Capital = Bs. 500 000 000:

$$
\text{multa} = 1.0 \times 500\,000\,000 \times 0.00014 = \text{Bs. } 70\,000
$$

Comparado con una empresa rango A (monto Bs. 5M) con la misma pregunta grave:

$$
\text{multa} = 1.0 \times 5\,000\,000 \times 0.0016 = \text{Bs. } 8\,000
$$

La empresa grande paga más en absolutos pero **muchísimo menos en proporción al capital**.

### Respondió todas "Sí"

Multa total = Bs. 0. Compliance = 100%.

### Respondió todas "No"

Multa total = suma de todas las multas parciales activas en la muestra. Puede llegar a valores altos si `montoBaseCalculo` es grande y la muestra es 100%.

### Base Utilidad Bruta = 0

Si el usuario ingresa 0 en monto base (validación mínima permite valores ≥ 1 en el HTML, pero un submit forzado podría enviar 0), todas las multas normales serían 0. Las especiales (1, 2, 3, 4, 46, 47, 48) seguirían aportando por su valor fijo.

### Pregunta desconocida

Si el JSON alguna vez incluye una pregunta con `nro` no cubierto por `calcularMultaEspecial` y con `values` malformado, `calcularMulta` retorna 0 y hace `console.warn`. La app no crashea.

---

## 10. Resumen de fórmulas

$$
\text{multa}_{\text{normal}}(cat) = \text{baseCalculo} \times \text{montoBaseCalculo} \times \text{values}[\text{rango}]
$$

$$
\text{multa}_{\text{especial}}(nro) = f(\text{tipoSociedad}) \quad \text{(tabla fija en } \texttt{calcularMultaEspecial}\text{)}
$$

$$
\text{multa}_{\text{no monetaria}} = 0
$$

$$
\text{multaTotal} = \sum_{i} \text{multa}_i(\text{respuesta}_i = \text{"No"})
$$

$$
\text{compliance} = \frac{\text{respuestasSi}}{n_{\text{muestra}}} \times 100
$$

$$
n_{\text{muestra}} = \left\lceil \frac{pct}{100} \times 48 \right\rceil
$$
