import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/security.cjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const claims = verifyToken(token, process.env.AUTH_SECRET || "");
  if (!claims?.sub || claims.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator sign-in required." }, { status: 401 });
  }
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        access: "private",
        allowedContentTypes: ["application/pdf"],
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ adminId: String(claims.sub), pathname }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.info("42 TECH private course document uploaded", {
          pathname: blob.pathname,
          contentType: blob.contentType,
        });
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload could not be authorised." }, { status: 400 });
  }
}
