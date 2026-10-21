import { handlePublicSupport } from "@/lib/public-support.server";
export async function POST(request:Request){return handlePublicSupport(request);}
