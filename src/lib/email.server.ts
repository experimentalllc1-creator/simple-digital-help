import "server-only";
import { env } from "node:process";

export const SUPPORT_EMAIL = "support@simpledigitalhelp.com";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  // Reuse for retries of the same logical email; use a new value for a new email.
  idempotencyKey: string;
  attachments?: { filename: string; content: string }[];
};

export class EmailSendError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "EmailSendError";
  }
}

/** Server-side only. No automatic retries, credential logging, or public endpoint. */
export async function sendEmail(message: EmailMessage): Promise<{ id: string }> {
  if (typeof window !== "undefined") {
    throw new EmailSendError("Email sending is only available on the server.");
  }
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new EmailSendError("RESEND_API_KEY is not configured.");
  if (!message.to.trim() || !message.subject.trim() || !message.text.trim()) {
    throw new EmailSendError("Recipient, subject and email text are required.");
  }
  if (!/^[A-Za-z0-9_./:-]{1,256}$/.test(message.idempotencyKey)) {
    throw new EmailSendError("A valid idempotency key is required.");
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: SUPPORT_EMAIL,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.attachments ? { attachments: message.attachments } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
      redirect: "error",
    });
  } catch {
    // Do not attach request headers or the underlying exception to the error.
    throw new EmailSendError("Resend request failed or timed out; acceptance is unknown. Reuse the same idempotency key if retrying.");
  }

  if (!response.ok) {
    // Never expose raw provider responses, which could contain sensitive input.
    throw new EmailSendError(`Resend rejected the email (HTTP ${response.status}).`, response.status);
  }
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new EmailSendError("Resend returned an unreadable confirmation; acceptance is unknown.");
  }
  if (!result || typeof result !== "object" || !("id" in result) ||
      typeof result.id !== "string" || !/^[0-9a-f-]{36}$/i.test(result.id)) {
    throw new EmailSendError("Resend returned no valid message ID; acceptance is unknown.");
  }
  return { id: result.id };
}
