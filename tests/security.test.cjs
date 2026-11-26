const test = require("node:test");
const assert = require("node:assert/strict");
const { signToken, verifyToken } = require("../lib/security.cjs");

test("remembered student tokens remain valid for one year", () => {
  const before = Math.floor(Date.now() / 1000);
  const token = signToken({ sub: "student-1", role: "STUDENT" }, "test-secret");
  const payload = verifyToken(token, "test-secret");
  assert.equal(payload.sub, "student-1");
  assert.ok(payload.exp - before >= 31535999);
});
test("remembered student tokens still reject the wrong signing secret", () => {
  const token = signToken({ sub: "student-1" }, "right-secret");
  assert.equal(verifyToken(token, "wrong-secret"), null);
});
