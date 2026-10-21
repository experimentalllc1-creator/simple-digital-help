import Link from "next/link";
export default function MiloBeforeYouBuy({ industry, region, schedule }: { industry: string; region: string; schedule: string }) { return <section aria-labelledby="before-you-buy" style={{margin:"32px 0",lineHeight:1.7}}><h2 id="before-you-buy">Before you buy</h2>
<p>Milo is a preconfigured, AI-powered digital worker. It runs in your own compatible ChatGPT account and saves its findings to your own Google account.</p>
<p>Your one-time purchase provides a 52-week license, beginning upon successful activation. There is no automatic renewal.</p>
<p>For {industry} in {region}: {schedule}</p>
<p>The number and accuracy of results are not guaranteed. Milo does not contact prospects, and it does not guarantee sales, customers or revenue.</p>
<p>ChatGPT and Google requirements. Milo runs in your own ChatGPT account and uses your connected Google account. You need a compatible ChatGPT plan with scheduled tasks, web research and supported Google Drive and Sheets actions. Some features or scheduling options may require a paid plan. ChatGPT and Google accounts are not included in the Milo purchase price. Please check that your account is compatible before you buy, and contact us if you need help confirming it.</p>
<p>See our <Link href="/legal/terms">Terms of Service</Link>, <Link href="/legal/privacy">Privacy Policy</Link>, and <Link href="/legal/disclaimers">Product &amp; AI Disclaimers</Link> for more information.</p></section>; }
