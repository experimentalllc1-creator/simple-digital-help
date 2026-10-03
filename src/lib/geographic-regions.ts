// Shared geography for products explicitly configured as region-based.
export const geographicRegions = [
  { id: "florida", name: "Florida", states: [{ name: "Florida", code: "FL" }] },
  { id: "texas", name: "Texas", states: [{ name: "Texas", code: "TX" }] },
  { id: "california", name: "California", states: [{ name: "California", code: "CA" }] },
  { id: "northeast", name: "Northeast", states: [
    { name: "Maine", code: "ME" }, { name: "New Hampshire", code: "NH" }, { name: "Vermont", code: "VT" },
    { name: "Massachusetts", code: "MA" }, { name: "Rhode Island", code: "RI" }, { name: "Connecticut", code: "CT" },
    { name: "New York", code: "NY" }, { name: "New Jersey", code: "NJ" }, { name: "Pennsylvania", code: "PA" },
  ] },
  { id: "southeast", name: "Southeast", states: [
    { name: "Delaware", code: "DE" }, { name: "Maryland", code: "MD" }, { name: "Virginia", code: "VA" },
    { name: "West Virginia", code: "WV" }, { name: "Kentucky", code: "KY" }, { name: "Tennessee", code: "TN" },
    { name: "North Carolina", code: "NC" }, { name: "South Carolina", code: "SC" }, { name: "Georgia", code: "GA" },
    { name: "Alabama", code: "AL" }, { name: "Mississippi", code: "MS" }, { name: "Arkansas", code: "AR" }, { name: "Louisiana", code: "LA" },
  ] },
  { id: "midwest", name: "Midwest", states: [
    { name: "Ohio", code: "OH" }, { name: "Michigan", code: "MI" }, { name: "Indiana", code: "IN" },
    { name: "Illinois", code: "IL" }, { name: "Wisconsin", code: "WI" }, { name: "Minnesota", code: "MN" },
    { name: "Iowa", code: "IA" }, { name: "Missouri", code: "MO" }, { name: "North Dakota", code: "ND" },
    { name: "South Dakota", code: "SD" }, { name: "Nebraska", code: "NE" }, { name: "Kansas", code: "KS" },
  ] },
  { id: "southwest", name: "Southwest", states: [
    { name: "Arizona", code: "AZ" }, { name: "New Mexico", code: "NM" }, { name: "Nevada", code: "NV" }, { name: "Oklahoma", code: "OK" },
  ] },
  { id: "mountain-west", name: "Mountain West", states: [
    { name: "Colorado", code: "CO" }, { name: "Utah", code: "UT" }, { name: "Wyoming", code: "WY" }, { name: "Montana", code: "MT" },
  ] },
  { id: "pacific-northwest", name: "Pacific Northwest", states: [
    { name: "Washington", code: "WA" }, { name: "Oregon", code: "OR" }, { name: "Idaho", code: "ID" },
  ] },
] as const;
export type GeographicRegion = (typeof geographicRegions)[number];
export type RegionId = GeographicRegion["id"];
export function regionsForProduct(product: { regionBased: boolean }) {
  return product.regionBased ? geographicRegions : [];
}
export const regionBoundaryExplanation = "Each region has fixed boundaries. Select ? to see the states included.";
