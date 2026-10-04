import type { Metadata } from "next";
export const metadata: Metadata = { title: "Milo Installation Video", robots: { index: false, follow: false } };
export default function MiloInstallationVideo() {
  return <div className="page-width" style={{ paddingBlock: 64, maxWidth: 960 }}>
    <h1>Milo Installation Video</h1>
    <p>Follow this video together with your Milo v2.2 Illustrated Installation Guide.</p>
    <video controls controlsList="nodownload" preload="metadata" playsInline style={{ width: "100%", marginBlock: 24 }} aria-label="Milo v2.2 installation video">
      <source src="/videos/milo-installation-v2-2.mp4" type="video/mp4" />
      Your browser does not support video playback. Contact support for help.
    </video>
    <p>Need help? Contact <a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a>.</p>
  </div>;
}
