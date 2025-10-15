# Data Operations

## Overview

This document describes data operations for the Green Fashion Score platform, including Excel ingestion, database seeding, and data validation.

## Excel Source of Truth

The platform uses `Encuestas.xlsx` as the single source of truth for all survey questions and answers. This file contains:

### Sheets Structure
- **Dimensiones**: Category definitions with point maximums
- **Preguntas completas**: General survey questions (46 questions)
- **Preguntas especificas**: Product-specific questions (15 questions)  
- **Respuestas completas**: Answer catalog (197 answers)

### Data Relationships
- General questions link to answers by `Id_respuesta`
- Product questions link to answers by `Id_pregunta`
- Categories: PEOPLE (44 pts), PLANET (50 pts), MATERIALS (65 pts), CIRCULARITY (225 pts)

## Database Operations

### Schema Reset
```bash
# Reset database to clean state
npm run db:reset
```

This command:
1. Drops all old conflicting tables
2. Creates unified schema with proper constraints
3. Adds indexes for performance
4. Sets up foreign key relationships

### Migration Management
```bash
# Generate new migrations from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

### Data Seeding
```bash
# Seed database from Excel file
npm run db:seed
```

This command:
1. Reads `Encuestas.xlsx`
2. Validates data integrity
3. Maps Excel categories to database enums
4. Handles non-numeric question IDs (A, B, C, D, E)
5. Links answers to questions properly
6. Ensures idempotent operations (safe to run multiple times)

### Data Validation
```bash
# Run data integrity tests
npm run db:validate
```

Validates:
- All Excel questions exist in database
- All Excel answers exist in database
- No orphan answers (answers without valid questions)
- Valid categories and scopes
- Proper numeric values
- Question-answer relationships
- Excel ID mapping consistency

## Data Quality Checks

### Pre-Seed Validation
Before seeding, the script validates:
- All questions have valid categories (people, planet, materials, circularity)
- All answers have matching questions (for product questions)
- No duplicate Excel IDs
- Numeric values are valid

### Post-Seed Validation
After seeding, tests verify:
- Record counts match Excel
- All relationships are intact
- No data corruption
- Proper indexing

## Troubleshooting

### "Column does not exist" errors
1. Run `npm run db:reset` to fix schema conflicts
2. Verify migrations are applied: `npm run db:migrate`
3. Check Supabase dashboard for schema updates

### "Invalid input syntax" errors
1. Check for non-numeric question IDs in Excel
2. Verify data types in Excel file
3. Run validation before seeding

### "Duplicate key" errors
1. Check for duplicate Excel IDs in source file
2. Verify idempotent operations are working
3. Clear database and re-seed if needed

### Data inconsistency
1. Run `npm run db:validate` to identify issues
2. Check Excel file for data quality problems
3. Verify mapping functions in seed script
4. Re-run seed with fresh database

## Excel File Requirements

### Required Sheets
- `Dimensiones`: Must contain category definitions
- `Preguntas completas`: Must contain general questions
- `Preguntas especificas`: Must contain product questions
- `Respuestas completas`: Must contain all answers

### Data Format
- Question IDs: Can be numeric (1, 2, 3) or string (A, B, C)
- Answer codes: Must be numeric
- Categories: Must match expected values (PEOPLE, PLANET, etc.)
- Scopes: Must be "Si" (product) or "No" (general)

### Validation Rules
- No empty required fields
- Consistent data types
- Valid category names
- Proper question-answer relationships

## Performance Considerations

### Batch Operations
- Questions are inserted one by one for better error handling
- Answers are linked to questions during insertion
- Transactions ensure data consistency

### Indexing
- `excel_id` indexed for fast lookups
- `question_id` indexed for answer relationships
- `user_id` indexed for survey queries
- Category and scope indexed for filtering

### Memory Usage
- Excel file is read entirely into memory
- Large files may require streaming approach
- Consider chunking for very large datasets

## Backup and Recovery

### Before Schema Changes
```bash
# Export current data
pg_dump $DATABASE_URL > backup.sql

# Reset and re-seed
npm run db:reset
npm run db:seed
```

### Data Recovery
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Or re-seed from Excel
npm run db:seed
```

## Monitoring

### Key Metrics
- Question count: 61 (46 general + 15 product)
- Answer count: 197
- Category distribution
- Relationship integrity

### Health Checks
- Run `npm run db:validate` regularly
- Monitor for orphan records
- Check data consistency
- Verify Excel file integrity

