# Base de datos

Los archivos `database_schema.sql` (~8 KB) y `ejemplos_consultas.sql` (~9 KB) están en el repo pero **la aplicación jamás los consulta**. No hay backend propio; toda la persistencia ocurre en memoria del navegador y desaparece al recargar.

El schema queda como **roadmap** para una futura versión con persistencia.

---

## Schema — PostgreSQL

Tres tablas + índices + trigger + dos vistas + dos funciones PL/pgSQL.

### Tabla `clientes`

Auditoría del registro más la configuración de la empresa.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | SERIAL PK | |
| `nombre_completo` | VARCHAR | |
| `empresa` | VARCHAR | |
| `cargo` | VARCHAR | |
| `email` | VARCHAR UNIQUE | Clave natural |
| `telefono` | VARCHAR | Formato boliviano |
| `tipo_sociedad` | VARCHAR | `empresa-unipersonal` \| `srl` \| ... |
| `base_calculo` | VARCHAR | `utilidad-bruta` \| `capital` |
| `monto_base` | DECIMAL(15,2) | En Bs. |
| `porcentaje_evaluacion` | INT | El % que eligió el usuario |
| `fecha_registro` | TIMESTAMP DEFAULT now() | |
| `fecha_actualizacion` | TIMESTAMP | Actualizado por trigger |

Índices: `clientes(email)`, `clientes(fecha_registro)`, `clientes(empresa)`.

### Tabla `evaluaciones`

Una fila por cuestionario completado.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | SERIAL PK | |
| `cliente_id` | INT FK → `clientes(id)` ON DELETE CASCADE | |
| `fecha_evaluacion` | TIMESTAMP DEFAULT now() | |
| `total_preguntas` | INT | Muestra elegida |
| `respuestas_si` | INT | |
| `respuestas_no` | INT | |
| `porcentaje_completitud` | DECIMAL(5,2) | Compliance |
| `porcentaje_evaluacion` | DECIMAL(5,2) | El % elegido en el slider |
| `estado` | VARCHAR(20) DEFAULT 'completada' | |
| `observaciones` | TEXT | |

Índices: `evaluaciones(cliente_id)`, `evaluaciones(fecha_evaluacion)`, `evaluaciones(estado)`.

### Tabla `respuestas_detalladas`

Una fila por pregunta respondida.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | SERIAL PK | |
| `evaluacion_id` | INT FK → `evaluaciones(id)` ON DELETE CASCADE | |
| `pregunta` | TEXT | Copia del texto |
| `categoria` | VARCHAR | `Comercial` \| `Contable` |
| `respuesta` | VARCHAR CHECK (in `'yes','no'`) | |
| `orden_pregunta` | INT | Orden dentro del cuestionario |
| `fecha_respuesta` | TIMESTAMP | |

Índices: `respuestas_detalladas(evaluacion_id)`, `respuestas_detalladas(categoria)`, `respuestas_detalladas(respuesta)`.

### Trigger

`trigger_update_fecha_actualizacion` — `BEFORE UPDATE ON clientes` — setea `fecha_actualizacion = now()`.

### Vistas

- **`vista_resumen_evaluaciones`** — Join `clientes × evaluaciones` con agregaciones básicas (total evaluaciones, promedio compliance, última fecha).
- **`vista_estadisticas_categoria`** — Conteos y % de "sí" agrupados por `categoria`.

### Funciones PL/pgSQL

- `calcular_estadisticas_evaluacion(p_evaluacion_id INT)` — recalcula los conteos de `respuestas_si` / `respuestas_no` / `porcentaje_completitud` desde `respuestas_detalladas`.
- `obtener_historial_cliente(p_cliente_id INT)` — devuelve todas las evaluaciones de un cliente ordenadas por fecha desc.

---

## Limitación importante

**El schema NO tiene columna para la multa monetaria** — ni `monto_multa` en `respuestas_detalladas`, ni `multa_total` en `evaluaciones`. Quedó de una iteración previa a que existiera el cálculo en Bs.

Si algún día se conecta la app al schema hay que migrar añadiendo al menos:

```sql
ALTER TABLE evaluaciones
  ADD COLUMN multa_total DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN tipo_sociedad VARCHAR(30),
  ADD COLUMN rango CHAR(1);

ALTER TABLE respuestas_detalladas
  ADD COLUMN monto_multa DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN articulo VARCHAR(30);
```

---

## `ejemplos_consultas.sql`

Nueve bloques con queries listas para probar el schema:

1. **INSERTs de ejemplo** — 1 cliente + 1 evaluación + 5 respuestas.
2. **Consultas básicas** — listado de clientes, evaluaciones por cliente, detalle de respuestas.
3. **Estadísticas** — totales globales, top-5 clientes por compliance, agregaciones por categoría.
4. **Vistas y funciones** — SELECT sobre `vista_resumen_evaluaciones` y llamadas a las funciones.
5. **Consultas avanzadas** — evaluaciones últimos 30 días, tendencia mensual con `DATE_TRUNC('month', ...)`, top 10 preguntas más "problemáticas".
6. **Reportes** — reporte completo de un cliente, rendimiento por empresa.
7. **Mantenimiento** — DELETE de evaluaciones >1 año (comentado), UPDATE de estadísticas con la función.
8. **Exportación tabular**.

Todos los ejemplos son didácticos — copiar/pegar en un `psql` sirve para probar el schema sin necesidad de un backend.

---

## Roadmap sugerido para conectar la BD

1. Levantar un backend mínimo (Node.js + Express, o Supabase) con endpoints:
   - `POST /clientes` — upsert por email.
   - `POST /evaluaciones` — recibe respuestas + multa total.
   - `GET /clientes/:email/historial` — devuelve `obtener_historial_cliente`.
2. Aplicar la migración de columnas de multa mencionada arriba.
3. Modificar `script.js`:
   - En `handleFormSubmit`, llamar a `POST /clientes` con todos los datos del registro (no sólo email).
   - En `completeQuestionnaire()`, guardar la evaluación completa con `POST /evaluaciones`.
4. Añadir en la UI un botón "Ver mi historial" que consulte `GET /clientes/:email/historial`.

Actualmente nada de esto está implementado. La app es 100% cliente y desechable.
