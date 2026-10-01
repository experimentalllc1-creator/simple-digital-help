import type { Metadata } from "next";
import { MarketingAgentPage } from "@/components/marketing-pages";
export const metadata: Metadata = { title: "Analyze & Improve" };
export default function Page() { return <MarketingAgentPage group="analyze-improve" />; }