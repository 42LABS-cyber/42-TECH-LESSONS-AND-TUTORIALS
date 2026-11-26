const crypto = require('node:crypto');
function signToken(payload, secret, ttlSeconds = 43200) {
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}
function verifyToken(token, secret) {
  try {
    if (!token || !secret) return null;
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    const expected = crypto.createHmac('sha256', secret).update(body).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}
function hashCode(code) { return crypto.createHash('sha256').update(String(code).trim().toUpperCase()).digest('hex'); }
function makeCode() { return `42TECH-${crypto.randomBytes(5).toString('hex').toUpperCase()}`; }
module.exports = { signToken, verifyToken, hashCode, makeCode };