"use client";
import { regionsForProduct, regionBoundaryExplanation, type RegionId } from "@/lib/geographic-regions";
import RegionInfo from "./region-info";
import styles from "./regional-assignment-selector.module.css";

type Props = {
  product: { id: string; regionBased: boolean; activeRegions: RegionId[] };
  selectedKeys: string[];
  onToggle: (key: string) => void;
  priceCents: number;
};
export default function RegionalAssignmentSelector({ product, selectedKeys, onToggle, priceCents }: Props) {
  if (!product.regionBased) return null;
  return <fieldset className={styles.regions}>
    <legend>Select regions</legend><p className={styles.explanation}>{regionBoundaryExplanation}</p>
    {regionsForProduct(product).map((region) => {
      const active = product.activeRegions.includes(region.id);
      const key = `${product.id}:${region.id}`;
      return <div className={styles.row} key={region.id}>
        <label className={!active ? styles.disabled : undefined}>
          <input type="checkbox" checked={selectedKeys.includes(key)} disabled={!active} onChange={() => onToggle(key)} />
          <span>{region.name}{!active && <small>Coming soon</small>}</span>
        </label>
        <strong className={styles.price}>${priceCents / 100}</strong><RegionInfo region={region} />
      </div>;
    })}
  </fieldset>;
}
