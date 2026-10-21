import { EmailGuidance } from "@/components/email-guidance";
import { requireAccount } from "@/lib/customer-dashboard.server";
import styles from "../account.module.css";
export const dynamic="force-dynamic";
export default async function Sent(){await requireAccount();return <div className={styles.shell}><h1>Your support request is on its way</h1><p>Our team has your purchased Milo and package details. We’ll reply to your account email.</p><EmailGuidance/><a className="button" href="/account">Back to My Milos</a></div>;}
