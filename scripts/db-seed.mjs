import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run db:seed.");
}

const seedPath = path.join(process.cwd(), "db", "seed.sql");
const sql = postgres(databaseUrl, { prepare: false });

try {
  const seedSql = await readFile(seedPath, "utf8");
  await sql.unsafe(seedSql);
  console.log("Seed data applied.");
} finally {
  await sql.end();
}
