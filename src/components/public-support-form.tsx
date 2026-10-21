"use client";
import { useRef, useState } from "react";
import styles from "@/app/support/support.module.css";

export function PublicSupportForm(){
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[notice,setNotice]=useState("");
 const sending=useRef(false),submission=useRef<{id:string;payload:string}|null>(null);
 return <form className={styles.form} onSubmit={async e=>{
  e.preventDefault();if(sending.current||sent)return;sending.current=true;setBusy(true);setNotice("");
  try{
   const body={name:name.trim(),email:email.trim().toLowerCase(),message:message.trim()},payload=JSON.stringify(body);
   if(submission.current?.payload!==payload)submission.current={id:crypto.randomUUID(),payload};
   const response=await fetch("/api/support",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,requestId:submission.current.id}),signal:AbortSignal.timeout(30000)});
   const result=await response.json();
   if(response.ok){setSent(true);setNotice("Your message has been sent. We'll get back to you by email.");}
   else setNotice(typeof result.message==="string"?result.message:"We couldn't send your message. Please try again; your message is still here.");
  }catch{setNotice("We couldn't confirm delivery. Your message is still here. Try Send Message again to safely retry, or email support@simpledigitalhelp.com.");}
  finally{sending.current=false;setBusy(false);}
 }}>
 <fieldset disabled={busy||sent}>
 <label htmlFor="support-name">Name</label><input id="support-name" name="name" autoComplete="name" required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/>
 <label htmlFor="support-email">Email address</label><input id="support-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/>
 <label htmlFor="support-message">Message</label><textarea id="support-message" name="message" rows={7} required maxLength={4000} value={message} onChange={e=>setMessage(e.target.value)}/>
 <button className="button button-dark" type="submit">{busy?"Sending…":"Send Message"}</button>
 </fieldset>
 <p className={sent?styles.success:styles.status} role={sent?"status":"alert"} aria-live="polite">{notice}</p>
 <noscript>Please enable JavaScript to use this form, or email support@simpledigitalhelp.com.</noscript>
 </form>;
}
