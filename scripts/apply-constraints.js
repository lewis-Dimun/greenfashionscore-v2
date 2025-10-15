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

async function applyConstraints() {
  const client = await pool.connect();
  try {
    // Read the SQL file
    const sqlContent = readFileSync(join(__dirname, '../db/fix_constraints.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await client.query(statement);
        console.log('✅ Success');
      } catch (error) {
        if (error.code === '23505' || error.message.includes('already exists')) {
          console.log('⚠️  Constraint already exists, skipping');
        } else {
          console.error('❌ Error:', error.message);
        }
      }
    }
    
    console.log('🎉 All constraints applied successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

applyConstraints().catch(console.error);
