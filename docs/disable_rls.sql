-- SQL Script to Disable Row Level Security (RLS) for all tables
-- Run this in your Supabase SQL Editor to fix "permission denied" errors during development.

-- 1. Users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. MLM Tree
ALTER TABLE mlm_tree DISABLE ROW LEVEL SECURITY;

-- 3. Packages
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;

-- 4. User Packages
ALTER TABLE user_packages DISABLE ROW LEVEL SECURITY;

-- 5. Wallets
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;

-- 6. Wallet Transactions
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;

-- 7. MLM Commissions
ALTER TABLE mlm_commissions DISABLE ROW LEVEL SECURITY;

-- 8. Commission History
ALTER TABLE commission_history DISABLE ROW LEVEL SECURITY;

-- 9. User Team Volume
ALTER TABLE user_team_volume DISABLE ROW LEVEL SECURITY;

-- 10. User Ranks
ALTER TABLE user_ranks DISABLE ROW LEVEL SECURITY;

-- Optional: Verify RLS status
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';