-- =============================================
-- SEED DATA - Datos iniciales para VetSync API
-- =============================================

-- Nota: Este script asume que ya se ha ejecutado init.sql
-- Ejecutar con: psql -U postgres -d tu_base_de_datos -f seed.sql

-- =============================================
-- Categorías de Servicio
-- =============================================
INSERT INTO public.categorias_servicio (nombre, descripcion) VALUES
    ('Veterinaria', 'Servicios veterinarios'),
    ('Estetica', 'Servicios estéticos'),
ON CONFLICT (nombre) DO NOTHING;
