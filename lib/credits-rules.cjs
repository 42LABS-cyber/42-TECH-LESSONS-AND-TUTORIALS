function lessonAccess(input) {
  if (input.trialActive) return "trial";
  if (input.courseActive) return "subscribed";
  if (input.unlocked) return "unlocked";
  if (input.cost === 0 && input.subscriptionActive) return "included";
  return "locked";
}
function validCreditAdjustment(balance, delta) {
  return Number.isInteger(delta) && delta !== 0 && Math.abs(delta) <= 1000000 && balance + delta >= 0;
}
module.exports = { lessonAccess, validCreditAdjustment };
