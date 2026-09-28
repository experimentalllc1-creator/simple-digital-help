"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useRef } from "react";

export default function MobileNav() {
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };
  return (
    <details className="mobile-menu" ref={menu} onKeyDown={event => {
      if (event.key === "Escape") {
        close();
        menu.current?.querySelector("summary")?.focus();
      }
    }}>
      <summary aria-label="Open navigation"><Menu size={24} /></summary>
      <nav aria-label="Mobile navigation" onClick={close}>
        <Link href="/store">Shop all</Link>
        <Link href="/#categories">Categories</Link>
        <Link href="/#collections">The collections</Link>
      </nav>
    </details>
  );
}
