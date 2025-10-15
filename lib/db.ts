import 'server-only';
import { Pool } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to execute queries with the database client
export async function withClient<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

// Close the pool when the process exits
process.on('exit', () => {
  pool.end();
});

process.on('SIGINT', () => {
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});