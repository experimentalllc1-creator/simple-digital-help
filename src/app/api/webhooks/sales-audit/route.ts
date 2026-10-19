import { handleAuditWebhook } from "@/lib/sales-audit-http.server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) { return handleAuditWebhook(request); }
