import "server-only";
import { TERMS_VERSION, TERMS_SHA256 } from "./legal-version";
export { TERMS_VERSION };
export function hasLegalAcceptance(input: { legalAccepted?: unknown; termsVersion?: unknown }) {
 return (input.legalAccepted === true || input.legalAccepted === "true") && input.termsVersion === TERMS_VERSION;
}
export function acceptanceMetadata() {
 return { terms_version: TERMS_VERSION, terms_sha256: TERMS_SHA256, legal_accepted_at: new Date().toISOString(), legal_acceptance: "terms-privacy-disclaimers" };
}
