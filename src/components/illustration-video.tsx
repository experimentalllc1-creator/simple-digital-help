"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./illustration-video.module.css";

/** Keeps the supplied artwork unchanged and loads media only after activation. */
export default function IllustrationVideo({ src, title, children }: {
  src: string;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [error, setError] = useState(false);

  function stop() {
    const player = video.current;
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
  }

  function close() {
    stop();
    dialog.current?.close();
  }

  useEffect(() => {
    const player = video.current;
    return () => {
      player?.pause();
      player?.removeAttribute("src");
      player?.load();
    };
  }, []);

  function open() {
    const player = video.current;
    if (!player) return;
    setError(false);
    dialog.current?.showModal();
    player.src = src;
    player.muted = false;
    // Call play in the click handler to retain the browser's user activation.
    void player.play().catch(() => {
      // Native controls remain available when autoplay permission is denied.
    });
  }

  return <>
    <button ref={trigger} type="button" className={styles.trigger}
      aria-label={`Play ${title}`} aria-haspopup="dialog" onClick={open}>
      {children}
    </button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClose={() => { stop(); trigger.current?.focus({ preventScroll: true }); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }}>
      <div className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" autoFocus className={styles.close} onClick={close}
          aria-label="Close video">Close <span aria-hidden="true">×</span></button>
      </div>
      <video ref={video} className={styles.video} controls playsInline preload="none"
        aria-label={title} onError={() => setError(true)} />
      {error && <p role="alert" className={styles.error}>The video could not be loaded. Please close it and try again.</p>}
    </dialog>
  </>;
}
