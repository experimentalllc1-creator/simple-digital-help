import { geographicRegions, projectRegions } from "./geographic-regions";
import { miloProjectAssignments } from "./milo-projects";
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
  "Property Management Companies",
  "Homeowners Associations (HOAs)",
  "Distributors",
  "Hotels & Resorts",
  "Restaurants",
  "Healthcare Practices",
  "Municipalities / Public Agencies",
  "Building Materials Manufacturer",
  "Projects & Developments",
] as const;
export const discoveryRegions = geographicRegions.map((region) => region.name);

export type DiscoveryProduct = {
  slug: string;
  name: string;
  subtitle: string;
  industry: (typeof discoveryIndustries)[number];
  region: (typeof discoveryRegions)[number] | "United States" | "New York";
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
  {"slug":"milo-florida-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Florida Architects","industry":"Architects","region":"Florida","status":"published"},
  {"slug":"milo-texas-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Texas Architects","industry":"Architects","region":"Texas","status":"published"},
  {"slug":"milo-california-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - California Architects","industry":"Architects","region":"California","status":"published"},
  {"slug":"milo-northeast-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Northeast Architects","industry":"Architects","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Southeast Architects","industry":"Architects","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Midwest Architects","industry":"Architects","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Southwest Architects","industry":"Architects","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Mountain West Architects","industry":"Architects","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-architects","name":"Milo – Architects","subtitle":"Automated Prospect Discovery - Pacific Northwest Architects","industry":"Architects","region":"Pacific Northwest","status":"published"},
  { slug: "milo-us-production-homebuilders-developers", name: "Milo", subtitle: "U.S. Production Homebuilders & Developers", industry: "Builders / Homebuilders", region: "United States", status: "published" },
  { slug: "milo-us-building-materials-manufacturers", name: "Milo", subtitle: "U.S. Building Materials Manufacturers", industry: "Building Materials Manufacturer", region: "United States", status: "published" },
  {"slug":"milo-florida-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Florida Landscaping Companies","industry":"Landscaping Contractors","region":"Florida","status":"published"},
  {"slug":"milo-texas-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Texas Landscaping Companies","industry":"Landscaping Contractors","region":"Texas","status":"published"},
  {"slug":"milo-california-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - California Landscaping Companies","industry":"Landscaping Contractors","region":"California","status":"published"},
  {"slug":"milo-northeast-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Northeast Landscaping Companies","industry":"Landscaping Contractors","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Southeast Landscaping Companies","industry":"Landscaping Contractors","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Midwest Landscaping Companies","industry":"Landscaping Contractors","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Southwest Landscaping Companies","industry":"Landscaping Contractors","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Mountain West Landscaping Companies","industry":"Landscaping Contractors","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-landscaping-companies","name":"Milo – Landscaping Companies","subtitle":"Automated Prospect Discovery - Pacific Northwest Landscaping Companies","industry":"Landscaping Contractors","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Florida Property Management Companies","industry":"Property Management Companies","region":"Florida","status":"published"},
  {"slug":"milo-texas-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Texas Property Management Companies","industry":"Property Management Companies","region":"Texas","status":"published"},
  {"slug":"milo-california-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - California Property Management Companies","industry":"Property Management Companies","region":"California","status":"published"},
  {"slug":"milo-northeast-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Northeast Property Management Companies","industry":"Property Management Companies","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Southeast Property Management Companies","industry":"Property Management Companies","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Midwest Property Management Companies","industry":"Property Management Companies","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Southwest Property Management Companies","industry":"Property Management Companies","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Mountain West Property Management Companies","industry":"Property Management Companies","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-property-management-companies","name":"Milo – Property Management Companies","subtitle":"Automated Prospect Discovery - Pacific Northwest Property Management Companies","industry":"Property Management Companies","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Florida Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Florida","status":"published"},
  {"slug":"milo-texas-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Texas Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Texas","status":"published"},
  {"slug":"milo-california-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - California Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"California","status":"published"},
  {"slug":"milo-northeast-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Northeast Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Southeast Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Midwest Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Southwest Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Mountain West Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-hoas","name":"Milo – Homeowners Associations (HOAs)","subtitle":"Automated Prospect Discovery - Pacific Northwest Homeowners Associations (HOAs)","industry":"Homeowners Associations (HOAs)","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Florida Distributors","industry":"Distributors","region":"Florida","status":"published"},
  {"slug":"milo-texas-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Texas Distributors","industry":"Distributors","region":"Texas","status":"published"},
  {"slug":"milo-california-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - California Distributors","industry":"Distributors","region":"California","status":"published"},
  {"slug":"milo-northeast-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Northeast Distributors","industry":"Distributors","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Southeast Distributors","industry":"Distributors","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Midwest Distributors","industry":"Distributors","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Southwest Distributors","industry":"Distributors","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Mountain West Distributors","industry":"Distributors","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-distributors","name":"Milo – Distributors","subtitle":"Automated Prospect Discovery - Pacific Northwest Distributors","industry":"Distributors","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Florida Hotels & Resorts","industry":"Hotels & Resorts","region":"Florida","status":"published"},
  {"slug":"milo-texas-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Texas Hotels & Resorts","industry":"Hotels & Resorts","region":"Texas","status":"published"},
  {"slug":"milo-california-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - California Hotels & Resorts","industry":"Hotels & Resorts","region":"California","status":"published"},
  {"slug":"milo-northeast-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Northeast Hotels & Resorts","industry":"Hotels & Resorts","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Southeast Hotels & Resorts","industry":"Hotels & Resorts","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Midwest Hotels & Resorts","industry":"Hotels & Resorts","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Southwest Hotels & Resorts","industry":"Hotels & Resorts","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Mountain West Hotels & Resorts","industry":"Hotels & Resorts","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-hotels-resorts","name":"Milo – Hotels & Resorts","subtitle":"Automated Prospect Discovery - Pacific Northwest Hotels & Resorts","industry":"Hotels & Resorts","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Florida Restaurants","industry":"Restaurants","region":"Florida","status":"published"},
  {"slug":"milo-texas-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Texas Restaurants","industry":"Restaurants","region":"Texas","status":"published"},
  {"slug":"milo-california-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - California Restaurants","industry":"Restaurants","region":"California","status":"published"},
  {"slug":"milo-northeast-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Northeast Restaurants","industry":"Restaurants","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Southeast Restaurants","industry":"Restaurants","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Midwest Restaurants","industry":"Restaurants","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Southwest Restaurants","industry":"Restaurants","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Mountain West Restaurants","industry":"Restaurants","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-restaurants","name":"Milo – Restaurants","subtitle":"Automated Prospect Discovery - Pacific Northwest Restaurants","industry":"Restaurants","region":"Pacific Northwest","status":"published"},
  {"slug":"milo-florida-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Florida Healthcare Practices","industry":"Healthcare Practices","region":"Florida","status":"published"},
  {"slug":"milo-texas-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Texas Healthcare Practices","industry":"Healthcare Practices","region":"Texas","status":"published"},
  {"slug":"milo-california-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - California Healthcare Practices","industry":"Healthcare Practices","region":"California","status":"published"},
  {"slug":"milo-northeast-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Northeast Healthcare Practices","industry":"Healthcare Practices","region":"Northeast","status":"published"},
  {"slug":"milo-southeast-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Southeast Healthcare Practices","industry":"Healthcare Practices","region":"Southeast","status":"published"},
  {"slug":"milo-midwest-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Midwest Healthcare Practices","industry":"Healthcare Practices","region":"Midwest","status":"published"},
  {"slug":"milo-southwest-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Southwest Healthcare Practices","industry":"Healthcare Practices","region":"Southwest","status":"published"},
  {"slug":"milo-mountain-west-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Mountain West Healthcare Practices","industry":"Healthcare Practices","region":"Mountain West","status":"published"},
  {"slug":"milo-pacific-northwest-healthcare-practices","name":"Milo – Healthcare Practices","subtitle":"Automated Prospect Discovery - Pacific Northwest Healthcare Practices","industry":"Healthcare Practices","region":"Pacific Northwest","status":"published"},
];

discoveryProducts.push(...miloProjectAssignments.map(assignment => ({
  slug: assignment.slug, name: "Milo – Projects & Developments", subtitle: `Early Project Discovery - ${assignment.region}`,
  industry: "Projects & Developments" as const, region: assignment.region, status: assignment.available ? "published" as const : "draft" as const,
})));

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
  regions: projectRegions.map(region => region.name),
  completionKey: "sdh:find-new-opportunities:video-complete:v1",
} as const;

