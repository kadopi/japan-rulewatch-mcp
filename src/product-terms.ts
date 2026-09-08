export const ENTRY_PACK_SALE_PRICE_USDC = 5;
export const PAID_RESULT_TTL_DAYS = 7;

export const ENTRY_PACK_PURCHASE_TERMS = {
  purchase_type: "single_purchase",
  purchaser_scope: "businesses and AI agents acting for an authorized business principal only",
  consumer_sales_permitted: false,
  purchaser_representation:
    "By submitting payment, the purchaser confirms it is acquiring this information service for business use and not as a consumer for household purposes.",
  commercial_terms_version: "2026-09-08-b2b-draft-2",
  commercial_terms_tool: "get_commercial_terms",
  support: {
    mode: "automated delivery and retrieval; email for unresolved purchase exceptions only",
    email: "kadoya@nuko-factory.com",
    response_deadline_promised: false,
    required_references: ["purchase ID", "transaction reference if available"],
    notice: "Do not send private keys or raw payment proofs. No automatic refund is provided; refund policy remains pending."
  },
  sale_price_usdc: ENTRY_PACK_SALE_PRICE_USDC,
  saved_result_days: PAID_RESULT_TTL_DAYS,
  free_retrieval_scope: "same payment proof, tool, normalized input, price condition, and saved content version",
  future_versions_included: false,
  indefinite_storage_promised: false
} as const;
