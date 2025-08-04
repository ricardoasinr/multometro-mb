-- =====================================================
-- EJEMPLOS DE CONSULTAS SQL PARA MULTÓMETRO CHALLENGE
-- =====================================================

-- =====================================================
-- 1. INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Insertar un cliente
INSERT INTO clientes (
    nombre_completo, 
    empresa, 
    cargo, 
    email, 
    telefono, 
    tipo_sociedad, 
    base_calculo, 
    monto_base, 
    porcentaje_evaluacion
) VALUES (
    'Juan Pérez García',
    'Tecnológica S.A.',
    'Gerente de Ventas',
    'juan.perez@tecnologica.com',
    '+34 600 123 456',
    'srl',
    'utilidad-bruta',
    50000.00,
    75
);

-- Insertar una evaluación
INSERT INTO evaluaciones (
    cliente_id,
    total_preguntas,
    respuestas_si,
    respuestas_no,
    porcentaje_completitud,
    porcentaje_evaluacion
) VALUES (
    1, -- ID del cliente insertado anteriormente
    15,
    12,
    3,
    100.00,
    80.00
);

-- Insertar respuestas detalladas
INSERT INTO respuestas_detalladas (
    evaluacion_id,
    pregunta,
    categoria,
    respuesta,
    orden_pregunta
) VALUES 
(1, '¿Su empresa está actualmente matriculada en el Registro de Comercio?', 'Comercial', 'yes', 1),
(1, '¿Lleva su empresa una contabilidad formal y actualizada?', 'Contable', 'yes', 2),
(1, '¿Cuenta su empresa con los libros contables obligatorios?', 'Contable', 'yes', 3),
(1, '¿Ha actualizado los datos de su empresa en el Registro de Comercio cuando ha sido necesario?', 'Comercial', 'no', 4),
(1, '¿Dispone su empresa de los libros corporativos obligatorios?', 'Comercial', 'yes', 5);

-- =====================================================
-- 2. CONSULTAS BÁSICAS
-- =====================================================

-- Obtener todos los clientes
SELECT * FROM clientes ORDER BY fecha_registro DESC;

-- Obtener evaluaciones de un cliente específico
SELECT 
    e.id,
    e.fecha_evaluacion,
    e.total_preguntas,
    e.respuestas_si,
    e.respuestas_no,
    e.porcentaje_evaluacion
FROM evaluaciones e
WHERE e.cliente_id = 1
ORDER BY e.fecha_evaluacion DESC;

-- Obtener respuestas detalladas de una evaluación
SELECT 
    rd.pregunta,
    rd.categoria,
    rd.respuesta,
    rd.orden_pregunta
FROM respuestas_detalladas rd
WHERE rd.evaluacion_id = 1
ORDER BY rd.orden_pregunta;

-- =====================================================
-- 3. CONSULTAS ESTADÍSTICAS
-- =====================================================

-- Estadísticas generales de todas las evaluaciones
SELECT 
    COUNT(DISTINCT c.id) as total_clientes,
    COUNT(e.id) as total_evaluaciones,
    AVG(e.porcentaje_evaluacion) as promedio_evaluacion,
    MIN(e.fecha_evaluacion) as primera_evaluacion,
    MAX(e.fecha_evaluacion) as ultima_evaluacion
FROM clientes c
LEFT JOIN evaluaciones e ON c.id = e.cliente_id;

-- Top 5 clientes con mejor porcentaje de evaluación
SELECT 
    c.nombre_completo,
    c.empresa,
    e.porcentaje_evaluacion,
    e.fecha_evaluacion
FROM clientes c
JOIN evaluaciones e ON c.id = e.cliente_id
ORDER BY e.porcentaje_evaluacion DESC
LIMIT 5;

-- Estadísticas por categoría de pregunta
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
ORDER BY porcentaje_si DESC;

-- =====================================================
-- 4. USAR LAS VISTAS CREADAS
-- =====================================================

-- Usar vista de resumen de evaluaciones
SELECT * FROM vista_resumen_evaluaciones;

-- Usar vista de estadísticas por categoría
SELECT * FROM vista_estadisticas_categoria;

-- =====================================================
-- 5. USAR LAS FUNCIONES CREADAS
-- =====================================================

-- Calcular estadísticas de una evaluación específica
SELECT * FROM calcular_estadisticas_evaluacion(1);

-- Obtener historial de evaluaciones de un cliente
SELECT * FROM obtener_historial_cliente(1);

-- =====================================================
-- 6. CONSULTAS AVANZADAS
-- =====================================================

-- Clientes que han completado evaluaciones en los últimos 30 días
SELECT 
    c.nombre_completo,
    c.empresa,
    c.email,
    COUNT(e.id) as evaluaciones_recientes,
    AVG(e.porcentaje_evaluacion) as promedio_reciente
FROM clientes c
JOIN evaluaciones e ON c.id = e.cliente_id
WHERE e.fecha_evaluacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.nombre_completo, c.empresa, c.email
ORDER BY evaluaciones_recientes DESC;

-- Análisis de tendencias por mes
SELECT 
    DATE_TRUNC('month', e.fecha_evaluacion) as mes,
    COUNT(e.id) as total_evaluaciones,
    AVG(e.porcentaje_evaluacion) as promedio_evaluacion,
    COUNT(DISTINCT e.cliente_id) as clientes_unicos
FROM evaluaciones e
GROUP BY DATE_TRUNC('month', e.fecha_evaluacion)
ORDER BY mes DESC;

-- Preguntas más problemáticas (con más respuestas "no")
SELECT 
    rd.pregunta,
    rd.categoria,
    COUNT(*) as total_respuestas,
    COUNT(CASE WHEN rd.respuesta = 'no' THEN 1 END) as respuestas_no,
    ROUND(
        (COUNT(CASE WHEN rd.respuesta = 'no' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) as porcentaje_no
FROM respuestas_detalladas rd
GROUP BY rd.pregunta, rd.categoria
HAVING COUNT(*) >= 5  -- Solo preguntas con al menos 5 respuestas
ORDER BY porcentaje_no DESC
LIMIT 10;

-- =====================================================
-- 7. CONSULTAS PARA REPORTES
-- =====================================================

-- Reporte completo de un cliente
SELECT 
    c.nombre_completo,
    c.empresa,
    c.cargo,
    c.email,
    c.telefono,
    c.tipo_sociedad,
    c.base_calculo,
    c.monto_base,
    c.porcentaje_evaluacion as porcentaje_configurado,
    e.fecha_evaluacion,
    e.total_preguntas,
    e.respuestas_si,
    e.respuestas_no,
    e.porcentaje_evaluacion as resultado_final
FROM clientes c
JOIN evaluaciones e ON c.id = e.cliente_id
WHERE c.id = 1;

-- Reporte de rendimiento por empresa
SELECT 
    c.empresa,
    COUNT(DISTINCT c.id) as total_empleados,
    COUNT(e.id) as total_evaluaciones,
    AVG(e.porcentaje_evaluacion) as promedio_empresa,
    MIN(e.porcentaje_evaluacion) as peor_evaluacion,
    MAX(e.porcentaje_evaluacion) as mejor_evaluacion
FROM clientes c
LEFT JOIN evaluaciones e ON c.id = e.cliente_id
GROUP BY c.empresa
HAVING COUNT(e.id) > 0
ORDER BY promedio_empresa DESC;

-- =====================================================
-- 8. CONSULTAS DE MANTENIMIENTO
-- =====================================================

-- Limpiar evaluaciones antiguas (más de 1 año)
-- DELETE FROM evaluaciones WHERE fecha_evaluacion < CURRENT_DATE - INTERVAL '1 year';

-- Actualizar estadísticas de una evaluación
UPDATE evaluaciones 
SET 
    respuestas_si = (
        SELECT COUNT(*) 
        FROM respuestas_detalladas 
        WHERE evaluacion_id = 1 AND respuesta = 'yes'
    ),
    respuestas_no = (
        SELECT COUNT(*) 
        FROM respuestas_detalladas 
        WHERE evaluacion_id = 1 AND respuesta = 'no'
    ),
    porcentaje_evaluacion = (
        SELECT ROUND(
            (COUNT(CASE WHEN respuesta = 'yes' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        )
        FROM respuestas_detalladas 
        WHERE evaluacion_id = 1
    )
WHERE id = 1;

-- =====================================================
-- 9. CONSULTAS DE EXPORTACIÓN
-- =====================================================

-- Exportar datos para análisis externo
SELECT 
    c.nombre_completo,
    c.empresa,
    c.email,
    e.fecha_evaluacion,
    rd.pregunta,
    rd.categoria,
    rd.respuesta,
    rd.orden_pregunta
FROM clientes c
JOIN evaluaciones e ON c.id = e.cliente_id
JOIN respuestas_detalladas rd ON e.id = rd.evaluacion_id
ORDER BY c.id, e.fecha_evaluacion, rd.orden_pregunta;

-- Exportar resumen para dashboard
SELECT 
    c.id as cliente_id,
    c.nombre_completo,
    c.empresa,
    c.email,
    COUNT(e.id) as total_evaluaciones,
    MAX(e.fecha_evaluacion) as ultima_evaluacion,
    AVG(e.porcentaje_evaluacion) as promedio_evaluacion,
    SUM(e.total_preguntas) as total_preguntas_respondidas,
    SUM(e.respuestas_si) as total_respuestas_si,
    SUM(e.respuestas_no) as total_respuestas_no
FROM clientes c
LEFT JOIN evaluaciones e ON c.id = e.cliente_id
GROUP BY c.id, c.nombre_completo, c.empresa, c.email
ORDER BY ultima_evaluacion DESC; 