"use client";
import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
const auth=createAuthClient({plugins:[magicLinkClient()]});
export function CustomerLogin({initialEmail=""}:{initialEmail?:string}){
 const [email,setEmail]=useState(initialEmail),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{if(initialEmail)setEmail(current=>current||initialEmail);},[initialEmail]);
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage("");try{const {error}=await auth.signIn.magicLink({email:email.trim().toLowerCase(),callbackURL:"/account",newUserCallbackURL:"/account",errorCallbackURL:"/account/login?error=link"});setMessage(error?"We couldn’t send your link. Please try again shortly.":"Check your inbox for your private sign-in link. It expires in 10 minutes. You can close this page.");}catch{setMessage("Sign-in is temporarily unavailable. Please try again shortly.");}finally{setBusy(false);}}}>
 <label htmlFor="account-email">Your email address</label><input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} />
 <button className="button" disabled={busy}>{busy?"Sending your link…":"Email me a secure sign-in link"}</button><p role="status" aria-live="polite">{message}</p>
 </form>;
}
export function CustomerLogout(){const [busy,setBusy]=useState(false);return <button className="button button-secondary" disabled={busy} onClick={async()=>{setBusy(true);try{const {error}=await auth.signOut();if(!error)window.location.assign("/account/login");}finally{setBusy(false);}}}>Sign out</button>;}
