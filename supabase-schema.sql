-- ============================================================
-- Paste this into Supabase SQL Editor (https://supabase.com/dashboard/project/dbuggsvlkytaxkbwwdzq/sql/new)
-- ============================================================

-- Drop old orders table (keeps the test data from earlier)
DROP TABLE IF EXISTS orders CASCADE;

-- Products catalog
CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       DECIMAL NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders with FK to products
CREATE TABLE orders (
  id            BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT NOT NULL,
  product_id    BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  total_price   DECIMAL NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Pending',
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Demo products (15 items)
INSERT INTO products (name, category, price, stock, description) VALUES
('RAM DDR5 16GB (2x8GB)',      'Memory',       55,  25, '5600MHz CL36 — perfect for gaming builds'),
('RAM DDR5 32GB (2x16GB)',     'Memory',      105,  15, '6000MHz CL30 — ideal for content creation'),
('RAM DDR4 16GB (2x8GB)',      'Memory',       35,  30, '3200MHz CL16 — budget-friendly upgrade'),
('SSD NVMe M.2 1TB',           'Storage',      65,  25, '7000 MB/s read — Gen4 speeds'),
('SSD NVMe M.2 2TB',           'Storage',     120,  12, '7000 MB/s read — room for everything'),
('SSD SATA 2.5" 1TB',          'Storage',      50,  18, '560 MB/s — reliable secondary drive'),
('GPU RTX 4060 8GB',           'Graphics',    299,   8, 'DLSS 3, ray tracing — 1080p gaming'),
('GPU RTX 4070 12GB',          'Graphics',    549,   5, '1440p high-refresh gaming'),
('GPU RTX 4080 16GB',          'Graphics',    999,   2, '4K gaming and rendering powerhouse'),
('CPU Intel i5-14600K',        'Processor',   280,  10, '14 cores / 20 threads — LGA1700'),
('CPU Intel i7-14700K',        'Processor',   389,   7, '20 cores / 28 threads — multitasking beast'),
('CPU AMD Ryzen 7 7800X3D',    'Processor',   369,   6, '8 cores / 16 threads — 3D V-Cache gaming king'),
('PSU 750W 80+ Gold',          'Power',       105,  15, 'Fully modular — quiet 120mm fan'),
('Motherboard Z790 ATX',       'Motherboard', 220,   9, 'PCIe 5.0, WiFi 6E, 4x M.2 slots'),
('Case Mid-Tower ATX',         'Case',         75,  20, 'Tempered glass, 4x fans included');

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read for products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Public insert for orders
CREATE POLICY "Anyone can place orders" ON orders FOR INSERT WITH CHECK (true);

-- Public read for own orders
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);
