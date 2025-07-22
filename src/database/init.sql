-- Database initialization script for VetSync API
-- This script creates the necessary tables and sets up the database structure

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
create table usuarios (
  id uuid not null default extensions.uuid_generate_v4 (),
  nombre character varying(100) not null,
  apellido character varying(100) not null,
  email character varying(150) not null,
  telefono character varying(20) null,
  password character varying(255) not null,
  direccion text null,
  jwt_secret text not null,
  activo boolean not null default true,
  fecha_registro timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint usuarios_pkey primary key (id),
  constraint usuarios_email_key unique (email)
) TABLESPACE pg_default;

-- Create refresh tokens table
create table refresh_tokens (
  id serial not null,
  user_id uuid not null,
  token_hash text not null,
  created_at timestamp with time zone null default now(),
  constraint refresh_tokens_pkey primary key (id),
  constraint refresh_tokens_token_hash_key unique (token_hash),
  constraint refresh_tokens_user_id_fkey foreign KEY (user_id) references usuarios (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
create index IF not exists idx_refresh_tokens_token_hash on public.refresh_tokens using btree (token_hash) TABLESPACE pg_default;
create index IF not exists idx_refresh_tokens_user_id on public.refresh_tokens using btree (user_id) TABLESPACE pg_default;
