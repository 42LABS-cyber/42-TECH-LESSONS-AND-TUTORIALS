"use client";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { upload } from "@vercel/blob/client";

type Course={id:string;title:string;price:string|number;modules?:any[]};
const API="https://42-tech-lessons-and-tutorials.vercel.app/api";
const defaults:Record<string,{price:number;category:string;level:string;description:string}>={
 "Linux & System Administration":{price:3,category:"Technology",level:"Beginner to Intermediate",description:"Linux commands, system administration and practical operating-system skills."},
 "ACCA Financial Accounting":{price:5,category:"Accounting",level:"Beginner to Intermediate",description:"ACCA Financial Accounting (FA/FFA) syllabus resources and exam practice."}
};
function cleanTitle(name:string){return name.replace(/\.pdf$/i,"").replace(/[_]+/g," ").replace(/\s+/g," ").trim()}
function moduleCost(totalBytes:number,title:string){const mb=Math.max(1,Math.ceil(totalBytes/1048576));const advanced=/advanced|threat|emulation|red team|ethical hacking|penetration|buffer overflow|reverse/i.test(title);return Math.max(20,Math.min(1000,20+mb*10+(advanced?20:0)))}
export default function BulkImport({token,courses,onDone,onNotice}:{token:string;courses:Course[];onDone:()=>void;onNotice:(s:string)=>void}){
 const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[status,setStatus]=useState(""),[report,setReport]=useState<string[]>([]),[prices,setPrices]=useState<Record<string,string>>({});
 useEffect(()=>setPrices(Object.fromEntries(courses.map(c=>[c.id,String(c.price)]))),[courses]);
 async function saveCoursePrice(c:Course){const price=Number(prices[c.id]);if(!Number.isFinite(price)||price<1||price>10){onNotice("Monthly course price must be between $1 and $10.");return}try{const r=await fetch(API+"/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({id:c.id,price})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not save course price");onNotice(c.title+" monthly price updated to $"+price.toFixed(2));onDone()}catch(e:any){onNotice(e.message)}}
 async function api(path:string,body:any){const r=await fetch(API+"/"+path,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");return d}
 function upload(url:string,blob:Blob,headers:Record<string,string>){return new Promise<void>((resolve,reject)=>{const x=new XMLHttpRequest();x.open("PUT",url);Object.entries(headers).forEach(([k,v])=>x.setRequestHeader(k,v));x.onload=()=>x.status>=200&&x.status<300?resolve():reject(new Error("Storage upload failed ("+x.status+")"));x.onerror=()=>reject(new Error("Network error during file upload"));x.send(blob)})}
 async function run(){
  if(!file)return;setBusy(true);setProgress(0);setReport([]);const logs:string[]=[];let imported=0,skipped=0,failed=0;
  try{
   const zip=await JSZip.loadAsync(file);const entries=Object.values(zip.files).filter(x=>!x.dir&&x.name.toLowerCase().endsWith(".pdf")&&x.name.split("/").length>=3);
   const grouped=new Map<string,{course:string;module:string;files:any[];bytes:number}>();
   for(const entry of entries){const parts=entry.name.split("/");const course=parts[0],module=parts[1],name=parts.slice(2).join("/");if(!course||!module||!name)continue;const key=course+"|||"+module;const item=grouped.get(key)||{course,module,files:[],bytes:0};item.files.push({entry,name});item.bytes+=(entry as any)._data?.uncompressedSize||0;grouped.set(key,item)}
   const catalog=[...courses];const moduleMap=new Map<string,any>();
   const total=entries.length;let completed=0;
   for(const group of grouped.values()){
    let course=catalog.find(c=>c.title.toLowerCase()===group.course.toLowerCase());
    if(!course){const d=defaults[group.course];if(!d)throw new Error("No course setup is defined for "+group.course);const made=await api("admin/courses",{title:group.course,description:d.description,category:d.category,level:d.level,price:d.price,published:true});course=made.course;catalog.push(course);logs.push("Created course: "+course.title+" ($"+d.price+"/month)")}
    const key=course.id+"|||"+group.module;let mod=moduleMap.get(key)||course.modules?.find((m:any)=>m.title.toLowerCase()===group.module.toLowerCase());
    if(!mod){const cost=moduleCost(group.bytes,group.module);const made=await api("admin/modules",{courseId:course.id,title:group.module,position:(course.modules||[]).length,creditCost:cost});mod=made.module;moduleMap.set(key,mod);if(!course.modules)course.modules=[];course.modules.push(mod);logs.push("Created "+group.module+" — "+cost+" credits")}
    const existing=new Set((mod.lessons||[]).map((l:any)=>String(l.title).toLowerCase()));
    for(const item of group.files){
     const title=cleanTitle(item.name.split("/").pop()||item.name);
     if(existing.has(title.toLowerCase())){skipped++;completed++;setProgress(Math.round(completed/total*100));continue}
     try{
      const blob=await item.entry.async("blob");if(blob.size>500*1024*1024)throw new Error("File exceeds 500 MB");
      const stored=await upload("course-materials/"+course.id+"/"+mod.id+"/"+title+".pdf",blob,{access:"private",handleUploadUrl:API+"/admin/blob-upload",headers:{Authorization:"Bearer "+token},contentType:"application/pdf"});
      await api("admin/lessons",{courseId:course.id,moduleId:mod.id,title,description:"Imported from the curated Course1-0 archive. Review the document's rights, accuracy and safety before publishing.",kind:"file",documentPath:stored.pathname,filePath:stored.pathname,status:"DRAFT",position:(mod.lessons||[]).length});
      existing.add(title.toLowerCase());imported++;logs.push("Uploaded draft: "+title);
     }catch(e:any){failed++;logs.push("FAILED: "+title+" — "+e.message)}
     completed++;setProgress(Math.round(completed/total*100));
    }
   }
   setReport(logs);const summary="Import finished: "+imported+" draft PDFs uploaded, "+skipped+" duplicates skipped, "+failed+" failures. Review all drafts before publishing.";setStatus(summary);onNotice(summary);onDone();
  }catch(e:any){setStatus("Import stopped: "+e.message);setReport(logs);onNotice("Import stopped: "+e.message)}
  finally{setBusy(false)}
 }
 return <div className="panel"><div className="panel-head"><h3>Bulk import curated course ZIP</h3><span>PDF ONLY · DRAFT MODE</span></div><p className="muted">Choose the curated Course1-0 ZIP. The importer creates course modules, sets credit costs based on module size and level (minimum 20), uploads PDFs to private course storage and creates draft lessons. Existing monthly prices are preserved; new Linux and ACCA courses start at $3 and $5 per month respectively. You can edit every course price in the panel below.</p><label className="upload-zone"><span>＋ Select curated ZIP archive</span><small>ZIP archive up to 500 MB. Only PDFs in course/module folders are imported.</small><input type="file" accept=".zip,application/zip" disabled={busy} onChange={e=>setFile(e.target.files?.[0]||null)}/></label>{file&&<div className="file-preview"><b>{file.name}</b><small>{(file.size/1024/1024).toFixed(1)} MB</small></div>}{busy&&<div className="upload-progress"><div style={{width:progress+"%"}}/><span>{progress}% processed</span></div>}<button className="primary" disabled={!file||busy} onClick={run}>{busy?"Importing materials…":"Import PDFs as draft lessons"}</button>{status&&<p className="muted">{status}</p>}{report.length>0&&<details><summary>Import log ({report.length} entries)</summary><div style={{maxHeight:220,overflow:"auto",fontSize:12}}>{report.map((x,i)=><p key={i}>{x}</p>)}</div></details>}<div style={{marginTop:22}}><div className="panel-head"><h3>Monthly course prices</h3><span>USD $1–$10 / MONTH</span></div>{courses.map(c=><div className="data-row" key={c.id}><div><b>{c.title}</b><small>Current price: ${Number(c.price).toFixed(2)} per month</small></div><input aria-label={"Monthly price for "+c.title} type="number" min="1" max="10" step="0.5" style={{width:100}} value={prices[c.id]??String(c.price)} onChange={e=>setPrices(v=>({...v,[c.id]:e.target.value}))}/><button type="button" onClick={()=>saveCoursePrice(c)}>Save price</button></div>)}</div></div>
}
