import Link from "next/link";

// Only the Markdown constructs used by the copied source documents are needed.
// Render text through React, never as raw HTML.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && (link[2].startsWith("/legal/") || link[2].startsWith("mailto:"))) {
      return <Link key={i} href={link[2]}>{link[1]}</Link>;
    }
    return part;
  });
}

export default function LegalDocument({ text }: { text: string }) {
  return text.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/).map((block, i) => {
    if (block.startsWith("### ")) return <h3 key={i}>{inline(block.slice(4))}</h3>;
    if (block.startsWith("## ")) return <h2 key={i}>{inline(block.slice(3))}</h2>;
    if (block.startsWith("# ")) return <h1 key={i}>{inline(block.slice(2))}</h1>;
    if (block.split("\n").every(line => line.startsWith("- "))) {
      return <ul key={i}>{block.split("\n").map((line, j) => <li key={j}>{inline(line.slice(2))}</li>)}</ul>;
    }
    return <p key={i}>{inline(block)}</p>;
  });
}
