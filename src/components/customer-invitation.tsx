"use client";
import { useEffect, useState } from "react";
import { CustomerLogin } from "./customer-login";
import styles from "@/app/account/account.module.css";
export function CustomerInvitation(){
 const [email,setEmail]=useState(""),[start,setStart]=useState(false),[declined,setDeclined]=useState(false);
 useEffect(()=>{const id=new URL(window.location.href).searchParams.get("session_id");if(!id)return;const controller=new AbortController();fetch(`/api/account/invitation?session_id=${encodeURIComponent(id)}`,{cache:"no-store",signal:controller.signal}).then(r=>r.ok?r.json():null).then(data=>{if(data?.email)setEmail(data.email);}).catch(()=>{});return()=>controller.abort();},[]);
 if(declined)return <aside className={styles.invitation}><h2>Your delivery is on its way</h2><p>Everything you purchased will be sent to your checkout email. You can create a free account whenever you’re ready.</p><a href="/categories/sales">Explore more Milos</a></aside>;
 return <aside className={styles.invitation} aria-labelledby="account-invite"><p className={styles.eyebrow}>A home for your digital team</p><h2 id="account-invite">Create your free Simple Digital Help account</h2><p>Keep all your digital workers in one place and enjoy a more personalized Simple Digital Help experience.</p>
 <ul><li>Access all purchased Milos and installation materials whenever you need them.</li><li>Get support tailored to the exact Milos and versions you purchased.</li><li>Keep a permanent record of purchases and receipts.</li><li>Discover complementary digital workers for your business.</li><li>Access future improvements, customer benefits, and relevant offers when available.</li></ul>
 {start?<CustomerLogin initialEmail={email}/>:<button className="button" onClick={()=>setStart(true)}>Create my free account</button>}
 <button className={styles.quietButton} onClick={()=>setDeclined(true)}>Continue without an account</button><p className={styles.muted}>Your purchase and delivery are yours either way. Promotional emails are optional.</p></aside>;
}
