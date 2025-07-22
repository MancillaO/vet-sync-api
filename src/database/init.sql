-- =============================================
-- Database initialization script for VetSync API
-- =============================================

-- Enable necessary extensions
-- ===========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- Users and Authentication
-- ========================
CREATE TABLE public.usuarios (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    direccion TEXT NULL,
    jwt_secret TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_registro TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
) TABLESPACE pg_default;

CREATE TABLE public.refresh_tokens (
    id SERIAL NOT NULL,
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NULL DEFAULT NOW(),
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash),
    CONSTRAINT refresh_tokens_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE
) TABLESPACE pg_default;

-- Administrators
-- ==============
CREATE TABLE public.administradores (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN NULL DEFAULT true,
    fecha_registro TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT administradores_pkey PRIMARY KEY (id),
    CONSTRAINT administradores_email_key UNIQUE (email)
) TABLESPACE pg_default;

-- Pet Management
-- ==============
CREATE TABLE public.especies (
    id SERIAL NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    CONSTRAINT especies_pkey PRIMARY KEY (id),
    CONSTRAINT especies_nombre_key UNIQUE (nombre)
) TABLESPACE pg_default;

CREATE TABLE public.razas (
    id SERIAL NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie_id INTEGER NULL,
    CONSTRAINT razas_pkey PRIMARY KEY (id),
    CONSTRAINT razas_nombre_especie_id_key UNIQUE (nombre, especie_id),
    CONSTRAINT razas_especie_id_fkey 
        FOREIGN KEY (especie_id) 
        REFERENCES public.especies(id) 
        ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE TABLE public.mascotas (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    cliente_id UUID NOT NULL,
    especie_id INTEGER NOT NULL,
    raza_id INTEGER NOT NULL,
    edad INTEGER NULL,
    sexo CHAR(1) NULL,
    img_url TEXT NULL,
    fecha_registro TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NULL DEFAULT true,
    CONSTRAINT mascotas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_cliente 
        FOREIGN KEY (cliente_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_especie 
        FOREIGN KEY (especie_id) 
        REFERENCES public.especies(id),
    CONSTRAINT fk_raza 
        FOREIGN KEY (raza_id) 
        REFERENCES public.razas(id),
    CONSTRAINT mascotas_sexo_check 
        CHECK (sexo = ANY (ARRAY['M'::bpchar, 'H'::bpchar]))
) TABLESPACE pg_default;

-- Services
-- ========
CREATE TABLE public.categorias_servicio (
    id SERIAL NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NULL DEFAULT true,
    CONSTRAINT categorias_servicio_pkey PRIMARY KEY (id),
    CONSTRAINT categorias_servicio_nombre_key UNIQUE (nombre)
) TABLESPACE pg_default;

CREATE TABLE public.servicios (
    id SERIAL NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    categoria_id INTEGER NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    duracion_estimada INTEGER NOT NULL, -- en minutos
    img_url TEXT NULL,
    activo BOOLEAN NULL DEFAULT true,
    CONSTRAINT servicios_pkey PRIMARY KEY (id),
    CONSTRAINT fk_categoria 
        FOREIGN KEY (categoria_id) 
        REFERENCES public.categorias_servicio(id) 
        ON DELETE RESTRICT
) TABLESPACE pg_default;


-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users and Authentication
-- ========================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON public.usuarios (activo) 
    WHERE activo = true TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_usuarios_fecha_registro ON public.usuarios (fecha_registro) 
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON public.refresh_tokens (token_hash) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens (user_id) 
    TABLESPACE pg_default;

-- Administrators
-- ==============
CREATE INDEX IF NOT EXISTS idx_administradores_email ON public.administradores (email) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_administradores_activo ON public.administradores (activo) 
    WHERE activo = true TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_administradores_fecha_registro ON public.administradores (fecha_registro) 
    TABLESPACE pg_default;

-- Pet Management
-- ==============
CREATE INDEX IF NOT EXISTS idx_especies_nombre ON public.especies (nombre) 
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_razas_nombre ON public.razas (nombre) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_razas_especie_id ON public.razas (especie_id) 
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mascotas_cliente_id ON public.mascotas (cliente_id) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_mascotas_especie_id ON public.mascotas (especie_id) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_mascotas_raza_id ON public.mascotas (raza_id) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_mascotas_activo ON public.mascotas (activo) 
    WHERE activo = true TABLESPACE pg_default;

-- Services
-- ========
CREATE INDEX IF NOT EXISTS idx_categorias_servicio_activo ON public.categorias_servicio (activo) 
    WHERE activo = true TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_servicios_categoria_id ON public.servicios (categoria_id) 
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON public.servicios (activo) 
    WHERE activo = true TABLESPACE pg_default;