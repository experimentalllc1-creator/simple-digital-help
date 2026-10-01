// Replace these placeholders when Marketing branding and product assets are finalized.
export const marketingPlaceholders = {
  eyebrow: "MARKETING TAGLINE — COMING SOON",
  introduction: "Marketing & Content introduction coming soon.",
  icon: "Marketing icon coming soon.",
  video: "Video introduction coming soon.",
  imagery: "Product imagery coming soon.",
};

export const installationTypes = {
  diy: {
    label: "DIY",
    description: "Install and use the agent from instructions or video without our intervention.",
  },
  assisted: {
    label: "Contact us for setup",
    description: "Assisted setup for external-platform permissions, integrations, publishing access, or API configuration.",
  },
} as const;

export const marketingContact = "mailto:support@simpledigitalhelp.com";
export const marketingPaths = {
  category: "/categories/marketing",
  createPublish: "/categories/marketing/create-publish",
  analyzeImprove: "/categories/marketing/analyze-improve",
} as const;

export const marketingGroups = {
  "create-publish": {
    title: "Create & Publish",
    // Temporary description supplied for the initial catalog.
    description: "Create the marketing content your business needs and help get it in front of your audience.",
    href: marketingPaths.createPublish,
  },
  "analyze-improve": {
    title: "Analyze & Improve",
    // Temporary description supplied for the initial catalog.
    description: "Understand what is working, what is not, and where your marketing can improve.",
    href: marketingPaths.analyzeImprove,
  },
} as const;

export type MarketingGroup = keyof typeof marketingGroups;
export type MarketingAgent = {
  id: string;
  name: string;
  group: MarketingGroup;
  installation: keyof typeof installationTypes;
  availability: "unavailable";
};

export const marketingAgents: MarketingAgent[] = [
  { id: "content-ideas", name: "Content Ideas Agent", group: "create-publish", installation: "diy", availability: "unavailable" },
  { id: "creative", name: "Creative Agent", group: "create-publish", installation: "diy", availability: "unavailable" },
  { id: "social-media-publishing", name: "Social Media Publishing Agent", group: "create-publish", installation: "assisted", availability: "unavailable" },
  { id: "email-content", name: "Email Content Agent", group: "create-publish", installation: "diy", availability: "unavailable" },
  { id: "email-publishing", name: "Email Publishing Agent", group: "create-publish", installation: "assisted", availability: "unavailable" },
  { id: "landing-page", name: "Landing Page Agent", group: "create-publish", installation: "diy", availability: "unavailable" },
  { id: "seo-content", name: "SEO Content Agent", group: "create-publish", installation: "diy", availability: "unavailable" },
  { id: "seo-publishing", name: "SEO Publishing Agent", group: "create-publish", installation: "assisted", availability: "unavailable" },
  { id: "organic-performance", name: "Organic Performance Agent", group: "analyze-improve", installation: "diy", availability: "unavailable" },
  { id: "paid-campaign", name: "Paid Campaign Analyst", group: "analyze-improve", installation: "diy", availability: "unavailable" },
  { id: "website-seo-performance", name: "Website / SEO Performance Analyst", group: "analyze-improve", installation: "diy", availability: "unavailable" },
  { id: "reputation-analysis", name: "Reputation Analysis Agent", group: "analyze-improve", installation: "diy", availability: "unavailable" },
  { id: "review-response", name: "Review Response Agent", group: "analyze-improve", installation: "diy", availability: "unavailable" },
  { id: "google-profile-audit", name: "Google Profile Audit & Optimization Agent", group: "analyze-improve", installation: "diy", availability: "unavailable" },
  { id: "google-profile-management", name: "Google Profile Management Agent", group: "analyze-improve", installation: "assisted", availability: "unavailable" },
];

// Future product boundary only; no generator or finished product route exists.
export const landingPageProductBoundary = {
  agentId: "landing-page",
  installation: "diy",
  templateCount: 1,
  maximumTemplates: 2,
  customerSupplies: "Business information",
  hosting: "Simple Digital Help",
  capabilities: ["Social media links", "Email/contact link", "Phone/CTA capability"],
  customDesignIncluded: false,
  upsell: "Want changes to the design, additional pages, custom functionality, or your own domain? Contact us.",
} as const;