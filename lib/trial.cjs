const TRIAL_DAYS = 7;
function getTrialEnd(startedAt) {
  const end = new Date(startedAt);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}
function isTrialActive(trialEndsAt, now = new Date()) {
  return Boolean(trialEndsAt && new Date(trialEndsAt).getTime() > new Date(now).getTime());
}
module.exports = { TRIAL_DAYS, getTrialEnd, isTrialActive };