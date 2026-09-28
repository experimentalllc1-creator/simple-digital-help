"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { discoveryIndustries, discoveryRegions, discoveryVideo, discoveryProductPath, discoveryProductTitle, findDiscoveryProducts } from "@/lib/sales-catalog";
import styles from "./sales-growth.module.css";

export default function FindNewCustomers() {
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [industry, setIndustry] = useState<string>(discoveryIndustries[0]);
  const [region, setRegion] = useState<string>(discoveryRegions[0]);
  const heading = useRef<HTMLHeadingElement>(null);
  const matches = findDiscoveryProducts(industry, region);

  useEffect(() => {
    try {
      setCompleted(localStorage.getItem(discoveryVideo.completionKey) === "true");
    } catch {
      // Playback still unlocks this visit when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (revealed) heading.current?.focus();
  }, [revealed]);

  function finishVideo() {
    setCompleted(true);
    try {
      localStorage.setItem(discoveryVideo.completionKey, "true");
    } catch {
      // Do not block this visit if persistence is unavailable.
    }
  }

  return (
    <div className={styles.videoSection}>
      <video className={styles.video} controls playsInline preload="metadata" poster={discoveryVideo.poster} onEnded={finishVideo} onError={() => setVideoError(true)} aria-label="Find New Customers introduction">
        <source src={discoveryVideo.src} type="video/mp4" />
        <track kind="captions" src={discoveryVideo.captions} srcLang="en" label="English" />
        Your browser does not support this video. Please try a current browser.
      </video>
      <button className={`button button-dark ${styles.continue}`} disabled={!completed} aria-expanded={revealed} aria-controls="discovery-selection" onClick={() => setRevealed(true)}>
        I Want to Know More <ArrowRight size={17} aria-hidden="true" />
      </button>
      <p className={styles.videoNote} role="status">
        {videoError ? "The video could not load. Please reload the page to try again." : completed ? "You're ready. Choose your industry and region below." : "Watch the short introduction to continue. Playback is up to you."}
      </p>
      <details className={styles.transcript}>
        <summary>Temporary introduction · Read the video text</summary>
        <p>Find businesses that could become your customers.</p>
        <p>Milo helps you discover potential customers in the industries and geographic markets you want to reach.</p>
        <p>{discoveryVideo.closing}</p>
      </details>
      <section id="discovery-selection" className={styles.selector} hidden={!revealed} aria-labelledby="discovery-selection-heading">
        <h2 id="discovery-selection-heading" ref={heading} tabIndex={-1}>Select your industry and region of interest.</h2>
        <div className={styles.fields}>
          <label>Industry<select aria-label="Industry" value={industry} onChange={(event) => setIndustry(event.target.value)}>{discoveryIndustries.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Region<select aria-label="Region" value={region} onChange={(event) => setRegion(event.target.value)}>{discoveryRegions.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className={styles.result} aria-live="polite" aria-atomic="true">
          {matches.length ? matches.map((product) => (
            <div key={product.slug}>
              <h3>{discoveryProductTitle(product)}</h3>
              <Link className="button button-dark" href={discoveryProductPath(product)}>View Product <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          )) : <p>No product available for this selection yet.</p>}
        </div>
      </section>
    </div>
  );
}
