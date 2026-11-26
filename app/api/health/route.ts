import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    // A real round-trip. Checking that DATABASE_URL merely EXISTS would pass
    // against a deleted database, the wrong region, or an expired credential.
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    // 503, not 500: this is a dependency failure, and it is what the deploy
    // verifier keys on to refuse promotion.
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        // Message only — never the connection string.
        message: error instanceof Error ? error.message : "unknown error",
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}