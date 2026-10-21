import { EmailGuidance } from "@/components/email-guidance";
import { CustomerInvitation } from "@/components/customer-invitation";
import { accountsEnabled } from "@/lib/customer-accounts.server";
export default function SuccessLayout({children}:{children:React.ReactNode}){return <>{children}<div className="page-width"><EmailGuidance/></div>{accountsEnabled()&&<div className="page-width" style={{paddingBottom:64}}><CustomerInvitation/></div>}</>;}
