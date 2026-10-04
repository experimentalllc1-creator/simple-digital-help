import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import type { EmailMessage } from "./email.server";
import { appOrigin, MILO_VIDEO_PAGE } from "./milo-config.server";

export const MILO_FILES = [
  {
    "filename": "Milo_FL_Roofing_Installation_Prompt_v2.2.txt",
    "sha256": "fe3112154b316dac798d9ab5b0a4e34afd4a0e8022b07d6b708ba342773f5419"
  },
  {
    "filename": "Milo_Illustrated_Installation_Guide_v2.2.pdf",
    "sha256": "2e3ac03fb0911f1c1ec18fedbf0eec1c783be12251ed16940a72a9aefa566b8c"
  }
] as const;
export async function miloAttachments(): Promise<NonNullable<EmailMessage["attachments"]>> {
  return Promise.all(MILO_FILES.map(async ({ filename, sha256 }) => {
    const content = await readFile(path.join(process.cwd(), "docs", "Products", "MILO", filename));
    if (createHash("sha256").update(content).digest("hex") !== sha256) throw new Error("Milo asset does not match approved v2.2 release");
    return { filename, content: content.toString("base64") };
  }));
}
export async function miloEmail(to: string, sessionId: string): Promise<EmailMessage> {
  return {
    to, subject: "Your Milo files and installation instructions",
    idempotencyKey: `milo-v2.2/${sessionId}`,
    text: [
      "Thank you for purchasing Milo — Florida Roofing Prospect Discovery.",
      "Your purchase includes 52 weeks of service from successful activation.",
      "Start with the attached Milo v2.2 Illustrated Installation Guide. The attached installation TXT file is the file you will upload to ChatGPT.",
      "1. Save the attached Milo installation TXT file somewhere easy to find.\n2. Open a new ChatGPT conversation.\n3. Upload the TXT file.\n4. Type: Install Milo using the attached file.\n5. Follow the illustrated guide for Google connection, permissions, scheduling, and the first run.",
      `Watch the Milo Installation Video: ${appOrigin()}${MILO_VIDEO_PAGE}`,
      "Need help? Reply to support@simpledigitalhelp.com.",
    ].join("\n\n"),
    attachments: await miloAttachments(),
  };
}
