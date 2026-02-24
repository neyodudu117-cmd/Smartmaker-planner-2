CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'Free'
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type TEXT CHECK(type IN ('income', 'expense')),
  amount REAL,
  category TEXT,
  date TEXT,
  description TEXT,
  is_tax_deductible BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS affiliate_programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  commissions REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS digital_products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT,
  sales INTEGER DEFAULT 0,
  gross_revenue REAL DEFAULT 0,
  platform_fee REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type TEXT CHECK(type IN ('income', 'profit')),
  target_amount REAL,
  current_amount REAL DEFAULT 0,
  month TEXT
);

-- Insert mock user
INSERT INTO users (id, name, email, subscription_tier) 
VALUES (1, 'Demo User', 'demo@example.com', 'Pro')
ON CONFLICT (email) DO NOTHING;

-- Insert mock data
INSERT INTO transactions (user_id, type, amount, category, date, description, is_tax_deductible) VALUES 
(1, 'income', 1200, 'Affiliate', '2023-10-01', 'Amazon Associates', false),
(1, 'income', 800, 'Digital Product', '2023-10-05', 'Ebook Sales', false),
(1, 'expense', 50, 'Software', '2023-10-02', 'Hosting', true),
(1, 'expense', 100, 'Marketing', '2023-10-10', 'Ads', true),
(1, 'expense', 150, 'Software', '2023-10-15', 'Adobe Creative Cloud', true);

INSERT INTO affiliate_programs (user_id, name, clicks, conversions, commissions) VALUES 
(1, 'Amazon Associates', 1500, 45, 1200),
(1, 'ShareASale', 800, 20, 450);

INSERT INTO digital_products (user_id, name, sales, gross_revenue, platform_fee) VALUES 
(1, 'Creator Playbook Ebook', 120, 2400, 240),
(1, 'Notion Template', 85, 1275, 127.5);

INSERT INTO goals (user_id, type, target_amount, current_amount, month) VALUES 
(1, 'income', 5000, 2000, '2023-10'),
(1, 'profit', 4000, 1850, '2023-10');
