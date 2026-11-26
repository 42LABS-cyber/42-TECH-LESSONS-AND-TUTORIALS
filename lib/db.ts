import { PrismaClient } from "@prisma/client";
if (process.env.NODE_ENV !== "production") {
  // The preview runner injects a placeholder DATABASE_URL; prefer the real
  // project-local .env in development when that placeholder is present.
  if (process.env.DATABASE_URL?.includes("127.0.0.1") || process.env.DATABASE_URL?.includes("placeholder")) delete process.env.DATABASE_URL;
  require("@next/env").loadEnvConfig(process.cwd());
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing from the production environment.");
const g = globalThis as typeof globalThis & { prisma?: PrismaClient };
const prisma = g.prisma ?? new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
export default prisma;