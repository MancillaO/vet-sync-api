-- SEED DATA - Datos iniciales para VetSync API

-- Categorías de Servicio
INSERT INTO public.categorias_servicio (nombre, descripcion)
VALUES ('Veterinaria', 'Servicios veterinarios'),
  ('Estetica', 'Servicios estéticos'),
  ON CONFLICT (nombre) DO NOTHING;


-- Servicios
INSERT INTO servicios (nombre, descripcion, categoria_id, precio, duracion_estimada) VALUES
('Consulta Médica General', 'Consulta médica general y chequeo de rutina', 1, 250.00, 30),
('Vacunación Básica', 'Aplicación de vacunas esenciales', 1, 300.00, 30),
('Vacunación Completa', 'Plan completo de vacunación anual', 1, 900.00, 30),
('Esterilización', 'Castración y esterilización', 1, 1200.00, 120),
('Radiografía', 'Estudio radiológico diagnóstico', 1, 400.00, 30),
('Ecografía', 'Estudio ecográfico diagnóstico', 1, 600.00, 45),
('Análisis de Sangre', 'Hemograma y química sanguínea', 1, 500.00, 30),
('Análisis de Orina', 'Urianálisis completo', 1, 250.00, 10),
('Consulta Nutricional', 'Asesoramiento nutricional especializado', 1, 300.00, 30),
('Atención de Heridas', 'Limpieza y curación de heridas', 1, 200.00, 30),
('Baño Básico', 'Baño con champú básico y secado', 2, 150.00, 30),
('Baño Premium', 'Baño con productos premium y acondicionador', 2, 250.00, 45),
('Corte de Pelo', 'Corte y arreglo del pelaje según raza', 2, 200.00, 60),
('Corte Creativo', 'Cortes creativos y diseños especiales', 2, 300.00, 90),
('Limpieza de Oídos', 'Limpieza profunda de oídos', 2, 100.00, 15),
('Cepillado de Dientes', 'Limpieza dental básica', 2, 150.00, 20),
('Spa Completo', 'Baño, corte, uñas, oídos y relajación', 2, 450.00, 120),
('Tratamiento Antipulgas', 'Baño medicado antipulgas y garrapatas', 2, 200.00, 50),
('Hidratación de Pelaje', 'Tratamiento hidratante para pelaje seco', 2, 150.00, 40),
('Pedicura Completa', 'Arreglo completo de patas y almohadillas', 2, 120.00, 20),
('Prueba', 'Servicio para probar api de servicios', 2, 250.00, 190),
('Desparasitación', 'Tratamiento antiparasitario interno y externo', 1, 250.00, 30);

-- Especies
INSERT INTO public.especies (nombre)
VALUES ('Perro'),
  ('Gato'),
  ('Hamster'),
  ('Tortuga'),
  ('Pez'),
  ('Pájaro'),
  ('Reptil');