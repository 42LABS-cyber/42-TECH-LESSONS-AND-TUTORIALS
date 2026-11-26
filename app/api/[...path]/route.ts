import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { signToken, verifyToken, hashCode, makeCode } from "@/lib/security.cjs";

const allowedOrigins = new Set([
  "https://42-tech-lessons-and-tutorials.vercel.app",
  "https://42-tech-lessons-and-tutorials-49v25qfqx.vercel.app",
  "https://42-tech-admin-control-centre-mwa3qxhhu.vercel.app",
  "https://42-tech-admin-control-centre.vercel.app",
]);
function json(req: NextRequest, data: unknown, status = 200) {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = { "Cache-Control": "no-store", "Vary": "Origin" };
  if (allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET,POST,PATCH,DELETE,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return NextResponse.json(data, { status, headers });
}
function fail(req: NextRequest, message: string, status = 400) { return json(req, { error: message }, status); }
function getClaims(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return verifyToken(token, process.env.AUTH_SECRET || "");
}
function requireClaims(req: NextRequest, admin = false) {
  const claims = getClaims(req);
  if (!claims?.sub) return null;
  if (admin && claims.role !== "ADMIN") return null;
  return claims;
}
async function storagePutUrl(path: string, contentType: string, visibility: "private" | "public" = "private") {
  const endpoint = process.env.PRODUCTOS_STORAGE_ENDPOINT;
  const token = process.env.PRODUCTOS_STORAGE_TOKEN;
  const projectId = process.env.PRODUCTOS_STORAGE_PROJECT_ID;
  if (!endpoint || !token || !projectId) throw new Error("File storage is not configured");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ op: "put", path, contentType, visibility }),
  });
  if (!response.ok) throw new Error("Storage could not create an upload link");
  return response.json() as Promise<{ url: string; key: string; publicUrl?: string }>;
}
async function storageGetUrl(path: string) {
  const endpoint = process.env.PRODUCTOS_STORAGE_ENDPOINT!;
  const token = process.env.PRODUCTOS_STORAGE_TOKEN!;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ op: "get", path, contentType: "application/octet-stream", visibility: "private" }),
  });
  if (!response.ok) throw new Error("Could not open protected file");
  return response.json() as Promise<{ url: string }>;
}
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || crypto.randomUUID(); }
function studentNumber() { return "42T-" + crypto.randomBytes(4).toString("hex").toUpperCase(); }
function trialIsActive(trialEndsAt: Date | null | undefined) { return Boolean(trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()); }
function randomPath(prefix: string, filename: string) {
  const ext = filename.includes(".") ? filename.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) : "bin";
  return `${prefix}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
}
export async function OPTIONS(req: NextRequest) { return json(req, { ok: true }); }

export async function GET(req: NextRequest) {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean).slice(1);
  const path = parts.join("/");
  try {
    if (path === "health") {
    if (path.startsWith("admin/") && !requireClaims(req, true)) return fail(req, "Administrator sign-in required.", 401);
      await prisma.$queryRaw`SELECT 1`;
      return json(req, { ok: true, service: "42 TECH API", database: "connected" });
    }
    if (path === "courses") {
      const courses = await prisma.course.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, include: { _count: { select: { lessons: true } } } });
      return json(req, { courses });
    }
    if (path === "settings/public") {
      const rows = await prisma.siteSetting.findMany({ where: { key: { in: ["siteTitle", "siteDescription", "supportEmail", "supportWhatsApp", "ecocashNumber"] } } });
      return json(req, { settings: Object.fromEntries(rows.map(row => [row.key, row.value])) });
    }
    if (path === "admin/overview") {
      const [students, pendingPayments, courses, visits, suggestions, comments] = await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }), prisma.payment.count({ where: { status: "PENDING" } }),
        prisma.course.count({ where: { published: true } }), prisma.visitEvent.count(),
        prisma.suggestion.count({ where: { status: "NEW" } }), prisma.comment.count(),
      ]);
      return json(req, { students, pendingPayments, courses, visits, suggestions, comments });
    }
    if (path === "admin/payments") {
      const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, studentNo: true, name: true, email: true, phone: true } }, course: { select: { id: true, title: true } } }, take: 200 });
      return json(req, { payments });
    }
    if (path.startsWith("admin/payments/proof/")) {
      const paymentId = parts[3];
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment?.proofUrl) return fail(req, "Payment proof is not attached", 404);
      const link = await storageGetUrl(payment.proofUrl);
      return json(req, { url: link.url });
    }
    if (path === "admin/courses") {
      const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" }, include: { lessons: { orderBy: { position: "asc" } }, _count: { select: { enrollments: true, payments: true } } } });
      return json(req, { courses });
    }
    if (path === "admin/students") {
      const students = await prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { createdAt: "desc" }, select: { id: true, studentNo: true, name: true, email: true, phone: true, registrationPaid: true, trialEndsAt: true, createdAt: true, enrollments: { include: { course: { select: { title: true } } } }, payments: { select: { amount: true, purpose: true, status: true } } }, take: 500 });
      return json(req, { students });
    }
    if (path === "admin/feedback") {
      const [suggestions, comments] = await Promise.all([
        prisma.suggestion.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true, studentNo: true } } }, take: 200 }),
        prisma.comment.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true, studentNo: true } } }, take: 200 }),
      ]);
      return json(req, { suggestions, comments });
    }
    if (path === "admin/settings") {
      const rows = await prisma.siteSetting.findMany();
      return json(req, { settings: Object.fromEntries(rows.map(r => [r.key, r.value])) });
    }
    if (path === "notifications") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in required", 401);
      const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, include: { reads: { where: { userId: String(claims.sub) }, select: { readAt: true } } }, take: 100 });
      return json(req, { notifications: notifications.map(n => ({ id: n.id, title: n.title, message: n.message, createdAt: n.createdAt, read: n.reads.length > 0 })) });
    }
    if (path === "student/dashboard") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in required", 401);
      const user = await prisma.user.findUnique({ where: { id: String(claims.sub) }, select: { id: true, studentNo: true, name: true, email: true, phone: true, registrationPaid: true, trialEndsAt: true, enrollments: { include: { course: { include: { _count: { select: { lessons: true } } } } } }, payments: { orderBy: { createdAt: "desc" }, take: 20 } } });
      return json(req, { user: user ? { ...user, trialActive: trialIsActive(user.trialEndsAt) } : null });
    }
    if (path.startsWith("lessons/")) {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in required", 401);
      const courseId = parts[1];
      const [enrollment, student] = await Promise.all([
        prisma.enrollment.findUnique({ where: { userId_courseId: { userId: String(claims.sub), courseId } } }),
        prisma.user.findUnique({ where: { id: String(claims.sub) }, select: { trialEndsAt: true } }),
      ]);
      if (!trialIsActive(student?.trialEndsAt) && !enrollment?.active) return fail(req, "Your free trial has ended. Subscribe to this course to continue learning.", 403);
      const lessons = await prisma.lesson.findMany({ where: { courseId }, orderBy: { position: "asc" } });
      const secure = await Promise.all(lessons.map(async l => ({
        id: l.id, title: l.title, description: l.description, position: l.position,
        videoUrl: l.videoUrl ? (await storageGetUrl(l.videoUrl)).url : null,
        documentUrl: l.documentUrl ? (await storageGetUrl(l.documentUrl)).url : null,
      })));
      return json(req, { lessons: secure });
    }
    return fail(req, "Not found", 404);
  } catch (e) {
    console.error("API GET error", e);
    return fail(req, "The request could not be completed", 500);
  }
}

export async function POST(req: NextRequest) {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean).slice(1);
  const path = parts.join("/");
  try {
    if (path.startsWith("admin/") && path !== "admin/login" && !requireClaims(req, true)) return fail(req, "Administrator sign-in required.", 401);
    if (path === "auth/register") {
      const body = await req.json();
      const name = String(body.name || "").trim(), email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || ""), phone = String(body.phone || "").trim();
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) return fail(req, "Enter your name, a valid email and a password of at least 8 characters.");
      const existing = await prisma.user.findFirst({ where: { OR: [{ email }] } });
      if (existing) return fail(req, "An account with this email already exists.", 409);
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const user = await prisma.user.create({ data: { studentNo: studentNumber(), name, email, phone: phone || null, passwordHash: await bcrypt.hash(password, 12), role: "STUDENT", registrationPaid: true, trialEndsAt } });
      const token = signToken({ sub: user.id, role: user.role, email: user.email }, process.env.AUTH_SECRET || "");
      return json(req, { message: "Your seven-day all-course free trial has started.", token, user: { id: user.id, studentNo: user.studentNo, name: user.name, email: user.email, role: user.role, registrationPaid: true, trialEndsAt, trialActive: true }, studentNo: user.studentNo, trialEndsAt, trialDays: 7, currency: "USD" }, 201);
    }
    if (path === "admin/passcode-login") return fail(req, "Passcode login has been removed.", 410);
    if (path === "auth/login" || path === "admin/login") {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase(), password = String(body.password || "");
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) return fail(req, "Email or password is incorrect.", 401);
      if (path === "admin/login" && user.role !== "ADMIN") return fail(req, "This account is not an administrator.", 403);
      const token = signToken({ sub: user.id, role: user.role, email: user.email }, process.env.AUTH_SECRET || "");
      return json(req, { token, user: { id: user.id, studentNo: user.studentNo, name: user.name, email: user.email, role: user.role, registrationPaid: user.registrationPaid, trialEndsAt: user.trialEndsAt, trialActive: trialIsActive(user.trialEndsAt) } });
    }
    if (path === "admin/bootstrap") {
      return fail(req, "Administrator account creation is disabled.", 410);
    }
    if (path === "payments/upload-url" || path === "admin/uploads/url") {
      const claims = path.startsWith("admin/") ? requireClaims(req, true) : requireClaims(req);
      if (!claims) return fail(req, "Sign in required", 401);
      const body = await req.json();
      const filename = String(body.filename || "upload.bin"), contentType = String(body.contentType || "application/octet-stream");
      if (!/^(image\/(png|jpeg|webp)|application\/pdf|video\/(mp4|webm|quicktime)|application\/(vnd\.openxmlformats-officedocument\.[^;]+|msword|vnd\.ms-powerpoint|vnd\.ms-excel|vnd\.oasis\.opendocument\.[^;]+|zip|x-zip-compressed|rtf)|text\/(plain|csv))$/.test(contentType)) return fail(req, "This file type is not supported.");
      const max = path.startsWith("admin/") ? 500 * 1024 * 1024 : 8 * 1024 * 1024;
      if (Number(body.size || 0) > max) return fail(req, "The selected file is too large.");
      const prefix = path.startsWith("admin/") ? "course-materials" : "payment-proofs";
      const objectPath = randomPath(`${prefix}/${String(claims.sub)}`, filename);
      const result = await storagePutUrl(objectPath, contentType, "private");
      return json(req, { uploadUrl: result.url, path: objectPath, key: result.key, method: "PUT", headers: { "Content-Type": contentType } });
    }
    if (path === "payments/external-proof") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in to continue.", 401);
      const body = await req.json();
      const method = body.method === "EMAIL" ? "EMAIL" : "WHATSAPP";
      const payment = await prisma.payment.findFirst({ where: { id: String(body.paymentId || ""), userId: String(claims.sub), status: "PENDING" } });
      if (!payment) return fail(req, "Pending payment not found.", 404);
      const reference = String(body.reference || "").trim().slice(0, 120);
      await prisma.payment.update({ where: { id: payment.id }, data: { reference: `${method} PROOF SENT${reference ? ` · ${reference}` : ""}` } });
      return json(req, { submitted: true, method, paymentId: payment.id, status: "PENDING" });
    }
    if (path === "payments/submit") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in to submit payment proof.", 401);
      const body = await req.json();
      const payment = await prisma.payment.findFirst({ where: { id: String(body.paymentId || ""), userId: String(claims.sub), status: "PENDING" } });
      if (!payment) return fail(req, "Pending payment not found.", 404);
      if (!String(body.proofPath || "").startsWith(`payment-proofs/${String(claims.sub)}/`)) return fail(req, "Invalid proof file.");
      const updated = await prisma.payment.update({ where: { id: payment.id }, data: { proofUrl: String(body.proofPath), reference: String(body.reference || "").slice(0, 120) || null } });
      return json(req, { submitted: true, paymentId: updated.id, status: updated.status });
    }
    if (path === "payments/course") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in to continue.", 401);
      const body = await req.json();
      const user = await prisma.user.findUnique({ where: { id: String(claims.sub) } });
      if (!user) return fail(req, "Student account not found.", 404);
      if (trialIsActive(user.trialEndsAt)) return fail(req, "Your seven-day free trial already includes every course. No payment is due yet.", 409);
      const course = await prisma.course.findFirst({ where: { id: String(body.courseId || ""), published: true } });
      if (!course) return fail(req, "Course not found.", 404);
      const [exists, enrolled] = await Promise.all([
        prisma.payment.findFirst({ where: { userId: user.id, courseId: course.id, status: "PENDING" } }),
        prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }),
      ]);
      if (enrolled?.active) return fail(req, "You already have an active subscription for this course.", 409);
      if (exists) return fail(req, "You already have a pending payment for this course.", 409);
      const payment = await prisma.payment.create({ data: { userId: user.id, courseId: course.id, amount: course.price, purpose: "COURSE" } });
      return json(req, { paymentId: payment.id, amount: Number(course.price), currency: "USD", ecocash: "0778671161" }, 201);
    }
    if (path === "access-codes/redeem") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in to redeem a course code.", 401);
      const body = await req.json(), code = String(body.code || "").trim().toUpperCase();
      const record = await prisma.accessCode.findUnique({ where: { codeHash: hashCode(code) } });
      if (!record || record.userId !== String(claims.sub) || record.usedAt || (record.expiresAt && record.expiresAt < new Date())) return fail(req, "This code is invalid, expired, already used or belongs to another student.", 400);
      await prisma.$transaction([
        prisma.accessCode.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
        prisma.enrollment.upsert({ where: { userId_courseId: { userId: record.userId, courseId: record.courseId } }, create: { userId: record.userId, courseId: record.courseId, active: true }, update: { active: true } }),
      ]);
      return json(req, { redeemed: true, courseId: record.courseId });
    }
    if (path === "suggestions") {
      const claims = requireClaims(req);
      const body = await req.json(), message = String(body.message || "").trim();
      if (message.length < 3 || message.length > 4000) return fail(req, "Write a suggestion between 3 and 4000 characters.");
      const item = await prisma.suggestion.create({ data: { userId: claims?.sub ? String(claims.sub) : null, message } });
      return json(req, { submitted: true, id: item.id }, 201);
    }
    if (path === "comments") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in to comment.", 401);
      const body = await req.json(), message = String(body.message || "").trim(), courseId = String(body.courseId || "");
      if (message.length < 2 || message.length > 2000) return fail(req, "Comment must be 2–2000 characters.");
      const item = await prisma.comment.create({ data: { userId: String(claims.sub), courseId, message } });
      return json(req, { submitted: true, id: item.id }, 201);
    }
    if (path === "notifications/read") {
      const claims = requireClaims(req);
      if (!claims) return fail(req, "Sign in required", 401);
      const body = await req.json();
      await prisma.notificationRead.upsert({ where: { notificationId_userId: { notificationId: String(body.notificationId), userId: String(claims.sub) } }, create: { notificationId: String(body.notificationId), userId: String(claims.sub) }, update: { readAt: new Date() } });
      return json(req, { read: true });
    }
    if (path === "visit") {
      const body = await req.json().catch(() => ({}));
      await prisma.visitEvent.create({ data: { path: String(body.path || "/").slice(0, 300), sessionId: String(body.sessionId || "").slice(0, 100) || null } });
      return json(req, { tracked: true });
    }
    if (path === "admin/payments/verify") {
      const body = await req.json(), id = String(body.paymentId || ""), status = body.status === "REJECTED" ? "REJECTED" : "PAID";
      const payment = await prisma.payment.update({ where: { id }, data: { status, verifiedAt: status === "PAID" ? new Date() : null } });
      if (status === "PAID" && payment.purpose === "REGISTRATION") await prisma.user.update({ where: { id: payment.userId }, data: { registrationPaid: true } });
      return json(req, { updated: true, status });
    }
    if (path === "admin/access-codes") {
      const body = await req.json(), paymentId = String(body.paymentId || "");
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.status !== "PAID" || payment.purpose !== "COURSE" || !payment.courseId) return fail(req, "Only verified course payments can receive an access code.", 400);
      const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } } });
      if (existing?.active) return fail(req, "This student already has access to the course.", 409);
      const code = makeCode();
      await prisma.accessCode.create({ data: { codeHash: hashCode(code), userId: payment.userId, courseId: payment.courseId } });
      return json(req, { code, studentId: payment.userId, courseId: payment.courseId }, 201);
    }
    if (path === "admin/courses") {
      const body = await req.json(), title = String(body.title || "").trim(), description = String(body.description || "").trim();
      const price = Number(body.price);
      if (title.length < 3 || !Number.isFinite(price) || price < 1 || price > 10) return fail(req, "Course title is required and price must be between $1 and $10.");
      const course = await prisma.course.create({ data: { title, slug: slugify(title) + "-" + crypto.randomBytes(3).toString("hex"), description, category: String(body.category || "Technology"), price, published: Boolean(body.published) } });
      return json(req, { course }, 201);
    }
    if (path === "admin/lessons") {
      const body = await req.json(), courseId = String(body.courseId || ""), title = String(body.title || "").trim();
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || title.length < 2) return fail(req, "Select a course and enter a lesson title.");
      const lesson = await prisma.lesson.create({ data: { courseId, title, description: String(body.description || ""), videoUrl: String(body.videoPath || "") || null, documentUrl: String(body.documentPath || "") || null, position: Number(body.position || 0) } });
      return json(req, { lesson }, 201);
    }
    if (path === "admin/notifications") {
      const body = await req.json(), title = String(body.title || "").trim(), message = String(body.message || "").trim();
      if (!title || !message) return fail(req, "Enter a notification title and message.");
      const notification = await prisma.notification.create({ data: { title, message } });
      return json(req, { notification }, 201);
    }
    if (path === "admin/settings") {
      const body = await req.json();
      const allowed = ["registrationFee", "siteTitle", "siteDescription", "supportEmail", "supportWhatsApp", "ecocashNumber"];
      const entries = Object.entries(body).filter(([key, value]) => allowed.includes(key) && typeof value === "string");
      if (body.registrationFee !== undefined && (Number(body.registrationFee) < 0.5 || Number(body.registrationFee) > 1.5)) return fail(req, "Registration fee must be between $0.50 and $1.50.");
      await prisma.$transaction(entries.map(([key, value]) => prisma.siteSetting.upsert({ where: { key }, create: { key, value: String(value) }, update: { value: String(value) } })));
      return json(req, { saved: true });
    }
    return fail(req, "Not found", 404);
  } catch (e: any) {
    console.error("API POST error", e);
    if (e?.code === "P2002") return fail(req, "That record already exists.", 409);
    return fail(req, "The request could not be completed", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean).slice(1);
  const path = parts.join("/");
  try {
    const body = await req.json();
    if (path.startsWith("admin/") && !requireClaims(req, true)) return fail(req, "Administrator sign-in required.", 401);
    if (path === "admin/courses") {
      const id = String(body.id || ""), data: any = {};
      if (body.title !== undefined) { data.title = String(body.title); data.slug = slugify(data.title) + "-" + crypto.randomBytes(3).toString("hex"); }
      if (body.description !== undefined) data.description = String(body.description);
      if (body.category !== undefined) data.category = String(body.category);
      if (body.price !== undefined) { const n = Number(body.price); if (n < 1 || n > 10) return fail(req, "Price must be $1–$10."); data.price = n; }
      if (body.published !== undefined) data.published = Boolean(body.published);
      return json(req, { course: await prisma.course.update({ where: { id }, data }) });
    }
    if (path === "admin/feedback") {
      const type = body.type === "comment" ? "comment" : "suggestion", id = String(body.id || ""), status = String(body.status || "REVIEWED");
      if (type === "comment") await prisma.comment.update({ where: { id }, data: { status } });
      else await prisma.suggestion.update({ where: { id }, data: { status } });
      return json(req, { updated: true });
    }
    return fail(req, "Not found", 404);
  } catch (e) { console.error("API PATCH error", e); return fail(req, "The request could not be completed", 500); }
}
export async function DELETE(req: NextRequest) {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean).slice(1);
  try {
    if (parts.join("/") === "admin/courses") {
    if (parts.join("/").startsWith("admin/") && !requireClaims(req, true)) return fail(req, "Administrator sign-in required.", 401);
      const id = new URL(req.url).searchParams.get("id") || "";
      await prisma.course.delete({ where: { id } });
      return json(req, { deleted: true });
    }
    return fail(req, "Not found", 404);
  } catch (e) { console.error("API DELETE error", e); return fail(req, "The request could not be completed", 500); }
}