import "server-only";
import { appOrigin } from "./milo-config.server";
export function accountSameOrigin(request: Request) {
 const origin=request.headers.get("origin");
 // Referrer-Policy:no-referrer can make native POST navigations send Origin:null.
 // Fetch Metadata still distinguishes an exact same-origin browser submission.
 return origin===appOrigin() || (origin==="null" && request.headers.get("sec-fetch-site")==="same-origin" && request.headers.get("host")===new URL(appOrigin()).host);
}
