# CI/CD Documentation

## Overview

This document describes the CI/CD pipeline for the Green Fashion Score platform, including GitHub Actions workflow, deployment process, and troubleshooting.

## GitHub Actions Workflow

### Workflow File
- **Location**: `.github/workflows/ci.yml`
- **Triggers**: Push to `main` branch, Pull requests to `main`
- **Node Version**: 20
- **Parallel Jobs**: `lint`, `test-unit`, `test-e2e` run in parallel
- **Sequential Jobs**: `build` → `migrations-check`

### Job Details

#### 1. Lint Job
- **Purpose**: Code quality and style checking
- **Runs**: `npm run lint`
- **Dependencies**: None
- **Artifacts**: None

#### 2. Test Unit Job
- **Purpose**: Unit and integration tests
- **Runs**: `npm run test`
- **Dependencies**: None
- **Artifacts**: Coverage report (`coverage/`)
- **Environment Variables**: `DATABASE_URL`

#### 3. Test E2E Job
- **Purpose**: End-to-end testing with Playwright
- **Runs**: `npm run test:e2e`
- **Dependencies**: None
- **Artifacts**: Playwright report (`playwright-report/`)
- **Setup**: Installs Playwright browsers

#### 4. Build Job
- **Purpose**: Production build verification
- **Runs**: `npm run build`
- **Dependencies**: `lint`, `test-unit` (must pass)
- **Artifacts**: Next.js build (`nextjs-build/`)
- **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 5. Migrations Check Job
- **Purpose**: Verify database migrations compile
- **Runs**: `npm run db:generate`
- **Dependencies**: `build` (must pass)
- **Artifacts**: None

## Environment Variables

### Required Secrets (GitHub Repository Settings)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `DATABASE_URL`: PostgreSQL connection string

### Optional Secrets
- `SUPABASE_SERVICE_ROLE_KEY`: For Edge Functions deployment
- `VERCEL_TOKEN`: For Vercel deployment (if using GitHub integration)

## Deployment Process

### 1. Vercel Deployment
- **Trigger**: Push to `main` branch
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**: Configured in Vercel dashboard

### 2. Supabase Edge Functions
- **Manual Deployment**: `supabase functions deploy`
- **Functions**: `scoring`, `dashboard`
- **Environment Variables**: Set via `supabase secrets set`

## Artifacts

### Coverage Report
- **Location**: `coverage/`
- **Format**: HTML, LCOV
- **Upload**: Automatic via GitHub Actions
- **Access**: Download from workflow run

### Playwright Report
- **Location**: `playwright-report/`
- **Format**: HTML
- **Upload**: Automatic (even on failure)
- **Access**: Download from workflow run

### Build Artifacts
- **Location**: `nextjs-build/`
- **Content**: Compiled Next.js application
- **Upload**: Automatic on successful build
- **Access**: Download from workflow run

## Troubleshooting

### Common Issues

#### 1. Build Failures
**Symptoms**: Build job fails with environment variable errors
**Solution**:
- Verify all required secrets are configured in GitHub repository settings
- Check secret names match exactly (case-sensitive)
- Ensure secrets are available to the repository

#### 2. Test Failures
**Symptoms**: Unit tests fail with database connection errors
**Solution**:
- Verify `DATABASE_URL` secret is configured
- Check database is accessible from GitHub Actions
- Ensure test database is properly set up

#### 3. E2E Test Failures
**Symptoms**: Playwright tests fail or timeout
**Solution**:
- Check if tests are flaky (retry with `--retries`)
- Verify test environment setup
- Check for browser installation issues

#### 4. Migration Check Failures
**Symptoms**: `npm run db:generate` fails
**Solution**:
- Check Drizzle configuration
- Verify schema files are valid
- Ensure all dependencies are installed

### Debugging Steps

#### 1. Check Workflow Logs
- Go to GitHub Actions tab
- Click on failed workflow run
- Expand failed job to see error details
- Check step-by-step execution

#### 2. Verify Environment Variables
```bash
# Check if secrets are set (in workflow logs)
echo "Checking environment variables..."
```

#### 3. Test Locally
```bash
# Run same commands locally
npm run lint
npm run test
npm run build
npm run db:generate
```

#### 4. Check Dependencies
```bash
# Verify all dependencies are installed
npm ci
npm list --depth=0
```

## Performance Optimization

### Caching
- **npm cache**: Enabled for faster installs
- **Node modules**: Cached between runs
- **Build cache**: Not currently implemented

### Parallel Execution
- **Lint, Test, E2E**: Run in parallel
- **Build**: Waits for lint and test-unit
- **Migrations**: Waits for build

### Resource Usage
- **Runners**: Ubuntu latest (2 cores, 7GB RAM)
- **Timeout**: Default (6 hours)
- **Concurrency**: Limited by GitHub Actions

## Security Considerations

### Secrets Management
- **Repository Secrets**: Used for CI/CD
- **Environment Variables**: Never logged
- **Service Keys**: Only used in Edge Functions

### Access Control
- **Branch Protection**: Require status checks
- **Required Checks**: All jobs must pass
- **Review Requirements**: Pull request reviews

## Monitoring

### Success Metrics
- **Build Success Rate**: Target 95%+
- **Test Coverage**: Target 80%+
- **Build Time**: Target <5 minutes
- **Deployment Time**: Target <2 minutes

### Failure Patterns
- **Flaky Tests**: Identify and fix
- **Environment Issues**: Document solutions
- **Dependency Problems**: Update regularly

## Best Practices

### 1. Commit Messages
- Use conventional commits format
- Include scope and description
- Reference issues when applicable

### 2. Pull Requests
- Include description of changes
- Reference related issues
- Ensure all checks pass before merge

### 3. Dependencies
- Keep dependencies up to date
- Use exact versions for critical packages
- Regular security audits

### 4. Testing
- Write tests for new features
- Maintain test coverage
- Fix flaky tests promptly

## Maintenance

### Regular Tasks
- **Weekly**: Review failed builds
- **Monthly**: Update dependencies
- **Quarterly**: Review and optimize workflow

### Updates
- **Node.js**: Keep on LTS version
- **Actions**: Update to latest versions
- **Dependencies**: Regular updates

### Documentation
- **Keep this doc updated** with workflow changes
- **Document new environment variables**
- **Update troubleshooting section**

