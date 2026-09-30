import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import LegalDocument from "../document";
import styles from "../legal.module.css";

const documents = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  disclaimers: "Disclaimers",
} as const;

type Props = { params: Promise<{ document: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(documents).map(document => ({ document }));
}

function documentKey(value: string): keyof typeof documents {
  if (!Object.hasOwn(documents, value)) notFound();
  return value as keyof typeof documents;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: documents[documentKey((await params).document)] };
}

export default async function LegalDocumentPage({ params }: Props) {
  const document = documentKey((await params).document);
  const text = await readFile(path.join(process.cwd(), "src", "app", "legal", "content", `${document}.md`), "utf8");

  return (
    <section className={`page-width ${styles.page}`}>
      <Link className={styles.back} href="/legal">Back to Legal</Link>
      <p className={styles.notice}>
        Temporary source material. This document has not yet been revised for the Simple Digital Help Agent Store.
      </p>
      <article className={styles.document}><LegalDocument text={text} /></article>
    </section>
  );
}
