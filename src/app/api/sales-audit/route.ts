import { handleAudit } from "@/lib/sales-audit-http.server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) { return handleAudit(request); }
export async function POST(request: Request) { return handleAudit(request); }
