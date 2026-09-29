import { handleCheckout } from "@/lib/milo-http.server";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) { return handleCheckout(request); }
