import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySchemaReset() {
  const client = await pool.connect();
  try {
    console.log('🔄 Applying schema reset migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '../db/migrations/0002_schema_reset.sql');
    const sqlContent = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        if (statement.includes('DROP TABLE')) {
          console.log(`🗑️  Dropping old tables...`);
        } else if (statement.includes('CREATE TABLE')) {
          console.log(`📋 Creating table: ${statement.match(/CREATE TABLE.*?"(\w+)"/)?.[1] || 'unknown'}`);
        } else if (statement.includes('ALTER TABLE')) {
          console.log(`🔗 Adding constraint: ${statement.match(/ADD CONSTRAINT (\w+)/)?.[1] || 'unknown'}`);
        } else if (statement.includes('CREATE INDEX')) {
          console.log(`📊 Creating index: ${statement.match(/CREATE INDEX.*?(\w+)/)?.[1] || 'unknown'}`);
        }
        
        await client.query(statement);
        console.log('✅ Success');
      } catch (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('⚠️  Table/constraint already dropped, skipping');
        } else if (error.code === '23505' || error.message.includes('already exists')) {
          console.log('⚠️  Constraint/index already exists, skipping');
        } else {
          console.error('❌ Error:', error.message);
          throw error;
        }
      }
    }
    
    console.log('🎉 Schema reset completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run db:migrate');
    console.log('   2. Run: npm run db:seed');
    console.log('   3. Refresh Supabase dashboard to reload schema cache');
    
  } finally {
    client.release();
    await pool.end();
  }
}

applySchemaReset().catch(console.error);

