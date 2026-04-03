import { Pool } from "pg";
import { env } from "./env";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  if (!env.databaseUrl) {
    // Create a pool with an invalid connection string would throw later; keep it explicit.
    // We'll still let health-check fail gracefully.
    pool = new Pool({ connectionString: "" });
    return pool;
  }

  pool = new Pool({
    connectionString: env.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000
  });

  return pool;
}

