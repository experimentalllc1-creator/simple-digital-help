import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be configured before migration.");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  for (const filename of ["001_milo_deliveries.sql", "002_milo_identity.sql"]) {
    const sql = await readFile(new URL(`../db/migrations/${filename}`, import.meta.url), "utf8");
    await pool.query(sql);
  }
  console.log("Milo delivery ledger migration completed.");
} catch {
  console.error("Migration failed. Check database connectivity and permissions; no credentials logged.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
