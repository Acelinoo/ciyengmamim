import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ciyengmamim?schema=public";

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 5000,
  max: 10,
});

pool.on("error", (err) => {
  // Ignore connection closed / idle errors in development fallback
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
