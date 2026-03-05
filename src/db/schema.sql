-- Enable pgcrypto for gen_random_uuid() if on older Postgres, though PG13+ has it native.
create extension if not exists "pgcrypto";

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  referral_code text not null unique,
  sponsor_id uuid null references users(id) on delete set null,
  role text not null default 'user' check (role in ('user','admin','superadmin')),
  created_at timestamptz not null default now()
);

-- MLM TREE
create table if not exists mlm_tree (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  upline_id uuid not null references users(id) on delete cascade,
  level int not null check (level between 1 and 24),
  created_at timestamptz not null default now(),
  unique(user_id, upline_id),
  unique(user_id, level)
);

-- PACKAGES
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_sui numeric(36,18) not null check (price_sui > 0),
  roi_percent numeric(10,6) not null check (roi_percent >= 0),
  duration_days int not null check (duration_days > 0),
  status text not null default 'active' check (status in ('active','inactive'))
);

-- USER PACKAGES
create table if not exists user_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  package_id uuid not null references packages(id),
  amount numeric(36,18) not null check (amount > 0),
  activated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  unique(user_id, id)
);

-- WALLETS
create table if not exists wallets (
  user_id uuid primary key references users(id) on delete cascade,
  deposit_wallet numeric(36,18) not null default 0 check (deposit_wallet >= 0),
  earnings_wallet numeric(36,18) not null default 0 check (earnings_wallet >= 0),
  commission_wallet numeric(36,18) not null default 0 check (commission_wallet >= 0),
  updated_at timestamptz not null default now()
);

-- WALLET TRANSACTIONS
create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  wallet_type text not null check (wallet_type in ('deposit','earnings','commission')),
  direction text not null check (direction in ('credit','debit')),
  amount numeric(36,18) not null check (amount > 0),
  balance_after numeric(36,18) not null,
  memo text,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists wallet_tx_user_idx on wallet_transactions(user_id, created_at desc);

-- MLM COMMISSIONS
create table if not exists mlm_commissions (
  type text not null check (type in ('PACKAGE','ROI','TRADE')),
  level int not null check (level between 1 and 24),
  percentage numeric(10,6) not null check (percentage >= 0),
  primary key (type, level)
);

-- COMMISSION HISTORY
create table if not exists commission_history (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references users(id) on delete cascade,
  to_user uuid not null references users(id) on delete cascade,
  level int not null check (level between 1 and 24),
  amount numeric(36,18) not null check (amount >= 0),
  type text not null check (type in ('PACKAGE_COMMISSION','ROI_COMMISSION','TRADE_COMMISSION')),
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists commission_hist_to_idx on commission_history(to_user, created_at desc);
create unique index if not exists commission_dedupe_idx
  on commission_history(reference_type, reference_id, to_user, level)
  where reference_type is not null and reference_id is not null;

-- USER TEAM VOLUME
create table if not exists user_team_volume (
  user_id uuid primary key references users(id) on delete cascade,
  volume numeric(36,18) not null default 0
);

-- USER RANKS
create table if not exists user_ranks (
  user_id uuid primary key references users(id) on delete cascade,
  rank int not null default 0,
  evaluated_at timestamptz not null default now()
);

-- SEED DATA: Package Commissions
insert into mlm_commissions(type, level, percentage) values
  ('PACKAGE', 1, 0.10), ('PACKAGE', 2, 0.05), ('PACKAGE', 3, 0.04), ('PACKAGE', 4, 0.03), ('PACKAGE', 5, 0.03),
  ('PACKAGE', 6, 0.02), ('PACKAGE', 7, 0.02), ('PACKAGE', 8, 0.01), ('PACKAGE', 9, 0.01), ('PACKAGE', 10, 0.01),
  ('PACKAGE', 11, 0.005), ('PACKAGE', 12, 0.005), ('PACKAGE', 13, 0.005), ('PACKAGE', 14, 0.005), ('PACKAGE', 15, 0.005),
  ('PACKAGE', 16, 0.005), ('PACKAGE', 17, 0.005), ('PACKAGE', 18, 0.005), ('PACKAGE', 19, 0.005), ('PACKAGE', 20, 0.005),
  ('PACKAGE', 21, 0.005), ('PACKAGE', 22, 0.005), ('PACKAGE', 23, 0.005), ('PACKAGE', 24, 0.005)
on conflict (type, level) do nothing;

-- SEED DATA: ROI Commissions
insert into mlm_commissions(type, level, percentage) values
  ('ROI', 1, 0.05), ('ROI', 2, 0.03), ('ROI', 3, 0.02), ('ROI', 4, 0.01),
  ('ROI', 5, 0.005), ('ROI', 6, 0.005), ('ROI', 7, 0.005), ('ROI', 8, 0.005), ('ROI', 9, 0.005), ('ROI', 10, 0.005),
  ('ROI', 11, 0.0025), ('ROI', 12, 0.0025), ('ROI', 13, 0.0025), ('ROI', 14, 0.0025), ('ROI', 15, 0.0025),
  ('ROI', 16, 0.0025), ('ROI', 17, 0.0025), ('ROI', 18, 0.0025), ('ROI', 19, 0.0025), ('ROI', 20, 0.0025),
  ('ROI', 21, 0.0025), ('ROI', 22, 0.0025), ('ROI', 23, 0.0025), ('ROI', 24, 0.0025)
on conflict (type, level) do nothing;
