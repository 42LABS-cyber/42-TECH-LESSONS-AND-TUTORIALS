const test = require("node:test");
const assert = require("node:assert/strict");
const { validateGroupName, validateGroupMessage } = require("../lib/community-rules.cjs");

test("group names must be 3 to 40 characters after trimming", () => {
  assert.equal(validateGroupName("  AI learners  "), true);
  assert.equal(validateGroupName("ab"), false);
  assert.equal(validateGroupName("x".repeat(41)), false);
});
test("group messages must be 1 to 1000 characters after trimming", () => {
  assert.equal(validateGroupMessage(" Hello "), true);
  assert.equal(validateGroupMessage("   "), false);
  assert.equal(validateGroupMessage("x".repeat(1001)), false);
});
