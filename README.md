# Green Fashion Score Platform

## Quick Start

### Prerequisites
- Node.js 20+
- npm
- Supabase account
- Vercel account (for deployment)

### Setup

1. Clone and install:
```bash
git clone <repo>
cd greenfashionscore-v2
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

3. Setup database:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Run development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm run test
npm run test:e2e
```

## Documentation
- [API Contracts](docs/api/contracts.md)
- [Environment Variables](docs/ops/env.md)
- [Data Operations](docs/ops/datos.md)
- [CI/CD](docs/ops/ci.md)
- [Runbook](docs/ops/runbook.md)
- [Audit Report](docs/auditoria/resumen-final.md)

## Architecture
See [architecture.md](architecture.md) for detailed system design.

## Contributing
1. Run `npm run lint` before committing
2. Ensure all tests pass
3. Add tests for new features
4. Update documentation

