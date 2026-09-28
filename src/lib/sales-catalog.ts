export const salesPaths = {
  category: "/categories/sales",
  discovery: "/categories/sales/find-new-customers",
} as const;

export const discoveryIndustries = [
  "Roofing Contractors",
  "HVAC Contractors",
  "Landscaping Contractors",
  "Plumbing Contractors",
] as const;
export const discoveryRegions = [
  "Florida", "Texas", "California", "Georgia", "New York",
] as const;

export type DiscoveryProduct = {
  slug: string;
  name: string;
  subtitle: string;
  industry: (typeof discoveryIndustries)[number];
  region: (typeof discoveryRegions)[number];
  status: "draft" | "published";
};

// Published means a destination is available to explore, not available to buy.
// Keep these variations separate from the approved storefront concept catalog.
export const discoveryProducts: DiscoveryProduct[] = [
  {
    slug: "milo-florida-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Florida Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Florida",
    status: "published",
  },
];

export const publishedDiscoveryProducts = discoveryProducts.filter(
  (product) => product.status === "published",
);
export const featuredDiscoveryProduct = publishedDiscoveryProducts[0];
export const discoveryProductPath = (product: DiscoveryProduct) =>
  `/products/${product.slug}`;
export const discoveryProductTitle = (product: DiscoveryProduct) =>
  `${product.name} | ${product.subtitle}`;

export function findDiscoveryProducts(industry: string, region: string) {
  return publishedDiscoveryProducts.filter(
    (product) => product.industry === industry && product.region === region,
  );
}

export const discoveryVideo = {
  src: "/videos/find-new-customers-intro.mp4",
  poster: "/videos/find-new-customers-poster.svg",
  captions: "/videos/find-new-customers-intro.vtt",
  completionKey: "sdh:find-new-customers:video-complete:v1",
  closing: "If this sounds like something you need, click below. Let's find the right version for your business.",
} as const;
