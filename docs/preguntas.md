# Catálogo de preguntas

Fuente: `preguntas.json` (13 KB, 48 objetos). Existe también `preguntas.csv` con el mismo contenido, pero **la app no lo consume**.

## Estructura de un objeto

```json
{
  "nro": 7,
  "pregunta": "¿Lleva su empresa una contabilidad formal y actualizada?",
  "categoria": "Contable",
  "values": {
    "A": 0.0016, "B": 0.00128, "C": 0.00096,
    "D": 0.00064, "E": 0.00032, "F": 0.00016
  },
  "articulo": "Art. 17"
}
```

Campos:

- **`nro`** — entero 1–48, único.
- **`pregunta`** — texto de la pregunta.
- **`categoria`** — `"Comercial"` o `"Contable"`.
- **`values`** — puede tener 4 formas (ver más abajo).
- **`articulo`** — referencia al artículo del reglamento (ej. `"Art. 11"`, `"Art. 55 y 56"`).

## Cuatro formas del campo `values`

### 1. Mapping por rango A–F (mayoría — preguntas 5–37, 39–44)

Coeficientes decimales que se multiplican por `baseCalculo × montoBaseCalculo`:

```json
{ "A": 0.0011, "B": 0.00088, "C": 0.00066, "D": 0.00044, "E": 0.00022, "F": 0.00011 }
```

Existen 4 tramos según gravedad (ver [calculo-multa.md § 2](calculo-multa.md#2-fórmula-base-preguntas-537-y-3944)).

### 2. Mapping por tipo de sociedad (preguntas 2, 3, 4, 46, 47, 48)

```json
{ "empresa-unipersonal": 2200, "srl": 3200, "colectiva-comandita": 3200, "anonima-mixta": 4200 }
```

**Redundante:** el código no lee este mapping; usa los valores hardcoded en `calcularMultaEspecial`.

### 3. Mapping Sí/No (sólo pregunta 1)

```json
{ "yes": 0, "no": 16000 }
```

También redundante — la función devuelve `return 16000` fijo.

### 4. Cadena literal (preguntas 38 y 45 — sanciones no monetarias)

```
"Suspensión temporal del Presidente o Gerente de hasta 6 meses"
"Amonestación escrita"
```

No se procesa numéricamente; aporta 0 Bs. al total.

---

## Distribución por categoría

- **Comercial:** 37 preguntas (nros 1, 2, 3, 4, 5, 6, 9, 11, 12, 18, 19, 22–44 excepto contables, 46, 47, 48).
- **Contable:** 11 preguntas (nros 7, 8, 10, 13, 14, 15, 16, 17, 20, 21, 45).

## Distribución por artículo

Cada pregunta mapea 1:1 con un artículo del reglamento, en secuencia desde el Art. 11 hasta el Art. 59, con la particularidad de que la pregunta 45 cubre Arts. 55 y 56.

| Nro | Artículo | Categoría | Tipo de valor |
|-----|----------|-----------|---------------|
| 1 | Art. 11 | Comercial | Especial (16 000 Bs.) |
| 2 | Art. 12 | Comercial | Especial (por sociedad) |
| 3 | Art. 13 | Comercial | Especial (por sociedad) |
| 4 | Art. 14 | Comercial | Especial (por sociedad) |
| 5 | Art. 15 | Comercial | Coef A–F |
| 6 | Art. 16 | Comercial | Coef A–F |
| 7 | Art. 17 | Contable | Coef A–F |
| 8 | Art. 18 | Contable | Coef A–F |
| 9 | Art. 19 | Comercial | Coef A–F |
| 10 | Art. 20 | Contable | Coef A–F |
| 11 | Art. 21 | Comercial | Coef A–F |
| 12 | Art. 22 | Comercial | Coef A–F |
| 13 | Art. 23 | Contable | Coef A–F |
| 14 | Art. 24 | Contable | Coef A–F |
| 15 | Art. 25 | Contable | Coef A–F |
| 16 | Art. 26 | Contable | Coef A–F |
| 17 | Art. 27 | Contable | Coef A–F |
| 18 | Art. 28 | Comercial | Coef A–F |
| 19 | Art. 29 | Comercial | Coef A–F |
| 20 | Art. 30 | Contable | Coef A–F |
| 21 | Art. 31 | Contable | Coef A–F |
| 22 | Art. 32 | Comercial | Coef A–F |
| 23 | Art. 33 | Comercial | Coef A–F |
| 24 | Art. 34 | Comercial | Coef A–F |
| 25 | Art. 35 | Comercial | Coef A–F |
| 26 | Art. 36 | Comercial | Coef A–F |
| 27 | Art. 37 | Comercial | Coef A–F |
| 28 | Art. 38 | Comercial | Coef A–F |
| 29 | Art. 39 | Comercial | Coef A–F |
| 30 | Art. 40 | Comercial | Coef A–F |
| 31 | Art. 41 | Comercial | Coef A–F |
| 32 | Art. 42 | Comercial | Coef A–F |
| 33 | Art. 43 | Comercial | Coef A–F |
| 34 | Art. 44 | Comercial | Coef A–F |
| 35 | Art. 45 | Comercial | Coef A–F |
| 36 | Art. 46 | Comercial | Coef A–F |
| 37 | Art. 47 | Comercial | Coef A–F |
| 38 | Art. 48 | Comercial | **No monetaria** (suspensión) |
| 39 | Art. 49 | Comercial | Coef A–F |
| 40 | Art. 50 | Comercial | Coef A–F |
| 41 | Art. 51 | Comercial | Coef A–F |
| 42 | Art. 52 | Comercial | Coef A–F |
| 43 | Art. 53 | Comercial | Coef A–F |
| 44 | Art. 54 | Comercial | Coef A–F |
| 45 | Art. 55 y 56 | Contable | **No monetaria** (amonestación) |
| 46 | Art. 57 | Comercial | Especial (por sociedad) |
| 47 | Art. 58 | Comercial | Especial (por sociedad) |
| 48 | Art. 59 | Comercial | Especial (por sociedad) |

## Cómo editar el catálogo

### Añadir una pregunta

1. Añadir un objeto nuevo a `preguntas.json`.
2. Asignar un `nro` único.
3. Elegir la forma de `values` apropiada:
   - Si es una infracción "normal" con multa proporcional al monto base → mapping A–F con coeficientes.
   - Si es fija por tipo de sociedad → mapping `{empresa-unipersonal, srl, colectiva-comandita, anonima-mixta}` **y** actualizar `calcularMultaEspecial` en `script.js`.
   - Si es no monetaria → cadena literal.
4. Recargar la página; `loadQuestions()` la traerá automáticamente.

### Corregir un coeficiente

Editar el valor en `preguntas.json`. **Excepción:** si es una pregunta especial (1, 2, 3, 4, 46, 47, 48), también hay que actualizar `calcularMultaEspecial` en `script.js` porque los valores están duplicados y el código privilegia el hardcode.

### Cambiar el texto de una pregunta

Solo editar `preguntas.json`. El JS no toca el texto.

## Cargando desde el CSV

`preguntas.csv` está en el repo por conveniencia (más fácil de editar en Excel), pero **la app no lo lee**. Si haces cambios en el CSV tienes que regenerar el JSON manualmente o con un script externo (no incluido).
