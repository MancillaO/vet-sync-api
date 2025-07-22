-- =============================================
-- SEED DATA - Datos iniciales para VetSync API
-- =============================================

-- =============================================
-- Categorías de Servicio
-- =============================================
INSERT INTO public.categorias_servicio (nombre, descripcion) VALUES
    ('Veterinaria', 'Servicios veterinarios'),
    ('Estetica', 'Servicios estéticos'),
ON CONFLICT (nombre) DO NOTHING;

