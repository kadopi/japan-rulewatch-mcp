import { ENTRY_PACK_ID } from "./entry-pack";
import { ENTRY_PACK_SALE_PRICE_USDC, PAID_RESULT_TTL_DAYS } from "./product-terms";

type CommercialTermsStatus = "ready" | "operator_details_pending";

type CommercialTerms = {
  product_id: string;
  terms_version: string;
  status: CommercialTermsStatus;
  purchaser_scope: string;
  consumer_sales_permitted: boolean;
  price: { amount_usdc: number; network: string; purchase_type: string };
  delivery: { timing: string; saved_result_days: number; future_versions_included: boolean };
  delivery_failure: { same_proof_retry_days: number; remedy: string };
  operator_details: string;
  support_channel: string;
  governing_law_and_forum: string;
  data_handling: string;
};

export const ENTRY_PACK_COMMERCIAL_TERMS: CommercialTerms = {
  product_id: ENTRY_PACK_ID,
  terms_version: "2026-09-08-b2b-draft-1",
  status: "operator_details_pending",
  purchaser_scope: "businesses and AI agents acting for an authorized business principal only",
  consumer_sales_permitted: false,
  price: { amount_usdc: ENTRY_PACK_SALE_PRICE_USDC, network: "Base Mainnet", purchase_type: "single_purchase" },
  delivery: {
    timing: "immediate after successful x402 settlement",
    saved_result_days: PAID_RESULT_TTL_DAYS,
    future_versions_included: false
  },
  delivery_failure: {
    same_proof_retry_days: PAID_RESULT_TTL_DAYS,
    remedy: "operator support review required; no automatic on-chain refund"
  },
  operator_details: "pending",
  support_channel: "pending",
  governing_law_and_forum: "pending legal review",
  data_handling: "payment ledger stores settlement and delivery state, never private keys or raw payment proofs"
};

export function commercialTermsFor(productId: string) {
  return productId === ENTRY_PACK_ID ? ENTRY_PACK_COMMERCIAL_TERMS : null;
}

export function commercialTermsReady() {
  return ENTRY_PACK_COMMERCIAL_TERMS.status === "ready";
}
