import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import type { EmailMessage } from "./email.server";

// Approved bytes, not user-selected paths or remote URLs. Never serve these files.
export const MILO_FILES = [
  { filename: "Milo_FL_Roofing_Installation_Prompt_v1.2.txt", sha256: "b34a107f3913baf5d9fc8e586ad96649a24cc63d11b2e790506cee91b092bcc8" },
  { filename: "Milo_Illustrated_Installation_Guide_v1.2.pdf", sha256: "79cf1bef53c35b949d664b1a7e17c1da6ffda5bed388e6bc049afc397fbe2a79" },
  { filename: "Milo_Video_Disclaimer_v1.2.txt", sha256: "7d69da1687af7596055f4185c3f09c9dc3725ce129bb0cbbc27834c204214a0e" },
] as const;

export async function miloAttachments(): Promise<NonNullable<EmailMessage["attachments"]>> {
  return Promise.all(MILO_FILES.map(async ({ filename, sha256 }) => {
    const content = await readFile(path.join(process.cwd(), "docs", "Products", "MILO", filename));
    if (createHash("sha256").update(content).digest("hex") !== sha256) {
      throw new Error("Milo delivery asset does not match approved v1.2 release");
    }
    return { filename, content: content.toString("base64") };
  }));
}

export async function miloEmail(to: string, sessionId: string): Promise<EmailMessage> {
  return {
    to,
    subject: "Your Milo v1.2 files and installation instructions",
    idempotencyKey: `milo-v1.2/${sessionId}`,
    text: [
      "Thank you for purchasing Milo — Florida Roofing Prospect Discovery ($99 one-time).",
      "Your three approved Milo v1.2 files are attached to this email. Save all three files.",
      "Start with Milo_Illustrated_Installation_Guide_v1.2.pdf, then follow the instructions in Milo_FL_Roofing_Installation_Prompt_v1.2.txt to install Milo in ChatGPT and connect your Google account.",
      "Installation video: https://youtu.be/C52gIS4fVNc",
      "Video notice: The video shows an earlier installation with Email and Phone columns. Milo v1.2 uses Date Added, Business Name, City, Website, and Contacted? only. It does not research, collect, or populate email addresses or phone numbers. Follow the attached v1.2 prompt for the current installation and read Milo_Video_Disclaimer_v1.2.txt.",
      "Complete the first run and follow the installation guide to enable recurring discovery when you are ready.",
      "Need help? Reply to support@simpledigitalhelp.com.",
    ].join("\n\n"),
    attachments: await miloAttachments(),
  };
}
