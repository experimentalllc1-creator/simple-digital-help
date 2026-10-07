import { geographicRegions } from "./geographic-regions";
export const salesPaths = {
  category: "/categories/sales",
  discovery: "/categories/sales/find-new-customers",
  opportunities: "/categories/sales/find-new-opportunities",
} as const;

export const discoveryIndustries = [
  "Roofing Contractors",
  "HVAC Contractors",
  "Plumbing Contractors",
  "Electrical Contractors",
  "Landscaping Contractors",
  "General Contractors",
  "Builders / Homebuilders",
  "Architects",
  "Property Managers",
  "HOAs",
  "Distributors",
  "Hotels / Resorts",
  "Restaurants",
  "Medical Practices",
  "Dental Practices",
  "Municipalities / Public Agencies",
  "Building Materials Manufacturer",
] as const;
export const discoveryRegions = geographicRegions.map((region) => region.name);

export type DiscoveryProduct = {
  slug: string;
  name: string;
  subtitle: string;
  industry: (typeof discoveryIndustries)[number];
  region: (typeof discoveryRegions)[number] | "United States";
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
  {
    slug: "milo-texas-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Texas Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Texas",
    status: "published",
  },
  {
    slug: "milo-california-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - California Roofing Contractors",
    industry: "Roofing Contractors",
    region: "California",
    status: "published",
  },
  {
    slug: "milo-northeast-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Northeast Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Northeast",
    status: "published",
  },
  {
    slug: "milo-southeast-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Southeast Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Southeast",
    status: "published",
  },
  {
    slug: "milo-midwest-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Midwest Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Midwest",
    status: "published",
  },
  {
    slug: "milo-southwest-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Southwest Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Southwest",
    status: "published",
  },
  {
    slug: "milo-mountain-west-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Mountain West Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Mountain West",
    status: "published",
  },
  {
    slug: "milo-pacific-northwest-roofing-contractors",
    name: "Milo",
    subtitle: "Automated Prospect Discovery - Pacific Northwest Roofing Contractors",
    industry: "Roofing Contractors",
    region: "Pacific Northwest",
    status: "published",
  },
  {"slug":"milo-florida-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Florida HVAC Contractors","industry":"HVAC Contractors","region":"Florida","status":"published"},
  {"slug":"milo-texas-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Texas HVAC Contractors","industry":"HVAC Contractors","region":"Texas","status":"published"},
  {"slug":"milo-california-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - California HVAC Contractors","industry":"HVAC Contractors","region":"California","status":"published"},
  {"slug":"milo-northeast-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Northeast HVAC Contractors","industry":"HVAC Contractors","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Southeast HVAC Contractors","industry":"HVAC Contractors","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Midwest HVAC Contractors","industry":"HVAC Contractors","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Southwest HVAC Contractors","industry":"HVAC Contractors","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Mountain West HVAC Contractors","industry":"HVAC Contractors","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-hvac-contractors","name":"Milo HVAC","subtitle":"Automated Prospect Discovery - Pacific Northwest HVAC Contractors","industry":"HVAC Contractors","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Florida Plumbing Contractors","industry":"Plumbing Contractors","region":"Florida","status":"published"},
  {"slug":"milo-texas-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Texas Plumbing Contractors","industry":"Plumbing Contractors","region":"Texas","status":"published"},
  {"slug":"milo-california-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - California Plumbing Contractors","industry":"Plumbing Contractors","region":"California","status":"published"},
  {"slug":"milo-northeast-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Northeast Plumbing Contractors","industry":"Plumbing Contractors","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Southeast Plumbing Contractors","industry":"Plumbing Contractors","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Midwest Plumbing Contractors","industry":"Plumbing Contractors","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Southwest Plumbing Contractors","industry":"Plumbing Contractors","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Mountain West Plumbing Contractors","industry":"Plumbing Contractors","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-plumbing-contractors","name":"Milo Plumbing","subtitle":"Automated Prospect Discovery - Pacific Northwest Plumbing Contractors","industry":"Plumbing Contractors","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Florida Electrical Contractors","industry":"Electrical Contractors","region":"Florida","status":"published"},
  {"slug":"milo-texas-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Texas Electrical Contractors","industry":"Electrical Contractors","region":"Texas","status":"published"},
  {"slug":"milo-california-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - California Electrical Contractors","industry":"Electrical Contractors","region":"California","status":"published"},
  {"slug":"milo-northeast-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Northeast Electrical Contractors","industry":"Electrical Contractors","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Southeast Electrical Contractors","industry":"Electrical Contractors","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Midwest Electrical Contractors","industry":"Electrical Contractors","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Southwest Electrical Contractors","industry":"Electrical Contractors","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Mountain West Electrical Contractors","industry":"Electrical Contractors","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-electrical-contractors","name":"Milo Electrical","subtitle":"Automated Prospect Discovery - Pacific Northwest Electrical Contractors","industry":"Electrical Contractors","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Florida General Contractors","industry":"General Contractors","region":"Florida","status":"published"},
  {"slug":"milo-texas-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Texas General Contractors","industry":"General Contractors","region":"Texas","status":"published"},
  {"slug":"milo-california-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - California General Contractors","industry":"General Contractors","region":"California","status":"published"},
  {"slug":"milo-northeast-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Northeast General Contractors","industry":"General Contractors","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Southeast General Contractors","industry":"General Contractors","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Midwest General Contractors","industry":"General Contractors","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Southwest General Contractors","industry":"General Contractors","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Mountain West General Contractors","industry":"General Contractors","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-general-contractors","name":"Milo General Contractors","subtitle":"Automated Prospect Discovery - Pacific Northwest General Contractors","industry":"General Contractors","region":"Pacific Northwest","status":"published"},
  { slug: "milo-us-building-materials-manufacturers", name: "Milo", subtitle: "U.S. Building Materials Manufacturers", industry: "Building Materials Manufacturer", region: "United States", status: "published" },
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
    (product) => product.industry === industry && (product.region === region || product.region === "United States"),
  );
}

export const discoveryVideo = {
  src: "/videos/find-new-customers-intro.mp4",
  poster: "/videos/find-new-customers-poster.svg",
  captions: "/videos/find-new-customers-intro.vtt",
  completionKey: "sdh:find-new-customers:video-complete:v1",
  closing: "If this sounds like something you need, click below. Let's find the right version for your business.",
} as const;

export const opportunityDiscovery = {
  type: "Projects & Developments",
  regions: discoveryRegions,
  completionKey: "sdh:find-new-opportunities:video-complete:v1",
} as const;

