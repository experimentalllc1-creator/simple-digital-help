"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MiloPresentation } from "@/lib/milo-presentations";
import styles from "./milo-product.module.css";

export default function MiloDemo({ demo }: { demo: NonNullable<MiloPresentation["demo"]> }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // A failed media request can finish before hydration attaches onError.
    if (video.current?.error) {
      setFailed(true);
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updateMotion() {
      if (preference.matches) video.current?.pause();
      else video.current?.play().catch(() => {
        // The poster remains visible if the browser blocks automatic playback.
      });
    }
    updateMotion();
    preference.addEventListener("change", updateMotion);
    return () => preference.removeEventListener("change", updateMotion);
  }, []);

  return (
    <figure className={styles.demo}>
      <div className={styles.media}>
        <Image className={styles.poster} src={demo.poster} alt={demo.caption} fill sizes="(max-width: 800px) 100vw, 1100px" unoptimized />
        {!failed && <video ref={video} className={styles.video} src={demo.src} poster={demo.poster} autoPlay muted loop playsInline preload="metadata" onError={() => setFailed(true)} aria-label={demo.caption} />}
      </div>
      <figcaption>{demo.caption}</figcaption>
    </figure>
  );
}
