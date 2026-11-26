import Link from "next/link";
export default function LegalPage() {
 return <main className="content-page legal-page">
  <Link className="back-link" href="/">← Back to 42 TECH</Link>
  <div className="page-eyebrow">42 TECH / POLICIES</div><h1>Terms, privacy and refunds</h1>
  <p className="lead">Last updated: November 2026. Service currently available in Zimbabwe only.</p>
  <nav className="legal-nav"><a href="#terms">Terms of Service</a><a href="#privacy">Privacy Policy</a><a href="#refunds">Trial and refunds</a></nav>
  <section id="terms" className="content-panel"><h2>Terms of Service</h2>
   <h3>1. Who we are</h3><p>42 TECH Lessons &amp; Tutorials ("42 TECH", "we") provides online technology courses. Contact: WhatsApp 0787089348 or 0778671161, email e45971854@gmail.com.</p>
   <h3>2. Your account</h3><p>You must give correct details when you register. Keep your password private. One account is for one person. Sharing your login or course content with others is not allowed and may lead to account removal.</p>
   <h3>3. Courses and access</h3><p>Courses are self-paced. Access lasts while your subscription is active. We may update, improve or replace lessons over time.</p>
   <h3>4. Payments</h3><p>Prices are in US dollars per month, shown on each course page. Payment is made by EcoCash and confirmed by us after you send proof of payment. Nothing is charged automatically.</p>
   <h3>5. Acceptable use</h3><p>Use what you learn legally and ethically. Cybersecurity lessons are for defence and education only. Do not copy, resell or publish our lessons without permission. Do not attempt to break into the site or other users' accounts.</p>
   <h3>6. Content and ownership</h3><p>Lessons, notes and designs belong to 42 TECH or its content creators. You get a personal, non-transferable licence to use them for your own learning.</p>
   <h3>7. No guarantees</h3><p>We work hard to teach well, but we cannot promise specific jobs, income or results. The service is provided as is, and we may be unavailable from time to time.</p>
   <h3>8. Changes</h3><p>We may change these terms. Continuing to use the site after a change means you accept it.</p>
  </section>
  <section id="privacy" className="content-panel"><h2>Privacy Policy</h2>
   <h3>What we collect</h3><p>Your name, email address and phone or WhatsApp number when you register; your course progress; payment proof you send us (such as the EcoCash reference); and messages you send through suggestion and comment forms.</p>
   <h3>Why we use it</h3><p>To run your account, unlock your courses, confirm payments, give support, and improve the lessons. We do not sell your data.</p>
   <h3>Who sees it</h3><p>Only the 42 TECH team and the services needed to run the site (such as hosting). We share information with authorities only if the law requires it.</p>
   <h3>Keeping it safe</h3><p>We take reasonable steps to protect your information. No online service is completely risk-free, so use a strong, unique password.</p>
   <h3>Your choices</h3><p>You can ask us to see, correct or delete your account data by contacting us on WhatsApp or email. We handle personal data in line with Zimbabwe's Cyber and Data Protection Act.</p>
  </section>
  <section id="refunds" className="content-panel"><h2>7-day free trial</h2><p>When you register you get seven days of free access to all courses. No payment is needed during the trial.</p>
   <h3>What happens after 7 days</h3><p>On day eight your access pauses. To continue, pay the monthly price of the course you want by EcoCash and send proof on WhatsApp. We will unlock it. You will never be charged automatically.</p>
   <h3>Monthly subscription</h3><p>Each paid month gives 30 days of access to the course you paid for. If you stop paying, your access ends when the month ends. You can come back any time.</p>
   <h3>Refunds</h3><p>Because you can try every course free first, payments are generally non-refundable. If you were charged by mistake, paid twice, or could not access a course you paid for, contact us within seven days of payment and we will fix it or refund you.</p>
   <p className="policy-note">Need help with a payment? WhatsApp 0787089348 / 0778671161. EcoCash: 0778671161.</p>
  </section>
  <footer className="content-footer"><Link href="/">Home</Link><a href="https://wa.me/263787089348">WhatsApp support</a><span>© 42 · RIMURU TEMPEST · TEMPEST MEDIA 2026</span></footer>
 </main>;
}