# Referencias legales

Este documento mapea las 48 preguntas del cuestionario a los artículos del reglamento boliviano, y explica de dónde vienen las cifras hardcoded en el código.

## Norma aplicable

**Resolución RA/AEMP/Nº009/2021** — *Reglamento de Sanciones e Infracciones Comerciales y Contables* de la **Autoridad de Fiscalización de Empresas (AEMP)** de Bolivia.

La app no incluye el texto oficial ni un enlace a la Gaceta Oficial. Cada pregunta lleva un campo `articulo` con la referencia (formato `"Art. 11"`, `"Art. 55 y 56"`).

---

## Origen de las cifras

Todas las cifras del código provienen (según los disclaimers) de las tablas del propio reglamento tal como estaban al momento de escribirse `script.js` y `preguntas.json`:

- **Coeficientes A–F** (0.0016, 0.00128, 0.00096, ...) — declarados en `preguntas.json` bajo `values.<rango>`.
- **Multas fijas por tipo de sociedad** (16 000, 2 200, 3 200, 4 200, ...) — hardcoded en `calcularMultaEspecial(nro)` en `script.js`. También aparecen (redundantemente) en el JSON pero **el código no las lee de ahí**.
- **Sanciones no monetarias** (suspensión temporal, amonestación escrita) — cadenas literales en el JSON.
- **Rangos A–F según monto** (10M / 20M / 40M / 80M / 160M) — hardcoded en `nextPage()`.

**No hay una fuente única de la verdad.** Si el reglamento cambia hay que actualizar:

1. Los coeficientes de cada pregunta en `preguntas.json`.
2. La función `calcularMultaEspecial(nro)` en `script.js`.
3. Los umbrales de rango en `nextPage()`.

---

## Mapeo pregunta → artículo

### Registro de Comercio y Matrícula (Arts. 11–14)

| Nro | Art. | Tema |
|-----|------|------|
| 1 | Art. 11 | Registro / matrícula ante AEMP |
| 2 | Art. 12 | Actualización / renovación |
| 3 | Art. 13 | Comunicación de modificaciones |
| 4 | Art. 14 | Cumplimiento de requisitos formales |

### Inscripción y actualización de actos (Arts. 15–16)

| Nro | Art. | Tema |
|-----|------|------|
| 5 | Art. 15 | Inscripción de actos societarios |
| 6 | Art. 16 | Actualización de datos societarios |

### Libros y estados financieros (Arts. 17–27)

| Nro | Art. | Tema |
|-----|------|------|
| 7 | Art. 17 | Contabilidad formal y actualizada |
| 8 | Art. 18 | Libros contables obligatorios |
| 9 | Art. 19 | Registros comerciales |
| 10 | Art. 20 | Estados financieros anuales |
| 11 | Art. 21 | Libros contables auxiliares |
| 12 | Art. 22 | Custodia de documentos |
| 13 | Art. 23 | Balances anuales |
| 14 | Art. 24 | Presentación de estados |
| 15 | Art. 25 | Documentación complementaria |
| 16 | Art. 26 | Notas a los estados financieros |
| 17 | Art. 27 | Conservación de documentación contable |

### Correspondencia, archivo, auditorías, publicación (Arts. 28–32)

| Nro | Art. | Tema |
|-----|------|------|
| 18 | Art. 28 | Correspondencia comercial |
| 19 | Art. 29 | Archivo empresarial |
| 20 | Art. 30 | Auditorías externas |
| 21 | Art. 31 | Informes de auditoría |
| 22 | Art. 32 | Publicación de estados |

### Aportes, utilidades, reserva legal (Arts. 33–35)

| Nro | Art. | Tema |
|-----|------|------|
| 23 | Art. 33 | Aportes societarios |
| 24 | Art. 34 | Distribución de utilidades |
| 25 | Art. 35 | Reserva legal |

### Registros, asambleas, juntas (Arts. 36–45)

| Nro | Art. | Tema |
|-----|------|------|
| 26 | Art. 36 | Libros de actas |
| 27 | Art. 37 | Asambleas de socios |
| 28 | Art. 38 | Juntas de accionistas |
| 29 | Art. 39 | Convocatorias |
| 30 | Art. 40 | Quórum y votaciones |
| 31 | Art. 41 | Documentación de sesiones |
| 32 | Art. 42 | Poderes y representaciones |
| 33 | Art. 43 | Impugnaciones |
| 34 | Art. 44 | Modificaciones estatutarias |
| 35 | Art. 45 | Aumento / reducción de capital |

### Directorio (Arts. 46–47)

| Nro | Art. | Tema |
|-----|------|------|
| 36 | Art. 46 | Composición del directorio |
| 37 | Art. 47 | Funciones y responsabilidades |

### Memoria SA (Art. 48) — **sanción no monetaria**

| Nro | Art. | Tema | Sanción |
|-----|------|------|---------|
| 38 | Art. 48 | Publicación de memoria anual | Suspensión temporal del Presidente o Gerente de hasta 6 meses |

### Fianzas, directores, síndicos, reducción de capital (Arts. 49–52)

| Nro | Art. | Tema |
|-----|------|------|
| 39 | Art. 49 | Fianzas de directores |
| 40 | Art. 50 | Directores externos |
| 41 | Art. 51 | Síndicos |
| 42 | Art. 52 | Reducción de capital |

### Sociedades extranjeras (Arts. 53–54)

| Nro | Art. | Tema |
|-----|------|------|
| 43 | Art. 53 | Inscripción de sucursales |
| 44 | Art. 54 | Cumplimiento de obligaciones |

### Colegio de Auditores (Arts. 55 y 56) — **sanción no monetaria**

| Nro | Art. | Tema | Sanción |
|-----|------|------|---------|
| 45 | Art. 55 y 56 | Cumplimiento de normas del Colegio de Auditores | Amonestación escrita |

### Inspección administrativa y cumplimiento (Arts. 57–59)

| Nro | Art. | Tema |
|-----|------|------|
| 46 | Art. 57 | Inspección administrativa |
| 47 | Art. 58 | Información a la AEMP |
| 48 | Art. 59 | Cumplimiento de resoluciones |

---

## Disclaimer legal (obligatorio)

**Esta herramienta es una simulación. No sustituye la revisión oficial de la AEMP ni la asesoría de un profesional.**

- Los montos son estimados basados en las tablas del reglamento tal como estaban al momento de escribir el código.
- El reglamento puede haber sido modificado desde entonces.
- La AEMP aplica factores agravantes/atenuantes (reincidencia, gravedad concreta, subsanación voluntaria) que este simulador NO contempla.
- Las sanciones no monetarias (Arts. 48 y 55/56) se muestran solo como referencia — sus alcances reales dependen del proceso administrativo.
- Consulta siempre la versión vigente del reglamento en la Gaceta Oficial de Bolivia y a un asesor legal antes de tomar decisiones.

Este disclaimer aparece también en el reporte PDF generado (bloque `.disclaimer` amarillo) y en la pantalla de bienvenida.
