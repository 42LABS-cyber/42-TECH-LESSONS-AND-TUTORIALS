const test=require("node:test");
const assert=require("node:assert/strict");
const {creditsForPayment,canRedeem,normaliseStudentNo}=require("../lib/redemption-rules.cjs");
test("converts a positive payment into whole credits",()=>assert.equal(creditsForPayment(2.50,100),250));
test("rejects invalid payment amounts and rates",()=>{assert.equal(creditsForPayment(0,100),0);assert.equal(creditsForPayment(1,0),0);assert.equal(creditsForPayment(1001,100),0);});
test("accepts only the assigned student's unexpired unused code",()=>{const now=new Date("2026-11-26T12:00:00Z");assert.equal(canRedeem({userId:"u1",ownerId:"u1",redeemedAt:null,expiresAt:new Date("2026-11-27T00:00:00Z")},now),true);});
test("rejects a code assigned to another student",()=>assert.equal(canRedeem({userId:"u2",ownerId:"u1",redeemedAt:null,expiresAt:new Date("2026-11-27T00:00:00Z")},new Date("2026-11-26T12:00:00Z")),false));
test("rejects used and expired codes",()=>{const now=new Date("2026-11-26T12:00:00Z");assert.equal(canRedeem({userId:"u1",ownerId:"u1",redeemedAt:now,expiresAt:new Date("2026-11-27")},now),false);assert.equal(canRedeem({userId:"u1",ownerId:"u1",redeemedAt:null,expiresAt:new Date("2026-11-25")},now),false);});
test("normalises student numbers without changing their assigned value",()=>assert.equal(normaliseStudentNo(" 42T-A1B2C3D4 "),"42T-A1B2C3D4"));
