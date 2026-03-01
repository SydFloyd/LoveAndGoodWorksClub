import postgres from "postgres";

declare global {
  var __lgwcSql: ReturnType<typeof postgres> | undefined;
}

const missingDatabaseHandler = {
  apply() {
    throw new Error("DATABASE_URL is not configured.");
  },
  get() {
    return () => {
      throw new Error("DATABASE_URL is not configured.");
    };
  },
};

function getClient() {
  if (globalThis.__lgwcSql) {
    return globalThis.__lgwcSql;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  const client = postgres(databaseUrl, {
    prepare: false,
    max: 5,
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__lgwcSql = client;
  }

  return client;
}

const missingClient = new Proxy(
  (() => undefined) as unknown as ReturnType<typeof postgres>,
  missingDatabaseHandler as ProxyHandler<ReturnType<typeof postgres>>,
);

export const sql = (getClient() ?? missingClient) as ReturnType<typeof postgres>;
