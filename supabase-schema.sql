-- ============================================================
-- SCHEMA: Aca Las Tortas El Paso
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- Secuencia para números de orden que empieza en 1001
CREATE SEQUENCE IF NOT EXISTS order_number_seq MINVALUE 1001 START WITH 1001;

-- ── MENÚ ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       DECIMAL(10,2) NOT NULL,
  category    TEXT NOT NULL,
  available   BOOLEAN DEFAULT true,
  image       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE NOT NULL,
  points      INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ÓRDENES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  INTEGER NOT NULL DEFAULT nextval('order_number_seq'),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_id   UUID REFERENCES customers(id),
  items         JSONB NOT NULL,
  notes         TEXT DEFAULT '',
  status        TEXT DEFAULT 'nuevo'
                  CHECK (status IN ('nuevo','preparando','listo','entregado','cancelado')),
  total         DECIMAL(10,2) NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── REALTIME ──────────────────────────────────────────────
-- Activa actualizaciones en tiempo real para el dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ── SEGURIDAD (RLS) ───────────────────────────────────────
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;

-- Acceso público (demo — en producción ajustar con auth)
CREATE POLICY "public_all_menu"      ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_customers" ON customers  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_orders"    ON orders     FOR ALL USING (true) WITH CHECK (true);

-- ── MENÚ INICIAL (38 platillos) ───────────────────────────
INSERT INTO menu_items (id, name, description, price, category, available) VALUES
-- TORTAS
('t1',  'Torta de Milanesa',    'Milanesa empanizada, lechuga, tomate, aguacate, crema y frijoles en telera',          11.99, 'Tortas', true),
('t2',  'Torta de Pollo',       'Pollo a la plancha, lechuga, tomate, aguacate, crema y frijoles en telera',           11.99, 'Tortas', true),
('t3',  'Torta de Carne Asada', 'Carne asada jugosa, lechuga, tomate, aguacate, crema y frijoles en telera',           12.99, 'Tortas', true),
('t4',  'Torta de Carnitas',    'Carnitas de cerdo, lechuga, tomate, aguacate, crema y frijoles en telera',            11.99, 'Tortas', true),
('t5',  'Torta de Chorizo',     'Chorizo mexicano, lechuga, tomate, aguacate, crema y frijoles en telera',             10.99, 'Tortas', true),
('t6',  'Torta de Pierna',      'Pierna de cerdo deshebrada, lechuga, tomate, aguacate, crema y frijoles',             10.99, 'Tortas', true),
('t7',  'Torta Cubana',         'Chorizo, jamón, milanesa, huevo, queso, crema y frijoles — ¡La completa!',            13.99, 'Tortas', true),
('t8',  'Torta de Jamón',       'Jamón, queso amarillo, lechuga, tomate y crema en telera',                             9.99, 'Tortas', true),
('t9',  'Torta de Huevo',       'Huevo revuelto o estrellado, frijoles, crema y queso en telera',                       9.99, 'Tortas', true),
('t10', 'Torta de Chicharrón',  'Chicharrón en salsa verde o roja, crema y frijoles en telera',                        10.99, 'Tortas', true),
-- BURRITOS
('b1',  'Burrito de Asada',           'Carne asada, arroz, frijoles, queso, crema y guacamole en tortilla de harina',  12.99, 'Burritos', true),
('b2',  'Burrito de Pollo',           'Pollo a la plancha, arroz, frijoles, queso, crema y guacamole',                 12.99, 'Burritos', true),
('b3',  'Burrito de Carnitas',        'Carnitas, arroz, frijoles, queso, crema y guacamole',                           12.99, 'Burritos', true),
('b4',  'Burrito de Chorizo',         'Chorizo mexicano, arroz, frijoles, queso y crema',                              11.99, 'Burritos', true),
('b5',  'Burrito de Frijoles y Queso','Frijoles refritos y queso fundido en tortilla de harina',                        9.99, 'Burritos', true),
-- QUESADILLAS
('q1',  'Quesadilla de Asada', 'Carne asada con queso Oaxaca derretido en tortilla de harina',   11.99, 'Quesadillas', true),
('q2',  'Quesadilla de Pollo', 'Pollo a la plancha con queso Oaxaca derretido',                  11.99, 'Quesadillas', true),
('q3',  'Quesadilla de Queso', 'Queso Oaxaca fundido en tortilla de harina, crema y guacamole',   8.99, 'Quesadillas', true),
-- TACOS
('ta1', 'Tacos de Asada (3)',    '3 tacos de carne asada en tortilla de maíz con cilantro y cebolla',   12.99, 'Tacos', true),
('ta2', 'Tacos de Pollo (3)',    '3 tacos de pollo a la plancha en tortilla de maíz con cilantro',      11.99, 'Tacos', true),
('ta3', 'Tacos de Carnitas (3)', '3 tacos de carnitas en tortilla de maíz con cilantro y cebolla',      11.99, 'Tacos', true),
('ta4', 'Tacos de Chorizo (3)',  '3 tacos de chorizo en tortilla de maíz con cilantro y cebolla',       10.99, 'Tacos', true),
('ta5', 'Tacos de Papa (3)',     '3 tacos de papa con queso en tortilla de maíz',                        9.99, 'Tacos', true),
-- ENCHILADAS
('e1',  'Enchiladas de Asada (3)', '3 enchiladas de carne asada con salsa roja, crema y queso. Con arroz y frijoles', 12.99, 'Enchiladas', true),
('e2',  'Enchiladas de Pollo (3)', '3 enchiladas de pollo con salsa roja o verde, crema y queso. Con arroz y frijoles',11.99,'Enchiladas', true),
('e3',  'Enchiladas de Queso (3)', '3 enchiladas de queso con salsa roja, crema y queso. Con arroz y frijoles',        9.99, 'Enchiladas', true),
-- GORDITAS
('g1',  'Gordita de Asada',      'Masa de maíz rellena de carne asada, queso, crema y salsa', 10.99, 'Gorditas', true),
('g2',  'Gordita de Chicharrón', 'Masa de maíz rellena de chicharrón en salsa y queso',        9.99, 'Gorditas', true),
('g3',  'Gordita de Frijoles',   'Masa de maíz rellena de frijoles refritos y queso',          8.99, 'Gorditas', true),
-- BEBIDAS
('dr1', 'Horchata (32 oz)',    'Agua fresca de arroz con canela hecha en casa',      3.99, 'Bebidas', true),
('dr2', 'Jamaica (32 oz)',     'Agua fresca de flor de jamaica hecha en casa',       3.99, 'Bebidas', true),
('dr3', 'Tamarindo (32 oz)',   'Agua fresca de tamarindo hecha en casa',             3.99, 'Bebidas', true),
('dr4', 'Limonada (32 oz)',    'Limonada natural preparada al momento',              3.99, 'Bebidas', true),
('dr5', 'Refresco (lata)',     'Coke, Sprite, Fanta o Dr Pepper',                   2.50, 'Bebidas', true),
('dr6', 'Agua Embotellada',    'Agua purificada 500ml',                             1.50, 'Bebidas', true),
-- EXTRAS
('ex1', 'Papas Fritas',    'Papas a la francesa crujientes con sal',               3.99, 'Extras', true),
('ex2', 'Arroz con Frijoles','Arroz mexicano y frijoles de olla',                  3.99, 'Extras', true),
('ex3', 'Guacamole',       'Guacamole fresco hecho al momento con totopos',        2.99, 'Extras', true),
('ex4', 'Salsa Extra',     'Salsa verde o roja de la casa',                        0.99, 'Extras', true)
ON CONFLICT (id) DO NOTHING;
