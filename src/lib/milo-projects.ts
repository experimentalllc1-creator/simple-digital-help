// Released through the standard Milo production workflow.
export const miloProjectAssignments = [
  { slug: "milo-texas-projects-developments", productCode: "PD-PROJ-TX", agentId: "projects-developments", regionId: "texas", region: "Texas", available: true, productEnv: "STRIPE_MILO_PROJ_TX_PRODUCT_ID", priceEnv: "STRIPE_MILO_PROJ_TX_PRICE_ID" },
  { slug: "milo-florida-projects-developments", productCode: "PD-PROJ-FL", agentId: "projects-developments", regionId: "florida", region: "Florida", available: true, productEnv: "STRIPE_MILO_PROJ_FL_PRODUCT_ID", priceEnv: "STRIPE_MILO_PROJ_FL_PRICE_ID" },
  { slug: "milo-new-york-projects-developments", productCode: "PD-PROJ-NY", agentId: "projects-developments", regionId: "new-york", region: "New York", available: true, productEnv: "STRIPE_MILO_PROJ_NY_PRODUCT_ID", priceEnv: "STRIPE_MILO_PROJ_NY_PRICE_ID" },
] as const;

export const projectHeaders = ["Date Discovered", "Project Name", "City", "County", "State", "Project Type", "Project Description", "Planning Stage at Discovery", "Developer / Owner, if available", "Source URL"];
export const projectCoverageHeaders = ["Date Checked", "State", "Jurisdiction", "Source Name / URL", "Check Result", "Notes"];
