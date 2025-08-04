-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA MULTÓMETRO CHALLENGE
-- =====================================================

-- Crear la base de datos (ejecutar solo si no existe)
-- CREATE DATABASE multometro_challenge;

-- Conectar a la base de datos
-- \c multometro_challenge;

-- =====================================================
-- TABLA: CLIENTES
-- =====================================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(50) NOT NULL,
    tipo_sociedad VARCHAR(100) NOT NULL,
    base_calculo VARCHAR(50) NOT NULL,
    monto_base DECIMAL(15,2) NOT NULL,
    porcentaje_evaluacion INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: EVALUACIONES
-- =====================================================
CREATE TABLE evaluaciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_preguntas INTEGER NOT NULL,
    respuestas_si INTEGER NOT NULL DEFAULT 0,
    respuestas_no INTEGER NOT NULL DEFAULT 0,
    porcentaje_completitud DECIMAL(5,2) NOT NULL,
    porcentaje_evaluacion DECIMAL(5,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'completada',
    observaciones TEXT
);

-- =====================================================
-- TABLA: RESPUESTAS_DETALLADAS
-- =====================================================
CREATE TABLE respuestas_detalladas (
    id SERIAL PRIMARY KEY,
    evaluacion_id INTEGER NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    respuesta VARCHAR(10) NOT NULL CHECK (respuesta IN ('yes', 'no')),
    orden_pregunta INTEGER NOT NULL,
    fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índices para la tabla clientes
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_fecha_registro ON clientes(fecha_registro);
CREATE INDEX idx_clientes_empresa ON clientes(empresa);

-- Índices para la tabla evaluaciones
CREATE INDEX idx_evaluaciones_cliente_id ON evaluaciones(cliente_id);
CREATE INDEX idx_evaluaciones_fecha ON evaluaciones(fecha_evaluacion);
CREATE INDEX idx_evaluaciones_estado ON evaluaciones(estado);

-- Índices para la tabla respuestas_detalladas
CREATE INDEX idx_respuestas_evaluacion_id ON respuestas_detalladas(evaluacion_id);
CREATE INDEX idx_respuestas_categoria ON respuestas_detalladas(categoria);
CREATE INDEX idx_respuestas_respuesta ON respuestas_detalladas(respuesta);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para actualizar fecha_actualizacion en clientes
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fecha_actualizacion
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista para resumen de evaluaciones por cliente
CREATE VIEW vista_resumen_evaluaciones AS
SELECT 
    c.id as cliente_id,
    c.nombre_completo,
    c.empresa,
    c.email,
    COUNT(e.id) as total_evaluaciones,
    MAX(e.fecha_evaluacion) as ultima_evaluacion,
    AVG(e.porcentaje_evaluacion) as promedio_evaluacion,
    SUM(e.total_preguntas) as total_preguntas_respondidas
FROM clientes c
LEFT JOIN evaluaciones e ON c.id = e.cliente_id
GROUP BY c.id, c.nombre_completo, c.empresa, c.email;

-- Vista para estadísticas por categoría
CREATE VIEW vista_estadisticas_categoria AS
SELECT 
    rd.categoria,
    COUNT(*) as total_respuestas,
    COUNT(CASE WHEN rd.respuesta = 'yes' THEN 1 END) as respuestas_si,
    COUNT(CASE WHEN rd.respuesta = 'no' THEN 1 END) as respuestas_no,
    ROUND(
        (COUNT(CASE WHEN rd.respuesta = 'yes' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) as porcentaje_si
FROM respuestas_detalladas rd
GROUP BY rd.categoria
ORDER BY rd.categoria;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para calcular estadísticas de una evaluación
CREATE OR REPLACE FUNCTION calcular_estadisticas_evaluacion(p_evaluacion_id INTEGER)
RETURNS TABLE(
    total_preguntas INTEGER,
    respuestas_si INTEGER,
    respuestas_no INTEGER,
    porcentaje_si DECIMAL(5,2),
    porcentaje_no DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_preguntas,
        COUNT(CASE WHEN rd.respuesta = 'yes' THEN 1 END)::INTEGER as respuestas_si,
        COUNT(CASE WHEN rd.respuesta = 'no' THEN 1 END)::INTEGER as respuestas_no,
        ROUND((COUNT(CASE WHEN rd.respuesta = 'yes' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) as porcentaje_si,
        ROUND((COUNT(CASE WHEN rd.respuesta = 'no' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) as porcentaje_no
    FROM respuestas_detalladas rd
    WHERE rd.evaluacion_id = p_evaluacion_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener historial de evaluaciones de un cliente
CREATE OR REPLACE FUNCTION obtener_historial_cliente(p_cliente_id INTEGER)
RETURNS TABLE(
    evaluacion_id INTEGER,
    fecha_evaluacion TIMESTAMP,
    total_preguntas INTEGER,
    respuestas_si INTEGER,
    respuestas_no INTEGER,
    porcentaje_evaluacion DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.fecha_evaluacion,
        e.total_preguntas,
        e.respuestas_si,
        e.respuestas_no,
        e.porcentaje_evaluacion
    FROM evaluaciones e
    WHERE e.cliente_id = p_cliente_id
    ORDER BY e.fecha_evaluacion DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS SOBRE LA ESTRUCTURA
-- =====================================================

/*
ESTRUCTURA DE LA BASE DE DATOS:

1. TABLA clientes:
   - Almacena información personal y de empresa del cliente
   - Incluye configuración de evaluación (tipo sociedad, base cálculo, etc.)
   - Campos únicos: email
   - Timestamps automáticos para auditoría

2. TABLA evaluaciones:
   - Registra cada evaluación completada por un cliente
   - Contiene resumen estadístico de la evaluación
   - Relacionada con clientes mediante FK

3. TABLA respuestas_detalladas:
   - Almacena cada respuesta individual del cuestionario
   - Incluye pregunta, categoría, respuesta y orden
   - Relacionada con evaluaciones mediante FK

CARACTERÍSTICAS:
- Integridad referencial con CASCADE DELETE
- Índices optimizados para consultas frecuentes
- Triggers para auditoría automática
- Vistas para reportes comunes
- Funciones para cálculos estadísticos
- Validaciones de datos (CHECK constraints)

EJEMPLO DE USO:
1. Insertar cliente
2. Crear evaluación
3. Insertar respuestas detalladas
4. Consultar estadísticas usando vistas o funciones
*/ 