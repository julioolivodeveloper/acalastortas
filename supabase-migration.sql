-- ============================================================
-- MIGRACIÓN: Aca Las Tortas El Paso — producción
-- Ejecutar en: Supabase → SQL Editor → New Query
-- Es seguro correr varias veces (usa IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- 1. Columna ingredients en menu_items (necesaria para agregar platillos con ingredientes)
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS ingredients TEXT[] DEFAULT '{}';

-- 2. Tabla app_settings (necesaria para Stripe — almacena claves de forma segura)
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas: solo service_role puede leer/escribir settings
-- (las rutas API /api/stripe/* usan SUPABASE_SERVICE_ROLE_KEY, que ignora RLS)

-- 3. Función atómica para incrementar puntos de cliente
--    Evita race condition cuando dos pedidos del mismo cliente llegan simultáneamente
CREATE OR REPLACE FUNCTION increment_customer_points(customer_id UUID, pts INTEGER)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE customers
  SET
    points      = points + pts,
    order_count = order_count + 1
  WHERE id = customer_id;
$$;

-- 4. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_customer_id  ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone      ON customers(phone);

-- 5. Constraint UNIQUE en order_number (la secuencia ya lo garantiza, pero por seguridad)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_order_number_key' AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END
$$;

-- 6. Puntos nunca pueden ser negativos
ALTER TABLE customers
  ADD CONSTRAINT customers_points_nonneg CHECK (points >= 0);

-- 7. Columna auth_id para vincular clientes con Supabase Auth
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
CREATE UNIQUE INDEX IF NOT EXISTS customers_auth_id_idx
  ON customers(auth_id) WHERE auth_id IS NOT NULL;
