import { handleStorefront } from "@/lib/milo-storefront-http.server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) { return handleStorefront(request); }
export async function POST(request: Request) { return handleStorefront(request); }
