import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import type { EmailMessage } from "./email.server";

// Approved bytes, not user-selected paths or remote URLs. Never serve these files.
export const MILO_FILES = [
  { filename: "Milo_FL_Roofing_Installation_Prompt_v1.2.txt", sha256: "6cf70821a8ac26f64069e7b0febd375152a39e7a216786b3aec192cd75ebe675" },
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
    subject: "Your Milo files and installation instructions",
    idempotencyKey: `milo-v1.2/${sessionId}`,
    text: [
      "Thank you for purchasing Milo - Florida Roofing Prospect Discovery ($99 one-time).",
      "Your Milo installation files are attached.",
      [
        "1. Download Milo_FL_Roofing_Installation_Prompt_v1.2.txt and upload it to ChatGPT. Tell ChatGPT: “Install Milo using the attached file.”",
        "2. Use the Milo Illustrated Installation Guide if you need help during setup.",
        "3. Installation video: https://youtu.be/C52gIS4fVNc",
      ].join("\n"),
      "Video note: The video shows an earlier installation with Email and Phone columns. The current Milo uses Date Added, Business Name, City, Website, and Contacted? only.",
      "Once installed, Milo will create your prospect spreadsheet and guide you through connecting your Google account and activating recurring prospect discovery.",
      "Need help? Reply to support@simpledigitalhelp.com.",
    ].join("\n\n"),
    attachments: (await miloAttachments()).filter(({ filename }) => filename !== "Milo_Video_Disclaimer_v1.2.txt"),
  };
}
