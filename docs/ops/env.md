# Environment Variables

## Overview

This document describes all environment variables used in the Green Fashion Score platform and where to configure them.

## Frontend (Public Variables)

These variables are safe to expose in client-side code and are prefixed with `NEXT_PUBLIC_`:

### NEXT_PUBLIC_SUPABASE_URL
- **Description**: Supabase project URL
- **Example**: `https://jwvqlmxvegirmurjhcdd.supabase.co`
- **Used in**: `lib/supabase.ts`, client-side components
- **Configure in**: GitHub Actions secrets, Vercel env vars, local `.env.local`

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Description**: Supabase anonymous/public key for client-side operations
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Used in**: `lib/supabase.ts`, client-side auth
- **Configure in**: GitHub Actions secrets, Vercel env vars, local `.env.local`

## Backend/Build (Private Variables)

These variables should NEVER be exposed to client-side code:

### DATABASE_URL
- **Description**: Direct PostgreSQL connection string for Drizzle migrations
- **Example**: `postgresql://postgres:password@db.host:5432/postgres`
- **Used in**: `drizzle.config.ts`, migration scripts
- **Configure in**: GitHub Actions secrets, local `.env.local`
- **Security**: Contains database credentials - keep secret!

### SUPABASE_SERVICE_ROLE_KEY
- **Description**: Supabase service role key for admin operations (Edge Functions only)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Used in**: Supabase Edge Functions, CI/CD scripts
- **Configure in**: Supabase secrets, GitHub Actions secrets
- **Security**: Admin-level access - NEVER use in frontend!

## Optional Variables

### NEXTAUTH_URL
- **Description**: Base URL for NextAuth.js (if using)
- **Example**: `http://localhost:3000` (dev), `https://yourdomain.com` (prod)
- **Used in**: NextAuth configuration
- **Configure in**: Vercel env vars, local `.env.local`

### NEXTAUTH_SECRET
- **Description**: Secret key for NextAuth.js JWT signing
- **Example**: `your-secret-key-here`
- **Used in**: NextAuth configuration
- **Configure in**: Vercel env vars, local `.env.local`
- **Security**: Keep secret!

## Where to Configure

### 1. Local Development
Create `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 2. GitHub Actions
Go to Repository Settings → Secrets and variables → Actions:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Vercel Deployment
Go to Project Settings → Environment Variables:
- **Production**: All variables
- **Preview**: All variables
- **Development**: All variables

### 4. Supabase Edge Functions
```bash
# Set secrets for Edge Functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key-here
supabase secrets set DATABASE_URL=your-db-url-here
```

## Security Checklist

- [ ] No secrets committed to git (check with `git log --all --full-history --source -- .env*`)
- [ ] `.env.example` contains placeholder values only
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never used in frontend code
- [ ] `DATABASE_URL` only used in server-side contexts
- [ ] All production secrets configured in Vercel
- [ ] All CI secrets configured in GitHub Actions
- [ ] RLS enabled on all user tables in Supabase

## Troubleshooting

### "Missing environment variable" errors
1. Check if variable is defined in `.env.local`
2. Verify variable name matches exactly (case-sensitive)
3. Restart development server after adding new variables

### "Invalid API key" errors
1. Verify Supabase URL and keys are correct
2. Check if service role key is being used in frontend (should not be)
3. Ensure RLS policies allow the operation

### Build failures in CI
1. Check if all required secrets are configured in GitHub Actions
2. Verify secret names match exactly
3. Check if DATABASE_URL is accessible from CI environment

