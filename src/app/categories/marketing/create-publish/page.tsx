import type { Metadata } from "next";
import { MarketingAgentPage } from "@/components/marketing-pages";
export const metadata: Metadata = { title: "Create & Publish" };
export default function Page() { return <MarketingAgentPage group="create-publish" />; }