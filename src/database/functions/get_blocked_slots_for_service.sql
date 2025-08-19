-- =============================================
-- Función para obtener horarios bloqueados por servicio
-- =============================================

-- Establecer timezone de Ciudad de México
SET TIME ZONE 'America/Mexico_City';

CREATE OR REPLACE FUNCTION get_blocked_slots_for_service(
    p_service_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB := '{}'::jsonb;
    v_service_duration INTEGER;
    v_service_category INTEGER;
    v_current_date DATE;
    v_current_datetime TIMESTAMPTZ;
    v_now_cdmx TIMESTAMPTZ;
    v_today_cdmx DATE;
    v_current_time_cdmx TIME;
    v_day_letter CHAR(1);
    v_date_slots JSONB;
    rec RECORD;
    time_slot TIME;
    end_time TIME;
BEGIN
    -- Establecer timezone para esta sesión
    PERFORM set_config('timezone', 'America/Mexico_City', true);
    
    -- Obtener fecha y hora actual en CDMX
    v_now_cdmx := NOW() AT TIME ZONE 'America/Mexico_City';
    v_today_cdmx := (v_now_cdmx)::DATE;
    v_current_time_cdmx := (v_now_cdmx)::TIME;
    
    -- Verificar que el servicio existe y obtener información básica
    SELECT duracion_estimada, categoria_id 
    INTO v_service_duration, v_service_category
    FROM servicios 
    WHERE id = p_service_id AND activo = true;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Service not found or inactive"}'::jsonb;
    END IF;
    
    -- Iterar por cada fecha en el rango
    v_current_date := p_start_date;
    
    WHILE v_current_date <= p_end_date LOOP
        -- Convertir fecha a timestamptz para manejar timezone correctamente
        v_current_datetime := (v_current_date || ' 00:00:00')::TIMESTAMP AT TIME ZONE 'America/Mexico_City';
        
        -- Obtener la letra del día de la semana usando timezone de CDMX
        v_day_letter := CASE EXTRACT(DOW FROM v_current_datetime AT TIME ZONE 'America/Mexico_City')
            WHEN 1 THEN 'L'  -- Lunes
            WHEN 2 THEN 'M'  -- Martes
            WHEN 3 THEN 'W'  -- Miércoles
            WHEN 4 THEN 'J'  -- Jueves
            WHEN 5 THEN 'V'  -- Viernes
            WHEN 6 THEN 'S'  -- Sábado
            WHEN 0 THEN 'D'  -- Domingo
        END;
        
        -- Inicializar array para esta fecha
        v_date_slots := '[]'::jsonb;
        
        -- Obtener todos los profesionales que pueden hacer este servicio y trabajan este día
        FOR rec IN
            WITH professional_schedules AS (
                -- Obtener horarios de profesionales que pueden hacer este servicio
                SELECT DISTINCT 
                    hp.profesional_id,
                    hp.hora_inicio,
                    hp.hora_fin
                FROM horarios_profesionales hp
                JOIN profesional_categorias pc ON hp.profesional_id = pc.profesional_id
                JOIN profesionales p ON hp.profesional_id = p.id
                WHERE pc.categoria_id = v_service_category
                  AND pc.activo = true
                  AND p.activo = true
                  AND hp.dias_trabajo LIKE '%' || v_day_letter || '%'
            ),
            time_slots AS (
                -- Generar slots de 30 minutos para todos los horarios
                SELECT DISTINCT
                    ps.profesional_id,
                    slot_time
                FROM professional_schedules ps
                CROSS JOIN LATERAL (
                    SELECT (ps.hora_inicio + (interval '30 minutes' * generate_series(0, 
                        EXTRACT(EPOCH FROM (ps.hora_fin - ps.hora_inicio))/1800 - 1
                    )))::TIME as slot_time
                ) slots
                WHERE slot_time + INTERVAL '1 minute' * v_service_duration <= ps.hora_fin
            ),
            occupied_slots AS (
                -- Obtener citas ya programadas para esta fecha (usando timezone CDMX)
                SELECT DISTINCT
                    c.profesional_id,
                    slot_time
                FROM citas c
                CROSS JOIN LATERAL (
                    SELECT (c.hora_inicio + (interval '30 minutes' * generate_series(0, 
                        EXTRACT(EPOCH FROM (c.hora_fin - c.hora_inicio))/1800 - 1
                    )))::TIME as slot_time
                ) occupied
                WHERE c.fecha = v_current_date
                  AND c.status IN ('Programada', 'Reprogramada', 'En Curso')
                  -- Para el día de hoy, solo considerar slots futuros
                  AND (v_current_date > v_today_cdmx 
                       OR (v_current_date = v_today_cdmx 
                           AND (c.hora_inicio + INTERVAL '1 minute' * v_service_duration) > v_current_time_cdmx))
            ),
            available_slots AS (
                -- Slots disponibles (que tienen al menos un profesional libre)
                SELECT DISTINCT ts.slot_time
                FROM time_slots ts
                LEFT JOIN occupied_slots os ON ts.profesional_id = os.profesional_id 
                    AND ts.slot_time = os.slot_time
                WHERE os.slot_time IS NULL
            ),
            all_possible_slots AS (
                -- Todos los slots posibles en horario laboral (cada 30 minutos de 8:00 a 20:00)
                -- Solo incluir slots futuros para el día de hoy
                SELECT slot_time::TIME
                FROM generate_series(
                    '08:00:00'::TIME, 
                    '19:30:00'::TIME, 
                    INTERVAL '30 minutes'
                ) AS slot_time
                WHERE (v_current_date > v_today_cdmx 
                       OR (v_current_date = v_today_cdmx 
                           AND (slot_time + INTERVAL '1 minute' * v_service_duration) > v_current_time_cdmx))
            )
            -- Obtener slots bloqueados (que NO están disponibles)
            SELECT aps.slot_time
            FROM all_possible_slots aps
            LEFT JOIN available_slots avs ON aps.slot_time = avs.slot_time
            WHERE avs.slot_time IS NULL
            ORDER BY aps.slot_time
        LOOP
            -- Agregar slot bloqueado al array de esta fecha
            v_date_slots := v_date_slots || to_jsonb(rec.slot_time::TEXT);
        END LOOP;
        
        -- Si hay slots bloqueados para esta fecha, agregarlos al resultado
        IF jsonb_array_length(v_date_slots) > 0 THEN
            v_result := v_result || jsonb_build_object(v_current_date::TEXT, v_date_slots);
        END IF;
        
        -- Siguiente fecha
        v_current_date := v_current_date + 1;
    END LOOP;
    
    RETURN v_result;
END;
$$;


-- =============================================
-- Crear índices para optimizar la función
-- =============================================

-- Índice compuesto para la consulta de citas por fecha y estado
CREATE INDEX IF NOT EXISTS idx_citas_fecha_status_profesional 
    ON public.citas(fecha, status, profesional_id)
    WHERE status IN ('Programada', 'En Curso');

-- Índice para profesional_categorias activos
CREATE INDEX IF NOT EXISTS idx_profesional_categorias_categoria_activo 
    ON public.profesional_categorias(categoria_id, activo)
    WHERE activo = true;

-- Índice para horarios de profesionales por días de trabajo
CREATE INDEX IF NOT EXISTS idx_horarios_profesionales_dias 
    ON public.horarios_profesionales USING gin(dias_trabajo gin_trgm_ops);

-- Extensión para búsquedas de texto si no existe
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- Comentarios de documentación
-- =============================================

COMMENT ON FUNCTION get_blocked_slots_for_service(INTEGER, DATE, DATE) IS 
'Obtiene los horarios bloqueados para un servicio específico en un rango de fechas.
Considera: horarios de profesionales, citas existentes, duración del servicio y disponibilidad.
Retorna: JSON con fechas como keys y arrays de horarios bloqueados como values.';
