import Link from "next/link";
import { CustomerLogin } from "@/components/customer-login";
import { accountsEnabled } from "@/lib/customer-accounts.server";
import styles from "../account.module.css";
export const metadata={title:"Your Simple Digital Help account",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;
 return <div className={styles.shell}><div className={styles.login}><p className={styles.eyebrow}>Your digital team, together</p><h1>Welcome to your Milo account</h1><p>Sign in or create a free account with your purchase email. Your Milos, installation materials, and purchase history will be waiting here.</p>{params.error&&<p role="alert" className={styles.notice}>That link is invalid, expired, or already used. Request a fresh link below.</p>}{accountsEnabled()?<CustomerLogin/>:<p>Customer accounts are being prepared. Your purchased materials continue to arrive by email. For assistance, contact <a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a>.</p>}<p className={styles.muted}>No password to remember. Use the same email on future purchases to keep your team together. Marketing emails are always optional.</p><Link href="/categories/sales">Continue shopping</Link></div></div>;
}
