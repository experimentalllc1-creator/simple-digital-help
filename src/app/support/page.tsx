import { PublicSupportForm } from "@/components/public-support-form";
import { EmailGuidance } from "@/components/email-guidance";
import styles from "./support.module.css";
export const metadata={title:"Contact & Support"};
export default function Support(){return <div className={styles.page}><h1>Contact &amp; Support</h1><p className={styles.introduction}>Have a question or need assistance? Send us a message and we'll get back to you by email.</p><p><a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a></p><div className={styles.card}><PublicSupportForm/><EmailGuidance/></div></div>;}
