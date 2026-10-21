"use client";
import { useRef, useState, type ReactNode } from "react";
export function CustomerSupportForm({children}:{children:ReactNode}){
 const submitted=useRef(false),[busy,setBusy]=useState(false);
 return <form action="/api/account/support" method="post" target="_blank" rel="noopener noreferrer" onSubmit={e=>{if(submitted.current){e.preventDefault();return;}submitted.current=true;setBusy(true);}}>
 {children}<button className="button button-dark" disabled={busy}>{busy?"Request submitted":"Request help"}</button>
 <p role="status" aria-live="polite">{busy?"Your support response opens in a new tab. Check that tab for confirmation. Reload this dashboard to start another request.":"Your confirmation will open in a new tab, keeping My Milos here."}</p></form>;
}
