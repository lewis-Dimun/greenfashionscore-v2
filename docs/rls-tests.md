RLS verification (Supabase)

Prereqs
- Supabase project created
- Auth enabled (email/password)
- Policies applied from `db/rls_policies.sql`
- Migrations applied from `db/migrations/0001_init.sql`

Test data
1) Create two users (u1, u2) and one admin (role claim `admin`).
2) Insert one `brand` and one `survey` (type `general`, version `v1`).
3) Insert two `survey_submissions` (one per user) and corresponding `scores`.

JWTs
- Generate JWTs for u1, u2, and admin.

Checks (PostgREST examples)
- As u1 token:
  - GET `scores` → returns only scores linked to u1 submissions
  - GET `responses` → only those belonging to u1 submissions
- As u2 token: same, only u2
- As admin token:
  - GET `scores` → returns all rows

SQL snippets
-- Enable RLS (already in file)
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Seed admin role: add custom claim `role: admin` to the admin user JWT

Expected
- Non-admin users cannot read or write others' rows
- Admin can read/write all


