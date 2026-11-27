import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/security.cjs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const claims = verifyToken(token, process.env.AUTH_SECRET || "");
  if (!claims?.sub) return NextResponse.json({ error: "Sign in to access course documents." }, { status: 401 });

  const pathname = request.nextUrl.searchParams.get("path") || "";
  if (!pathname.startsWith("course-materials/")) return NextResponse.json({ error: "Invalid document path." }, { status: 400 });

  const lesson = await prisma.lesson.findFirst({
    where: { OR: [{ documentUrl: pathname }, { filePath: pathname }], status: "PUBLISHED" },
    include: { course: true },
  });
  if (!lesson) return NextResponse.json({ error: "Document not found or not published." }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: String(claims.sub) }, select: { trialEndsAt: true, subscriptionUntil: true } });
  if (!user) return NextResponse.json({ error: "Student account not found." }, { status: 404 });
  const [enrollment, lessonUnlock, moduleUnlock] = await Promise.all([
    prisma.enrollment.findUnique({ where: { userId_courseId: { userId: String(claims.sub), courseId: lesson.courseId } } }),
    prisma.lessonUnlock.findUnique({ where: { userId_lessonId: { userId: String(claims.sub), lessonId: lesson.id } } }),
    lesson.moduleId ? prisma.moduleUnlock.findUnique({ where: { userId_moduleId: { userId: String(claims.sub), moduleId: lesson.moduleId } } }) : Promise.resolve(null),
  ]);
  const trial = Boolean(user.trialEndsAt && user.trialEndsAt > new Date());
  const subscription = Boolean(user.subscriptionUntil && user.subscriptionUntil > new Date());
  if (!(trial || subscription || enrollment?.active || lessonUnlock || moduleUnlock)) {
    return NextResponse.json({ error: "Unlock this lesson or module, or activate your course subscription to view the document." }, { status: 403 });
  }

  const file = await get(pathname, { access: "private" });
  if (!file || file.statusCode !== 200 || !file.stream) return NextResponse.json({ error: "The course document is temporarily unavailable." }, { status: 404 });
  return new Response(file.stream, {
    headers: {
      "Content-Type": file.blob.contentType || "application/pdf",
      "Content-Disposition": 'inline; filename="' + lesson.title.replace(/["\r\n]/g, "") + '.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
