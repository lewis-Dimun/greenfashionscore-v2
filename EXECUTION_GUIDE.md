# GFS Data Repair & Scoring Implementation - Execution Guide

## Overview
This guide walks through the complete implementation of the unified schema, data repair, scoring engine, and validation system for the Green Fashion Score project.

## Prerequisites
- Node.js 20+ installed
- Supabase project configured
- Environment variables set in `.env.local`

## Step 1: Apply Unified Schema
```bash
# Apply the new unified schema migration
npm run db:unified
```

This will:
- Drop all existing conflicting tables
- Create the new unified schema with proper relationships
- Seed the 4 dimensions with correct weights (20/20/40/20)
- Verify total weight = 100%

## Step 2: Repair and Import Excel Data
```bash
# Repair and normalize Excel data
npm run db:repair
```

This will:
- Read `Encuestas.xlsx` from project root
- Normalize question and answer data
- Upsert questions (46 general + 15 specific)
- Upsert answers (~197 total)
- Create placeholder answers for questions without answers
- Generate repair report

## Step 3: Validate Data Integrity
```bash
# Run comprehensive data validation
npm run db:validate
```

This will:
- Verify counts: 46 general, 15 specific, ~197 answers
- Check dimension weights sum to 100%
- Ensure no orphaned records
- Detect duplicates
- Generate validation report

## Step 4: Run Tests
```bash
# Test data integrity
npm run test:data

# Test guard functionality
npm run test:guard

# Test scoring engine
npm run test:scoring

# Run all tests
npm run test:all
```

## Step 5: Start Development Server
```bash
# Start the application
npm run dev
```

## API Endpoints Available

### Questions
- `GET /api/questions/general` - General survey questions
- `GET /api/questions/product` - Product-specific questions

### Surveys
- `GET /api/surveys/general` - Get/create general survey
- `POST /api/surveys/general/complete` - Complete general survey
- `GET /api/specific-surveys` - List user's specific surveys
- `POST /api/specific-surveys` - Create specific survey (guarded)

### Scoring
- `GET /api/results?surveyId=X&type=general` - Get survey scores
- `GET /api/dashboard` - Get user dashboard with all scores

## Key Features Implemented

### 1. Unified Schema
- **Tables**: profiles, dimensions, questions, answers, general_surveys, specific_surveys, user_answers
- **Relations**: Proper foreign keys and constraints
- **Indexes**: Optimized for frequent queries

### 2. Data Repair System
- **Normalization**: Handles Excel inconsistencies
- **Deduplication**: Prevents duplicate questions/answers
- **Placeholders**: Ensures all questions have answers
- **Idempotency**: Safe to run multiple times

### 3. Scoring Engine
- **Weighted Calculation**: (weight_percent / max_points) * obtained
- **Category Assignment**: A (≥75), B (50-74), C (25-49), D (1-24), E (0)
- **Range**: 0-100 points
- **Breakdown**: Per-dimension scores

### 4. Guard System
- **Sequential Flow**: General survey must be completed before specific surveys
- **API Protection**: 409 error if general survey not completed
- **Database Constraints**: Foreign key relationships enforce integrity

### 5. Validation System
- **Count Verification**: 46/15/~197 expected counts
- **Weight Validation**: Dimensions sum to 100%
- **Integrity Checks**: No orphans, no duplicates
- **Automated Reports**: JSON + console output

## Expected Results

### Data Counts
- ✅ 4 dimensions (PEOPLE, PLANET, MATERIALS, CIRCULARITY)
- ✅ 46 general questions
- ✅ 15 specific questions
- ✅ ~197 answers
- ✅ All questions have at least one answer

### Scoring Validation
- ✅ Scores range 0-100
- ✅ Categories A-E assigned correctly
- ✅ Weighted calculation matches methodology
- ✅ Dashboard aggregation works

### Guard Functionality
- ✅ Cannot create specific survey without completed general
- ✅ Multiple specific surveys allowed per user
- ✅ User ownership enforced

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   ```bash
   # Check .env.local has:
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

2. **Excel File Not Found**
   ```bash
   # Ensure Encuestas.xlsx is in project root
   ls -la Encuestas.xlsx
   ```

3. **Database Connection Issues**
   ```bash
   # Verify Supabase connection
   npm run db:validate
   ```

4. **Test Failures**
   ```bash
   # Check specific test output
   npm run test:data -- --verbose
   ```

### Recovery Steps

If something goes wrong:

1. **Reset Database**
   ```bash
   npm run db:reset
   npm run db:unified
   ```

2. **Re-import Data**
   ```bash
   npm run db:repair
   npm run db:validate
   ```

3. **Re-run Tests**
   ```bash
   npm run test:all
   ```

## Next Steps

After successful implementation:

1. **Deploy to Production**
   - Apply migrations to production database
   - Deploy Edge Functions
   - Update environment variables

2. **Monitor Performance**
   - Check API response times
   - Monitor database queries
   - Validate scoring accuracy

3. **User Testing**
   - Test complete survey flow
   - Verify dashboard displays
   - Check guard functionality

## Support

If you encounter issues:

1. Check the validation report: `validation-report.json`
2. Review test output for specific failures
3. Verify environment variables are correct
4. Ensure Excel file is accessible

The system is designed to be robust and self-healing, with comprehensive validation and error reporting at each step.
