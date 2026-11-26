function validateGroupName(value) {
  const name = String(value || "").trim();
  return name.length >= 3 && name.length <= 40;
}
function validateGroupMessage(value) {
  const message = String(value || "").trim();
  return message.length >= 1 && message.length <= 1000;
}
module.exports = { validateGroupName, validateGroupMessage };
