import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run db:init.");
}

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
const sql = postgres(databaseUrl, { prepare: false });

try {
  const schemaSql = await readFile(schemaPath, "utf8");
  await sql.unsafe(schemaSql);
  console.log("Database schema applied.");
} finally {
  await sql.end();
}
