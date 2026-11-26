function creditsForPayment(amount, rate) {
  const paid=Number(amount), perDollar=Number(rate);
  if(!Number.isFinite(paid)||!Number.isFinite(perDollar)||paid<=0||paid>1000||perDollar<1||perDollar>100000)return 0;
  return Math.floor(paid*perDollar);
}
function canRedeem(code, now=new Date()) {
  return Boolean(code&&code.userId===code.ownerId&&!code.redeemedAt&&new Date(code.expiresAt).getTime()>now.getTime());
}
function normaliseStudentNo(value) {
  return String(value||"").trim().toUpperCase().slice(0,40);
}
module.exports={creditsForPayment,canRedeem,normaliseStudentNo};
