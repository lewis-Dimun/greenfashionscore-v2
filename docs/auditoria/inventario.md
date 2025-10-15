# Dependency Inventory

## Production Dependencies (package.json)
- @supabase/ssr: ^0.7.0 (SSR-safe Supabase client)
- @supabase/supabase-js: 2.45.4 (Supabase SDK)
- react: 18.3.1 (UI library)
- recharts: 2.12.7 (Charts - lazy loaded)
- zod: 3.23.8 (Schema validation)
- zustand: 4.5.2 (State management)

## Dev Dependencies (package.json)
- next: ^15.5.5 (Framework)
- typescript: 5.6.3 (Type safety)
- drizzle-orm: 0.33.0 (ORM)
- jest: 29.7.0 (Testing)
- playwright: 1.47.2 (E2E testing)
- @testing-library/react: 16.0.1 (UI testing)

## Risk Assessment
- No deprecated packages
- All ESM-compatible
- Node 20 compatible
- No major version mismatches

## File Structure
```
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Business logic
│   ├── scoring/           # Scoring engine
│   ├── excel/             # Excel ingest
│   └── validation/        # Input validation
├── supabase/functions/    # Edge Functions (Deno)
├── db/                    # Drizzle schema & migrations
├── __tests__/             # Test files
├── e2e/                   # Playwright E2E tests
├── docs/                  # Documentation
│   ├── api/              # API contracts
│   ├── ops/              # Operations guides
│   └── auditoria/        # Audit reports
└── scripts/              # Utility scripts
```

## Build Entrypoints
- next.config.mjs (Next.js config)
- tailwind.config.ts (Tailwind CSS)
- postcss.config.js (PostCSS)
- tsconfig.json (TypeScript)
- drizzle.config.ts (Drizzle ORM)
- jest.config.cjs (Jest testing)

## NPM Scripts Usage
- `npm run dev` - Local development
- `npm run build` - Production build
- `npm run test` - Run all tests
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Apply migrations
- `npm run db:seed` - Seed from Excel

