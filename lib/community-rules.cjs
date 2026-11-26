function validateGroupName(value) {
  const name = String(value || "").trim();
  return name.length >= 3 && name.length <= 40;
}
function validateGroupMessage(value) {
  const message = String(value || "").trim();
  return message.length >= 1 && message.length <= 1000;
}
function validateDirectMessage(value) {
  return validateGroupMessage(value);
}
function buildGroupShareUrl(baseUrl, group) {
  const url = new URL("/community", baseUrl);
  if (group.isPrivate) url.searchParams.set("invite", String(group.inviteCode || ""));
  else url.searchParams.set("group", String(group.id || ""));
  return url.toString();
}
module.exports = { validateGroupName, validateGroupMessage, validateDirectMessage, buildGroupShareUrl };
