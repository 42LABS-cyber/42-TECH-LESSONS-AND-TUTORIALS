import Link from "next/link";
import prisma from "@/lib/db";

const courses = {
  web: { name:"Web Development Fundamentals", level:"Beginner", lessons:12, price:3, summary:"Build responsive websites with HTML, CSS and JavaScript.", learn:["Write clean HTML pages","Style them with CSS","Make layouts that work on phones and computers","Add interactivity with JavaScript","Publish a real website online"], modules:[["Your first web page","How websites work; HTML structure, text, links and images."],["Styling with CSS","Colours, fonts, spacing and the box model."],["Responsive layouts","Flexbox, grid and designing for small screens."],["JavaScript basics","Variables, functions, events and the DOM."],["Project and publishing","Build a personal site and put it online."]], requirements:"A computer or smartphone and internet. No experience needed.", audience:"Absolute beginners, students, and anyone who wants a website for themselves or a small business." },
  python: { name:"Python Programming", level:"Beginner", lessons:18, price:5, summary:"Learn Python from the basics to practical mini projects.", learn:["Understand variables, loops and functions","Work with lists, files and data","Fix errors in your own code","Build small useful programs"], modules:[["Getting started","Installing Python, running code, printing and input."],["Control flow","Conditions, loops and logic."],["Functions and data","Lists, dictionaries, strings and functions."],["Files and errors","Reading and writing files; handling mistakes."],["Mini projects","Calculator, quiz game and a simple data tool."]], requirements:"A computer and internet. No coding experience needed.", audience:"Beginners who want a first programming language, and students preparing for further study." },
  cyber: { name:"Cybersecurity Essentials", level:"Beginner to intermediate", lessons:24, price:8, summary:"Understand threats, security foundations and defensive practice.", learn:["Recognise common attacks like phishing and malware","Secure accounts, devices and networks","Understand how encryption and passwords work","Follow basic incident-response steps","Learn safe, legal practice"], modules:[["Security foundations","The CIA triad, risk and common terms."],["Threats and attacks","Phishing, malware, social engineering and scams."],["Protecting accounts and devices","Passwords, 2FA, updates and backups."],["Networks and encryption","How networks work and how data is protected."],["Defence and response","Spotting incidents and responding. Ethics and the law."]], requirements:"Basic computer skills. Networking knowledge helps but is not required.", audience:"Students, IT beginners, and anyone who wants to stay safe online. Defensive focus only." },
  canva: { name:"Graphic Design with Canva", level:"Beginner", lessons:8, price:2, summary:"Create polished posters, social graphics and brand assets.", learn:["Navigate Canva confidently","Apply colour, fonts and layout rules","Design posters and social media posts","Build a simple brand kit"], modules:[["Canva basics","Templates, elements and the editor."],["Design principles","Colour, type, spacing and hierarchy."],["Posters and flyers","Design and export for print."],["Social media graphics","Sizes and styles for WhatsApp, Facebook and Instagram."],["Brand kit project","Logo, colours and fonts for a small business."]], requirements:"A phone or computer and a free Canva account.", audience:"Small business owners, students and anyone who needs good-looking graphics fast." },
  office: { name:"Computer Skills & Office Tools", level:"Beginner", lessons:6, price:1, summary:"Master everyday computer use, documents and spreadsheets.", learn:["Manage files and folders","Write and format documents","Build simple spreadsheets with formulas","Make basic presentations","Use email and the internet safely"], modules:[["Computer basics","Files, folders, settings and shortcuts."],["Documents","Typing, formatting and printing."],["Spreadsheets","Tables, formulas and simple charts."],["Presentations and email","Slides, email etiquette and attachments."]], requirements:"None. If you can switch on a computer, you can start.", audience:"First-time computer users, job seekers and students." },
  fullstack: { name:"Advanced Full-Stack Development", level:"Intermediate to advanced", lessons:40, price:10, summary:"Connect interfaces, APIs, databases and deployment workflows.", learn:["Build front ends that talk to APIs","Design and query databases","Create secure back-end services","Handle sign-in and user data","Deploy and maintain a live app"], modules:[["Front-end foundations","Modern JavaScript and component thinking."],["Back-end and APIs","Servers, routes and REST."],["Databases","Data modelling, SQL and queries."],["Authentication and security","Sign-in, sessions and protecting user data."],["Deployment","Git, hosting and going live."],["Capstone project","Plan, build and launch a complete app."]], requirements:"Basic HTML, CSS and JavaScript (the Web Development Fundamentals course is enough).", audience:"Learners ready to move from simple pages to real applications." }
} as const;

type Slug = keyof typeof courses;
const moduleTopics: Record<Slug,string[][]> = {
 web:[
  ["How browsers request pages from web servers","HTML elements, attributes, headings, paragraphs, links and images","Semantic page structure, forms and accessible labels"],
  ["CSS selectors, cascade, inheritance and specificity","Typography, colour, spacing, borders and the box model","Reusable classes and maintainable stylesheets"],
  ["Flexbox alignment and spacing","CSS Grid rows, columns and responsive breakpoints","Mobile-first layouts, navigation and image sizing"],
  ["JavaScript values, variables, operators and conditions","Functions, arrays, loops and event listeners","DOM selection, changing page content and form validation"],
  ["Project planning, file organisation and testing","Publishing with Git and a hosting platform","Basic accessibility, performance and website maintenance"]
 ],
 python:[
  ["Installing Python and choosing an editor","Running scripts, interactive shell, print and input","Variables, data types, conversion and operators"],
  ["Boolean expressions and comparisons","if / elif / else decision structures","for and while loops, ranges and loop control"],
  ["Defining and calling functions","Parameters, return values and scope","Lists, tuples, dictionaries, sets and string methods"],
  ["Opening, reading and writing text files","Working with paths and structured data","Exceptions, debugging and clear error messages"],
  ["Breaking a problem into steps","Building a calculator and quiz game","Testing, improving and documenting a small program"]
 ],
 cyber:[
  ["Confidentiality, integrity and availability","Assets, threats, vulnerabilities, likelihood and impact","Security policies, least privilege and defence in depth"],
  ["Phishing, social engineering and identity theft","Malware types, ransomware and unsafe downloads","Web, email and network attack examples"],
  ["Password managers and multi-factor authentication","Operating-system updates, backups and device protection","Safe Wi-Fi, router settings and account recovery"],
  ["IP addresses, DNS, HTTP and common network ports","Encryption in transit and at rest","Hashing, certificates and secure connections"],
  ["Recognising suspicious activity and preserving evidence","Containment, reporting, recovery and lessons learned","Legal boundaries, consent and ethical security practice"]
 ],
 canva:[
  ["Canva workspace, templates and page setup","Elements, text boxes, shapes, frames and uploads","Export formats, dimensions and quality settings"],
  ["Visual hierarchy, alignment and spacing","Colour combinations, contrast and readability","Font pairing, consistency and accessibility"],
  ["Poster purpose, audience and message hierarchy","Using images, icons and calls to action","Preparing print-ready and digital flyer exports"],
  ["Square, portrait, story and banner dimensions","Designing for Facebook, Instagram and WhatsApp","Keeping brand style consistent across formats"],
  ["Simple logo and brand identity concepts","Choosing brand colours and type styles","Building a reusable mini brand kit and asset set"]
 ],
 office:[
  ["Hardware, operating systems and desktop basics","Files, folders, extensions and storage","Keyboard shortcuts, safe browsing and device care"],
  ["Document layout, fonts, paragraphs and lists","Tables, images, headers, footers and page numbers","Saving, exporting PDF and printing documents"],
  ["Cells, rows, columns and data types","SUM, AVERAGE, MIN, MAX and basic formulas","Sorting, filtering, formatting and simple charts"],
  ["Slide layouts, themes and visual storytelling","Email subject lines, recipients and attachments","Online safety, professional communication and file sharing"]
 ],
 fullstack:[
  ["Modern JavaScript syntax and asynchronous basics","Components, props, state and reusable UI","Forms, validation, routing and accessible interfaces"],
  ["HTTP methods, status codes and JSON","REST API route design and input validation","Error handling, logging and API documentation"],
  ["Relational data, tables, keys and relationships","SQL queries, joins, constraints and indexes","ORM workflows, migrations and data integrity"],
  ["Authentication versus authorisation","Password hashing, tokens and session lifetimes","Input validation, secrets, permissions and common web risks"],
  ["Git branches, commits and pull requests","Environment variables and production configuration","Deployments, logs, backups and monitoring"],
  ["Requirements, wireframes and data modelling","Build a complete app with a tested API","Release checklist, documentation and maintenance plan"]
 ]
};
const moduleActivities: Record<Slug,string[]> = {
 web:["Create a valid multi-section HTML page and test its links and form labels.","Build a styled profile card and explain the box model used.","Create a responsive landing page that works on a narrow phone screen.","Add a menu toggle and client-side form validation with JavaScript.","Publish a small portfolio site and test it on phone and desktop."],
 python:["Run a script that asks for a name and prints a formatted greeting.","Write a program that classifies a number using conditions.","Create reusable functions to calculate totals and manage a list of tasks.","Save a set of records to a file and handle a missing-file error.","Complete a command-line quiz or calculator and test edge cases."],
 cyber:["Write a simple risk register for a personal device or small organisation.","Identify warning signs in sample phishing messages without opening links.","Create a personal account-security and backup checklist.","Explain how HTTPS protects data and why passwords should not be stored as plain text.","Write a short incident-response checklist for a suspected compromised account."],
 canva:["Create a clean social post using a template, shapes and uploaded assets.","Redesign a crowded layout using hierarchy, spacing and contrast.","Design an event poster with a clear headline, date, venue and call to action.","Export the same campaign in square and story formats.","Create a one-page brand guide with a logo, palette and font choices."],
 office:["Organise a sample folder structure and identify safe file extensions.","Format a two-page professional letter and export it as PDF.","Build a monthly budget sheet using formulas and a simple chart.","Create a five-slide presentation and draft a professional email with an attachment."],
 fullstack:["Build a reusable front end with validated forms and clear loading states.","Design and document a small REST API with validation and error responses.","Create related database tables and query them with joins.","Implement a secure sign-in flow with password hashing and access checks.","Deploy an app using environment variables and inspect its runtime logs.","Plan and deliver a small full-stack project with tests and deployment notes."]
};
function findGuideKey(slug:string,title:string): Slug|null {
 const value=(slug+" "+title).toLowerCase();
 if(value.includes("python"))return "python";
 if(value.includes("cyber")||value.includes("security"))return "cyber";
 if(value.includes("canva")||value.includes("graphic")||value.includes("design"))return "canva";
 if(value.includes("office")||value.includes("computer skill")||value.includes("digital skill"))return "office";
 if(value.includes("fullstack")||value.includes("full-stack")||value.includes("advanced"))return "fullstack";
 if(value.includes("web")||value.includes("html")||value.includes("website"))return "web";
 return null;
}
export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const dbCourse = await prisma.course.findUnique({where:{slug:rawSlug},include:{modules:{orderBy:{position:"asc"},include:{lessons:{where:{status:"PUBLISHED"},orderBy:{position:"asc"}}}},lessons:{where:{status:"PUBLISHED"},orderBy:{position:"asc"}}}});
  const guideKey=findGuideKey(rawSlug,dbCourse?.title||"");
  const guide=guideKey?courses[guideKey]:null;
  if(dbCourse) return <main className="content-page">
    <Link className="back-link" href="/">← All courses</Link>
    <div className="page-eyebrow">42 TECH / PUBLISHED COURSE</div>
    <h1>{dbCourse.title}</h1><p className="lead">{dbCourse.description}</p>
    <div className="course-facts"><span>{dbCourse.level||"Self-paced"}</span><span>{dbCourse.lessons.length} lessons</span><span>{dbCourse.category}</span><span>${Number(dbCourse.price).toFixed(2)} per month</span></div>
    <p><Link className="page-button" href="/">Sign in or register to start learning</Link></p>
    <section className="content-panel"><h2>Complete course curriculum</h2><p>This outline shows the published module structure and lesson descriptions. The student dashboard contains protected lesson notes and resources after sign-in and access approval.</p>
      {dbCourse.modules.length?dbCourse.modules.map((m:any,i:number)=><details key={m.id} open={i===0}><summary>Module {i+1}: {m.title}</summary>{m.lessons.length?<ol>{m.lessons.map((l:any)=><li key={l.id}><b>{l.title}</b>{l.description?<p>{l.description}</p>:<p>Lesson overview and learning material are available inside the student dashboard.</p>}{l.sourceName?<p>Resource: {l.sourceName}</p>:null}{l.sourceUrl?<p><a href={l.sourceUrl} target="_blank" rel="noreferrer">Open related learning resource ↗</a></p>:null}</li>)}</ol>:<p>Lessons for this module are being prepared.</p>}</details>):dbCourse.lessons.length?<ol>{dbCourse.lessons.map((l:any)=><li key={l.id}><b>{l.title}</b>{l.description?<p>{l.description}</p>:<p>Lesson material is available inside the student dashboard when access is active.</p>}</li>)}</ol>:<p>Course lessons are being prepared.</p>}
    </section>
    {guide&&<><section className="content-panel"><h2>What you will learn</h2><ul>{guide.learn.map(item=><li key={item}>{item}</li>)}</ul><h3>Who this course is for</h3><p>{guide.audience}</p><h3>What you need before starting</h3><p>{guide.requirements}</p></section><section className="content-panel"><h2>Expanded module guide</h2>{guide.modules.map(([moduleName,detail],i)=><details key={moduleName} open={i===0}><summary>Module {i+1}: {moduleName}</summary><p>{detail}</p><h3>Topics covered</h3><ul>{moduleTopics[guideKey!][i].map(topic=><li key={topic}>{topic}</li>)}</ul><h3>Practical activity</h3><p>{moduleActivities[guideKey!][i]}</p></details>)}</section></>}
    {dbCourse.sourceName||dbCourse.sourceUrl?<section className="content-panel"><h2>Source and attribution</h2>{dbCourse.sourceName?<p>Learning source: {dbCourse.sourceName}</p>:null}{dbCourse.sourceUrl?<p><a href={dbCourse.sourceUrl} target="_blank" rel="noreferrer">Visit original learning source ↗</a></p>:null}</section>:null}
    <section className="content-panel"><h2>Access and pricing</h2><p>New students receive seven days of trial access. After the trial, this course costs ${Number(dbCourse.price).toFixed(2)} per month. Payments are reviewed manually before access is activated.</p></section>
    <footer className="content-footer"><Link href="/community">Student community</Link><Link href="/legal#terms">Terms</Link><Link href="/legal#privacy">Privacy</Link><span>© 42 TECH LESSONS & TUTORIALS</span></footer>
  </main>;
  const course = courses[rawSlug as Slug] || courses.web;
  const other = Object.entries(courses).filter(([slug]) => slug !== rawSlug);
  return <main className="content-page">
    <Link className="back-link" href="/">← All courses</Link>
    <div className="page-eyebrow">42 TECH / COURSE GUIDE</div>
    <h1>{course.name}</h1><p className="lead">{course.summary}</p>
    <div className="course-facts"><span>{course.level}</span><span>{course.lessons} lessons</span><span>Self-paced</span><span>${course.price.toFixed(2)} per month</span></div>
    <p><Link className="page-button" href="/#courses">Explore courses and register</Link></p>
    <section className="content-panel"><h2>What you will learn</h2><ul>{course.learn.map(item=><li key={item}>{item}</li>)}</ul></section>
    <section className="content-panel"><h2>Complete module-by-module course guide</h2><p>Each module includes the key concepts to study and a practical task to help you apply what you learn. Lesson notes, exercises and downloadable resources are provided inside the student learning area as they are published.</p>{course.modules.map(([name,detail],i)=><details key={name} open={i===0}><summary>Module {i+1}: {name}</summary><p>{detail}</p><h3>Topics covered</h3><ul>{moduleTopics[rawSlug as Slug]?.[i]?.map(topic=><li key={topic}>{topic}</li>)}</ul><h3>Practical activity</h3><p>{moduleActivities[rawSlug as Slug]?.[i]}</p></details>)}</section>
    <section className="content-panel"><h2>Requirements</h2><p>{course.requirements}</p><h2>Who this is for</h2><p>{course.audience}</p></section>
    <section className="content-panel"><h2>Price and 7-day free trial</h2><p><strong>${course.price.toFixed(2)} per month</strong> after the free trial. New students get seven days of access to all courses. On day eight, access pauses until you pay the monthly fee by EcoCash. No automatic charges. Service currently available in Zimbabwe.</p></section>
    <section className="content-panel"><h2>Questions</h2><details><summary>How does the free trial work?</summary><p>You get seven days of access to all courses free. No payment is needed during the trial.</p></details><details><summary>What happens after seven days?</summary><p>Access pauses until you pay the monthly fee for the course. Nothing is charged automatically.</p></details><details><summary>How do I pay?</summary><p>Pay by EcoCash to 0778671161, then send proof on WhatsApp. The team verifies the payment before unlocking access.</p></details><details><summary>Can I cancel?</summary><p>Yes. Stop paying and the subscription ends. Read the <Link href="/legal#refunds">trial and refund policy</Link>.</p></details></section>
    <section className="content-panel"><h2>Join the community</h2><p>Ask questions and learn with other students.</p><p><a href="https://chat.whatsapp.com/KVOhyzW41H9LrJTvZW3Wt?s=cl&p=a&iam=2" target="_blank" rel="noreferrer">Join the WhatsApp group ↗</a> · <a href="https://wa.me/263787089348" target="_blank" rel="noreferrer">Message support ↗</a></p></section>
    <section className="content-panel"><h2>Other courses</h2><ul>{other.map(([key,value])=><li key={key}><Link href={`/course/${key}`}>{value.name}</Link></li>)}</ul></section>
    <footer className="content-footer"><Link href="/legal#terms">Terms</Link><Link href="/legal#privacy">Privacy</Link><Link href="/legal#refunds">Trial and refunds</Link><span>© 42 · RIMURU TEMPEST · TEMPEST MEDIA 2026</span></footer>
  </main>;
}