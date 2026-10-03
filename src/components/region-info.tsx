import type { GeographicRegion } from "@/lib/geographic-regions";
import styles from "./region-info.module.css";

export default function RegionInfo({ region }: { region: GeographicRegion }) {
  return <details className={styles.info}>
    <summary aria-label={`View states included in ${region.name}`}>?</summary>
    <div className={styles.panel}><strong>{region.name} includes:</strong><p>{region.states.map((state) => `${state.name} (${state.code})`).join(", ")}</p></div>
  </details>;
}
