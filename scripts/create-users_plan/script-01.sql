CREATE TABLE users_plan(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) ON DELETE CASCADE,
  plan_id uuid references plans(id),
  slug_plan_at_moment TEXT,
  price_at_purchase numeric(10,2),
  subscription_id TEXT,
  last_transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  status TEXT
)