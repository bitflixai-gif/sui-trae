# Data Import Guide (Supabase)

This guide shows exactly where to put your data files and how to import them safely into Supabase for this project.

## Folder Layout (local)
- data/import/YYYY-MM-DD/
  - users.csv
  - mlm_tree.csv
  - wallets.csv
  - wallet_transactions.csv
  - user_packages.csv
  - commission_history.csv

Keep these files locally. Do NOT commit real data to GitHub.

## Table CSV Headers
Match these exact headers and types.

### users.csv
id,username,email,password_hash,referral_code,sponsor_id,role,created_at

### mlm_tree.csv
id,user_id,upline_id,level,created_at

### wallets.csv
user_id,deposit_wallet,earnings_wallet,commission_wallet,updated_at

### wallet_transactions.csv
id,user_id,wallet_type,direction,amount,balance_after,memo,reference_type,reference_id,created_at

### user_packages.csv
id,user_id,package_id,amount,activated_at,expires_at,status

### commission_history.csv
id,from_user,to_user,level,amount,type,reference_type,reference_id,created_at

Notes:
- UUID columns must contain valid UUIDs and reference existing users/packages.
- Numeric columns use decimals (e.g., 123.45).
- Timestamps should be ISO8601 (e.g., 2026-03-06T12:00:00Z).
- For nullable columns, leave the field empty in CSV.

## Import Order (to satisfy FK constraints)
1. users.csv
2. mlm_tree.csv
3. wallets.csv
4. user_packages.csv
5. wallet_transactions.csv
6. commission_history.csv

Packages are seeded by the schema automatically. If you need custom packages, import them before user_packages.

## How to Import in Supabase
1. Open Supabase Project → Table Editor.
2. Click a table (e.g., users) → Import Data → Select CSV → Map headers → Import.
3. Repeat in the order above.

Tip: For large imports, use the SQL Editor with `COPY` if you have a direct psql connection. Otherwise, the Table Editor import works fine for moderate sizes.

## Schema Reference
The canonical schema lives at:
- src/db/schema.sql

Apply or verify this schema in your database before importing data.

## RLS Guidance
- Enable RLS on app tables.
- Typical per-user policy pattern:
  - Select/Update/Delete: `user_id = auth.uid()`
  - Insert: `with check (user_id = auth.uid())`
- For admin tasks, run server-side with the service_role key (never in the browser).

## Quick QA Queries (after import)
- Orphan checks:
  - `select * from mlm_tree mt left join users u on u.id = mt.user_id where u.id is null;`
  - `select * from wallets w left join users u on u.id = w.user_id where u.id is null;`
- Duplicate checks:
  - `select username, count(*) from users group by 1 having count(*) > 1;`
  - `select email, count(*) from users group by 1 having count(*) > 1;`

If you need help preparing CSVs from your current system, place files under `data/import/YYYY-MM-DD/` and share the headers; we will adjust mappings and run a staging import before Production.

