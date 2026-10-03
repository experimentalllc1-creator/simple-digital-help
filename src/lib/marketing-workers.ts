export type MarketingCommercialModel = "standard" | "assisted" | "one-time";
export const marketingCommercialModels = {
  standard: { title: "Standard Marketing Agents", priceCents: 9900, termWeeks: 52, termLabel: "52 weeks of work", badge: "DIY", includesAssistedSetup: false, description: "" },
  assisted: { title: "Assisted Marketing Agents", priceCents: 39900, termWeeks: 52, termLabel: "52 weeks of work", badge: "Assisted", includesAssistedSetup: true, description: "These agents connect directly to external platforms or customer accounts. The $399 price includes assisted setup and 52 weeks of service." },
  "one-time": { title: "One-Time Marketing Services", priceCents: 9900, termWeeks: null, termLabel: "One service", badge: "One-time", includesAssistedSetup: false, description: "" },
} as const;
export type MarketingWorker = { id: string; name: string; description: string; model: MarketingCommercialModel; availability: "coming-soon" | "available" };
export const marketingWorkers: MarketingWorker[] = [
  { id: "content-ideas", name: "Content Ideas Agent", model: "standard", availability: "coming-soon", description: "Generates practical content ideas based on the customer’s business, audience, services, and marketing goals." },
  { id: "creative", name: "Creative Agent", model: "standard", availability: "coming-soon", description: "Creates marketing copy and creative concepts for social posts, promotions, campaigns, and other business communications." },
  { id: "organic-performance", name: "Organic Performance Agent", model: "standard", availability: "coming-soon", description: "Reviews organic marketing performance and identifies what is working, what is underperforming, and where improvements can be made." },
  { id: "paid-campaign", name: "Paid Campaign Analyst", model: "standard", availability: "coming-soon", description: "Reviews paid advertising performance and provides clear recommendations based on campaign results." },
  { id: "email-content", name: "Email Content Agent", model: "standard", availability: "coming-soon", description: "Creates email marketing content for promotions, customer communication, newsletters, and follow-up campaigns." },
  { id: "seo-content", name: "SEO Content Agent", model: "standard", availability: "coming-soon", description: "Creates search-focused content designed around relevant topics, services, and customer search intent." },
  { id: "website-seo-performance", name: "Website / SEO Performance Analyst", model: "standard", availability: "coming-soon", description: "Reviews website and search performance and identifies practical opportunities for improvement." },
  { id: "reputation-analysis", name: "Reputation Analysis Agent", model: "standard", availability: "coming-soon", description: "Monitors and analyzes customer reviews and online reputation patterns to identify strengths, problems, and trends." },
  { id: "review-response", name: "Review Response Agent", model: "standard", availability: "coming-soon", description: "Creates appropriate responses to customer reviews using the company’s preferred tone and response guidelines." },
  { id: "social-media-publishing", name: "Social Media Publishing Agent", model: "assisted", availability: "coming-soon", description: "Publishes approved social media content through the customer’s connected social accounts according to the configured schedule." },
  { id: "email-publishing", name: "Email Publishing Agent", model: "assisted", availability: "coming-soon", description: "Publishes approved email campaigns through the customer’s connected email marketing platform." },
  { id: "seo-publishing", name: "SEO Publishing Agent", model: "assisted", availability: "coming-soon", description: "Publishes approved SEO content through the customer’s connected website or content management system." },
  { id: "google-profile-management", name: "Google Profile Management Agent", model: "assisted", availability: "coming-soon", description: "Helps maintain and update the customer’s connected Google Business Profile as part of an ongoing workflow." },
  { id: "landing-page", name: "Landing Page Agent", model: "one-time", availability: "coming-soon", description: "Creates the content and structure for one focused business landing page based on the customer’s offer, audience, and objective." },
  { id: "google-profile-audit", name: "Google Profile Audit & Optimization Agent", model: "one-time", availability: "coming-soon", description: "Reviews a Google Business Profile and produces a practical optimization package with recommended improvements." },
];
