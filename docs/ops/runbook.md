# Operational Runbook

## Dashboard Not Loading

**Symptoms:** Dashboard shows loading spinner indefinitely or displays error.

**Diagnosis:**
1. Check browser console for errors
2. Verify Supabase Edge Function is deployed: `supabase functions list`
3. Check function logs: `supabase functions logs dashboard`
4. Verify JWT token is valid (check Network tab, Authorization header)

**Resolution:**
- If 401: User needs to re-login
- If 500: Check Edge Function logs, may need redeploy
- If timeout: Check database RLS policies

## Seed Fails to Complete

**Symptoms:** `npm run db:seed` exits with errors.

**Diagnosis:**
1. Check database connection: `psql $DATABASE_URL -c "SELECT 1"`
2. Verify schema is up to date: `npm run db:generate && npm run db:migrate`
3. Check for duplicate excel_id values in Excel file

**Resolution:**
- Reset schema: `npm run db:reset`
- Re-run migrations: `npm run db:migrate`
- Re-run seed: `npm run db:seed`

## Score Doesn't Sum Correctly

**Symptoms:** Dashboard shows incorrect totals.

**Diagnosis:**
1. Check scoring engine tests: `npm run test scoring.engine.spec`
2. Verify numeric_value in survey_responses table
3. Check for multiple surveys of same scope

**Resolution:**
- Review scoring engine logic in `lib/scoring/engine.ts`
- Verify Excel data has correct punto_pregunta and punto_respuesta values
- Check aggregation logic in dashboard endpoint

## Build Failures

**Symptoms:** `npm run build` fails with errors.

**Diagnosis:**
1. Check for TypeScript errors: `npx tsc --noEmit`
2. Verify all imports are correct
3. Check for missing environment variables

**Resolution:**
- Fix TypeScript errors
- Add missing imports
- Configure environment variables
- Clear .next cache: `rm -rf .next`

## Test Failures

**Symptoms:** `npm run test` fails with errors.

**Diagnosis:**
1. Check Jest configuration
2. Verify test files are in correct location
3. Check for missing dependencies

**Resolution:**
- Fix Jest configuration
- Move test files to correct location
- Install missing dependencies
- Clear Jest cache: `npx jest --clearCache`

## Authentication Issues

**Symptoms:** Users can't login or register.

**Diagnosis:**
1. Check Supabase Auth configuration
2. Verify redirect URLs are correct
3. Check for CORS issues

**Resolution:**
- Update Supabase Auth settings
- Fix redirect URLs
- Configure CORS properly
- Check JWT token expiration

## Database Connection Issues

**Symptoms:** Database operations fail.

**Diagnosis:**
1. Check DATABASE_URL is correct
2. Verify database is accessible
3. Check for connection limits

**Resolution:**
- Update DATABASE_URL
- Check database status
- Increase connection limits
- Check for network issues

## Performance Issues

**Symptoms:** Slow page loads or timeouts.

**Diagnosis:**
1. Check bundle size: `npm run analyze`
2. Monitor Core Web Vitals
3. Check for memory leaks

**Resolution:**
- Optimize bundle size
- Implement code splitting
- Fix memory leaks
- Add caching

## Deployment Issues

**Symptoms:** Deployment fails or app doesn't work in production.

**Diagnosis:**
1. Check build logs
2. Verify environment variables
3. Check for missing dependencies

**Resolution:**
- Fix build errors
- Configure environment variables
- Install missing dependencies
- Check deployment configuration

## Common Commands

### Database Operations
```bash
# Reset database
npm run db:reset

# Apply migrations
npm run db:migrate

# Seed from Excel
npm run db:seed

# Validate data
npm run db:validate
```

### Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

### Deployment
```bash
# Deploy Edge Functions
supabase functions deploy scoring
supabase functions deploy dashboard

# Deploy to Vercel
vercel --prod
```

### Debugging
```bash
# Check logs
supabase functions logs scoring
supabase functions logs dashboard

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

## Emergency Procedures

### 1. Database Down
1. Check Supabase status
2. Verify connection string
3. Check for maintenance windows
4. Contact support if needed

### 2. Edge Functions Down
1. Check function deployment status
2. Review function logs
3. Redeploy if necessary
4. Check for code errors

### 3. Frontend Down
1. Check Vercel deployment status
2. Review build logs
3. Check for environment variable issues
4. Redeploy if necessary

### 4. Data Corruption
1. Stop all operations
2. Backup current data
3. Restore from backup
4. Investigate root cause

## Monitoring

### Key Metrics
- **Uptime**: 99.9% target
- **Response Time**: <2s target
- **Error Rate**: <1% target
- **User Satisfaction**: >90% target

### Alerts
- **Database**: Connection failures
- **Functions**: Execution errors
- **Frontend**: Build failures
- **Performance**: Slow responses

### Logs
- **Application**: Console logs
- **Database**: Query logs
- **Functions**: Execution logs
- **Frontend**: Error logs

## Maintenance

### Daily
- Check application status
- Review error logs
- Monitor performance metrics

### Weekly
- Review user feedback
- Check for security updates
- Analyze performance trends

### Monthly
- Update dependencies
- Review and optimize queries
- Check for data growth

### Quarterly
- Security audit
- Performance review
- Capacity planning

