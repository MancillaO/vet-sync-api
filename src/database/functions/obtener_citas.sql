CREATE OR REPLACE FUNCTION public.obtener_citas_detalle(p_cita_id integer DEFAULT NULL::integer)
 RETURNS TABLE(
    id integer, 
    fecha date, 
    hora_inicio time without time zone, 
    hora_fin time without time zone, 
    nombre_cliente character varying, 
    nombre_mascota character varying, 
    img_url character varying,
    nombre_profesional character varying, 
    nombre_servicio character varying, 
    motivo_consulta text, 
    status character varying, 
    fecha_creacion timestamp with time zone, 
    fecha_actualizacion timestamp with time zone
)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        CONCAT(u.nombre, ' ', u.apellido)::VARCHAR(201) as nombre_cliente,
        m.nombre::VARCHAR(100) as nombre_mascota,
        m.img_url::VARCHAR(255) as img_url,
        CONCAT(p.nombre, ' ', p.apellido)::VARCHAR(201) as nombre_profesional,
        s.nombre::VARCHAR(100) as nombre_servicio,
        c.motivo_consulta,
        c.status::VARCHAR(20),
        c.fecha_creacion,
        c.fecha_actualizacion
    FROM citas c
    INNER JOIN mascotas m ON c.mascota_id = m.id
    INNER JOIN usuarios u ON m.cliente_id = u.id
    INNER JOIN profesionales p ON c.profesional_id = p.id
    INNER JOIN servicios s ON c.servicio_id = s.id
    WHERE 
        (p_cita_id IS NULL OR c.id = p_cita_id)
    ORDER BY c.fecha DESC, c.hora_inicio DESC;
END;
$function$