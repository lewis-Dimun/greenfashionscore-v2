import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "";

export const pool = new Pool({ connectionString });

export async function withClient<T>(fn: (client: import("pg").PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}


