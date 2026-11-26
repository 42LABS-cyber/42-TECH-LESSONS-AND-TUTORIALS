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

const { validateDirectMessage, buildGroupShareUrl } = require("../lib/community-rules.cjs");
test("direct messages use the same 1–1000 character safety limit", () => {
  assert.equal(validateDirectMessage("Hello everyone"), true);
  assert.equal(validateDirectMessage("  "), false);
  assert.equal(validateDirectMessage("x".repeat(1001)), false);
});
test("public group links identify the group while private links use invite codes", () => {
  assert.equal(buildGroupShareUrl("https://example.com", {id:"group-1",isPrivate:false}), "https://example.com/community?group=group-1");
  assert.equal(buildGroupShareUrl("https://example.com", {id:"group-2",isPrivate:true,inviteCode:"AB12CD34"}), "https://example.com/community?invite=AB12CD34");
});
