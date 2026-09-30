"use client";

import { usePathname } from "next/navigation";

export default function PreviewStrip() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="preview-strip">
      A store full of possibilities.{" "}
      <span>Design preview — all products and prices are illustrative.</span>
    </div>
  );
}
