"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { opportunityDiscovery } from "@/lib/sales-catalog";
import styles from "./sales-growth.module.css";

export default function FindNewOpportunities() {
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [region, setRegion] = useState<string>(opportunityDiscovery.regions[0]);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      setCompleted(localStorage.getItem(opportunityDiscovery.completionKey) === "true");
    } catch {
      // Completion still unlocks this visit when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (revealed) heading.current?.focus();
  }, [revealed]);

  function finishIntroduction() {
    setCompleted(true);
    try {
      localStorage.setItem(opportunityDiscovery.completionKey, "true");
    } catch {
      // Do not block this visit if persistence is unavailable.
    }
  }

  return (
    <div className={styles.videoSection}>
      {/* Replace this placeholder with a video whose onEnded calls finishIntroduction. */}
      <div className={styles.placeholder} aria-label="Find New Opportunities video placeholder">
        <p>Video introduction coming soon.</p>
        <p>Discover {opportunityDiscovery.type.toLowerCase()} that may create new sales opportunities in your region of interest.</p>
        <button className="button button-dark" onClick={finishIntroduction} disabled={completed}>
          {completed ? "Introduction completed" : "I've read the introduction"}
        </button>
      </div>
      <button className={`button button-dark ${styles.continue}`} disabled={!completed} aria-expanded={revealed} aria-controls="opportunity-selection" onClick={() => setRevealed(true)}>
        I Want to Know More <ArrowRight size={17} aria-hidden="true" />
      </button>
      <p className={styles.videoNote} role="status">
        {completed ? "You're ready. Choose your region below." : "Read the placeholder introduction to continue."}
      </p>
      <section id="opportunity-selection" className={styles.selector} hidden={!revealed} aria-labelledby="opportunity-selection-heading">
        <h2 id="opportunity-selection-heading" ref={heading} tabIndex={-1}>Select your region of interest.</h2>
        <p>{opportunityDiscovery.type}</p>
        <div className={styles.fields}>
          <label>Region<select aria-label="Region" value={region} onChange={(event) => setRegion(event.target.value)}>{opportunityDiscovery.regions.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className={styles.result} aria-live="polite" aria-atomic="true">
          <p>No product available for this selection yet.</p>
        </div>
      </section>
    </div>
  );
}