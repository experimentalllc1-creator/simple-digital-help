"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
const examples = {
  Warm: "Hi Alex,\n\nThanks so much for getting in touch! We’d love to help you find the right fit. Could you tell us a little about what you have in mind?\n\nOnce we know a bit more, we can walk you through the next steps. Looking forward to hearing from you!",
  Concise:
    "Hi Alex,\n\nThanks for your interest. Tell us a little about what you need, and we’ll share the relevant options and next steps.\n\nHappy to help!",
  Formal:
    "Hello Alex,\n\nThank you for your inquiry. We would be pleased to provide further information. Please share a brief description of your requirements so we can recommend the appropriate next steps.\n\nWe look forward to assisting you.",
};
export default function ProductDemo() {
  const [tone, setTone] = useState<keyof typeof examples>("Warm");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(examples[tone]);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="demo-panel">
      <div className="demo-input">
        <p className="eyebrow">01 / THE CUSTOMER’S MESSAGE</p>
        <h3>A familiar place to start.</h3>
        <blockquote>
          “Hi! I’d love to know a little more about your services. Could you
          help me with the next steps?”
        </blockquote>
        <p>
          A fictional inquiry for this demonstration.
          <br />
          No customer data is used.
        </p>
      </div>
      <div className="demo-output">
        <p className="eyebrow">02 / A REPLY, IN YOUR VOICE</p>
        <div
          className="demo-tone-tabs"
          role="group"
          aria-label="Example reply tone"
        >
          {(Object.keys(examples) as (keyof typeof examples)[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                setCopied(false);
                setCopyError(false);
              }}
              aria-pressed={tone === t}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="demo-reply" aria-live="polite">
          {examples[tone]}
        </p>
        <div className="demo-output-bottom">
          <span>
            {copyError
              ? "Select the reply text to copy it."
              : "Prewritten sample · Always review before sending"}
          </span>
          <button onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy example"}
          </button>
        </div>
      </div>
    </div>
  );
}
