-- TRADING POSITIONS
create table if not exists trading_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  symbol text not null, -- e.g., 'BTC/USD'
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric(36,18) not null,
  leverage int not null check (leverage between 1 and 1000),
  margin numeric(36,18) not null check (margin > 0),
  size numeric(36,18) not null, -- margin * leverage
  liquidation_price numeric(36,18) not null,
  status text not null default 'open' check (status in ('open', 'closed', 'liquidated')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

-- TRADING HISTORY (For PnL records)
create table if not exists trading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  position_id uuid references trading_positions(id),
  symbol text not null,
  direction text not null,
  entry_price numeric(36,18) not null,
  exit_price numeric(36,18) not null,
  leverage int not null,
  margin numeric(36,18) not null,
  pnl numeric(36,18) not null,
  pnl_percent numeric(10,2) not null,
  closed_at timestamptz not null default now()
);

-- Disable RLS for these new tables immediately to avoid access issues
ALTER TABLE trading_positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE trading_history DISABLE ROW LEVEL SECURITY;
