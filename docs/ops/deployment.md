# Deployment Guide

## Overview

This guide covers deploying the Green Fashion Score platform to Vercel with proper security configurations and environment variable management.

## Pre-Deployment Checklist

### 1. Security Verification ✅

- [ ] **Service Role Key Security**: Verify that `SUPABASE_SERVICE_ROLE_KEY` is NOT used in client-side code
- [ ] **Environment Variables**: All secrets are properly configured in Vercel
- [ ] **Documentation**: No hardcoded secrets in documentation files
- [ ] **Git History**: No secrets committed to version control

### 2. Environment Variables Setup

#### Required Variables in Vercel

Configure these in your Vercel project settings:

```bash
# Public Variables (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Private Variables (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Environment-Specific Configuration

- **Production**: All variables required
- **Preview**: All variables required  
- **Development**: All variables required

### 3. Database Setup

#### Supabase Configuration

1. **RLS Policies**: Ensure Row Level Security is enabled on all user tables
2. **Service Role**: Verify service role key has appropriate permissions
3. **Database Migrations**: Run any pending migrations

#### Database Migration Commands

```bash
# Generate migrations
npm run db:generate

# Apply migrations (if using direct database access)
npm run db:migrate
```

## Deployment Process

### 1. Vercel Deployment

#### Automatic Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`
3. **Set Environment Variables**: Add all required variables in Vercel dashboard
4. **Deploy**: Push to `main` branch triggers automatic deployment

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### 2. Environment Variable Configuration

#### In Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add each variable for all environments (Production, Preview, Development)
3. Use the exact variable names from `.env.example`

#### Variable Descriptions

| Variable | Description | Required | Environment |
|----------|-------------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | ✅ | All |
| `DATABASE_URL` | PostgreSQL connection string | ✅ | All |

### 3. Build Configuration

The `vercel.json` file includes:

- **Build Settings**: Optimized for Next.js
- **Function Timeouts**: 30 seconds for API routes
- **CORS Headers**: Configured for API endpoints
- **Environment Variables**: Required variables defined

## Post-Deployment Verification

### 1. Health Checks

#### API Endpoints

Test these endpoints after deployment:

```bash
# Health check (if implemented)
curl https://your-domain.vercel.app/api/health

# Authentication test
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-domain.vercel.app/api/dashboard
```

#### Database Connectivity

1. **Login Test**: Verify user authentication works
2. **Data Retrieval**: Test dashboard data loading
3. **Survey Creation**: Test survey creation flow

### 2. Security Verification

#### Bundle Analysis

```bash
# Check for service key exposure in bundle
npm run analyze

# Look for any environment variable leaks
grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/
```

#### Network Security

1. **HTTPS**: Verify all requests use HTTPS
2. **CORS**: Check CORS headers are properly set
3. **Headers**: Verify security headers are present

### 3. Performance Monitoring

#### Core Web Vitals

- **LCP**: Largest Contentful Paint < 2.5s
- **FID**: First Input Delay < 100ms
- **CLS**: Cumulative Layout Shift < 0.1

#### API Performance

- **Response Times**: API endpoints < 500ms
- **Database Queries**: Optimized queries
- **Error Rates**: < 1% error rate

## Rollback Procedures

### 1. Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### 2. Database Rollback

If database changes are needed:

```bash
# Check migration status
npm run db:status

# Rollback specific migration
npm run db:rollback [migration-name]
```

### 3. Environment Variable Rollback

1. **Revert Variables**: Change back to previous values in Vercel
2. **Redeploy**: Trigger new deployment with old variables
3. **Verify**: Test functionality with previous configuration

## Monitoring and Alerts

### 1. Vercel Analytics

- **Performance**: Monitor Core Web Vitals
- **Errors**: Track JavaScript errors
- **Usage**: Monitor bandwidth and function invocations

### 2. Supabase Monitoring

- **Database**: Monitor query performance
- **Auth**: Track authentication events
- **Storage**: Monitor file uploads (if applicable)

### 3. Custom Monitoring

#### Health Check Endpoint

Consider implementing a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('dimensions').select('count').limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      error: error.message 
    }, { status: 500 });
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptoms**: Deployment fails during build step

**Solutions**:
- Check environment variables are set correctly
- Verify all dependencies are installed
- Check for TypeScript errors
- Ensure all required files are committed

#### 2. Runtime Errors

**Symptoms**: Application crashes after deployment

**Solutions**:
- Check Vercel function logs
- Verify environment variables are accessible
- Test database connectivity
- Check for missing dependencies

#### 3. Authentication Issues

**Symptoms**: Users cannot log in or access protected routes

**Solutions**:
- Verify Supabase URL and keys are correct
- Check RLS policies are properly configured
- Test authentication flow locally
- Verify CORS settings

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View function logs
vercel logs [deployment-url]

# Test local build
npm run build
npm run start
```

## Security Best Practices

### 1. Environment Variables

- **Never commit secrets**: Use `.env.example` for templates
- **Rotate keys regularly**: Update service role keys periodically
- **Use different keys**: Separate development and production keys

### 2. Database Security

- **RLS Policies**: Enable Row Level Security on all tables
- **Service Role**: Only use service role key for admin operations
- **Connection Security**: Use SSL connections for database

### 3. API Security

- **Authentication**: Verify JWT tokens on all protected routes
- **Authorization**: Check user permissions for each operation
- **Input Validation**: Validate all input data
- **Rate Limiting**: Implement rate limiting for API endpoints

## Maintenance

### Regular Tasks

- **Weekly**: Review deployment logs and error rates
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and rotate API keys
- **Annually**: Security audit and penetration testing

### Updates

- **Dependencies**: Keep all packages up to date
- **Node.js**: Use LTS versions
- **Vercel**: Update to latest platform features
- **Supabase**: Keep client libraries updated

## Support

### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Getting Help

1. **Check Logs**: Review Vercel function logs
2. **Test Locally**: Reproduce issues in development
3. **Check Status**: Verify external service status
4. **Contact Support**: Use appropriate support channels

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Maintainer**: DevOps Team
