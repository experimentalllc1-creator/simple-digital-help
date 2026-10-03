"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GeographicRegion } from "@/lib/geographic-regions";
import styles from "./region-info.module.css";

export default function RegionInfo({ region }: { region: GeographicRegion }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top?: number; bottom?: number } | null>(null);

  useEffect(() => {
    if (!position) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) setPosition(null);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setPosition(null); trigger.current?.focus(); }
    }
    function close() { setPosition(null); }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [position]);

  function toggle() {
    if (position) { setPosition(null); return; }
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(260, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
    setPosition(window.innerHeight - rect.bottom >= 240
      ? { left, top: rect.bottom + 8 }
      : { left, bottom: window.innerHeight - rect.top + 8 });
  }

  return <>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`View states included in ${region.name}`} aria-expanded={!!position} aria-controls={position ? id : undefined} onClick={toggle}>?</button>
    {position && createPortal(<div ref={panel} id={id} role="region" aria-label={`States included in ${region.name}`} className={styles.panel} style={position}>
      <strong>{region.name} includes:</strong><p>{region.states.map((state) => `${state.name} (${state.code})`).join(", ")}</p>
    </div>, document.body)}
  </>;
}
