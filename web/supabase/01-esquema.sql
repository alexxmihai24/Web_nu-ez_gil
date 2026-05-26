-- =============================================================================
-- Núñez Gil — Esquema del catálogo (Fase A · Supabase / Postgres)
-- -----------------------------------------------------------------------------
-- Ejecutar en: Supabase → SQL Editor → pegar todo → Run.
-- Idempotente: se puede reejecutar sin error (DROP/CREATE controlado).
-- RLS: el catálogo es PÚBLICO de lectura (precios públicos, decisión de cliente).
--      La escritura queda denegada para anon/authenticated (solo service_role).
-- Precios en CÉNTIMOS enteros, SIN IVA.
-- =============================================================================

-- Enum de disponibilidad (coincide con el contrato lib/data/types.ts)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'disponibilidad') then
    create type disponibilidad as enum ('in_stock', 'on_order', 'out_of_stock');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- CATEGORÍAS (árbol auto-referenciado por slug · 3 niveles)
-- ----------------------------------------------------------------------------
create table if not exists categorias (
  slug         text primary key,
  nombre       text not null,
  nivel        smallint not null default 1,           -- 1 depto · 2 categoría · 3 subcategoría
  parent_slug  text references categorias(slug) on delete set null,
  imagen_url   text,
  posicion     integer not null default 0,
  activa       boolean not null default true
);
create index if not exists idx_categorias_parent on categorias(parent_slug);
create index if not exists idx_categorias_orden on categorias(nivel, posicion);

-- ----------------------------------------------------------------------------
-- MARCAS
-- ----------------------------------------------------------------------------
create table if not exists marcas (
  slug             text primary key,
  nombre           text not null,
  logo_url         text,
  es_marca_propia  boolean not null default false,    -- marcas propias NG
  posicion         integer not null default 0,
  activa           boolean not null default true
);
create index if not exists idx_marcas_orden on marcas(posicion);

-- ----------------------------------------------------------------------------
-- PRODUCTOS (ficha)
-- ----------------------------------------------------------------------------
create table if not exists productos (
  slug            text primary key,
  nombre          text not null,
  referencia      text not null,
  descripcion     text,
  marca_slug      text references marcas(slug) on delete set null,
  categoria_slug  text references categorias(slug) on delete set null,  -- categoría primaria
  imagen_url      text,
  especificaciones jsonb not null default '[]'::jsonb,  -- [{ "label": "...", "value": "..." }]
  es_nuevo        boolean not null default false,
  es_oferta       boolean not null default false,
  es_outlet       boolean not null default false,
  destacado       boolean not null default false,
  activo          boolean not null default true,
  creado_en       timestamptz not null default now()
);
create index if not exists idx_productos_categoria on productos(categoria_slug);
create index if not exists idx_productos_marca on productos(marca_slug);
create index if not exists idx_productos_nuevo on productos(es_nuevo) where es_nuevo;
create index if not exists idx_productos_oferta on productos(es_oferta) where es_oferta;
create index if not exists idx_productos_outlet on productos(es_outlet) where es_outlet;

-- ----------------------------------------------------------------------------
-- VARIANTES (SKU vendible · precio en céntimos sin IVA)
-- ----------------------------------------------------------------------------
create table if not exists variantes_producto (
  id                       bigint generated always as identity primary key,
  producto_slug            text not null references productos(slug) on delete cascade,
  sku                      text not null,
  formato_pack             text,
  precio_centimos          integer,                   -- null → "Consultar precio"
  precio_anterior_centimos integer,                   -- tachado (oferta)
  precio_unidad_centimos   integer,
  disponibilidad           disponibilidad not null default 'in_stock',
  posicion                 integer not null default 0
);
create index if not exists idx_variantes_producto on variantes_producto(producto_slug, posicion);

-- ----------------------------------------------------------------------------
-- IMÁGENES (galería)
-- ----------------------------------------------------------------------------
create table if not exists imagenes_producto (
  id             bigint generated always as identity primary key,
  producto_slug  text not null references productos(slug) on delete cascade,
  url            text not null,
  posicion       integer not null default 0
);
create index if not exists idx_imagenes_producto on imagenes_producto(producto_slug, posicion);

-- ----------------------------------------------------------------------------
-- RLS — Row Level Security: lectura pública del catálogo, escritura denegada.
-- ----------------------------------------------------------------------------
alter table categorias          enable row level security;
alter table marcas              enable row level security;
alter table productos           enable row level security;
alter table variantes_producto  enable row level security;
alter table imagenes_producto   enable row level security;

-- Política de SOLO LECTURA para anon + authenticated en cada tabla.
do $$
declare t text;
begin
  foreach t in array array['categorias','marcas','productos','variantes_producto','imagenes_producto']
  loop
    execute format('drop policy if exists "lectura_publica" on %I;', t);
    execute format(
      'create policy "lectura_publica" on %I for select to anon, authenticated using (true);', t
    );
  end loop;
end$$;

-- (No se crean políticas de INSERT/UPDATE/DELETE → escritura solo con service_role,
--  que ignora RLS. El seed se ejecuta como propietario en el SQL Editor.)
