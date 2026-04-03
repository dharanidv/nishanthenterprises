import { getPool } from "../config/db";
import { withTimeout } from "../utils/withTimeout";

export async function checkDatabaseHealth(): Promise<boolean> {
  const pool = getPool();

  // Lightweight query: validates connectivity without requiring schema/table existence.
  await withTimeout(pool.query("SELECT 1 AS ok"), 3000);
  return true;
}

