export const ENTRY_PACK_SALE_PRICE_USDC = 5;
export const PAID_RESULT_TTL_DAYS = 7;

export const ENTRY_PACK_PURCHASE_TERMS = {
  purchase_type: "single_purchase",
  purchaser_scope: "businesses and AI agents acting for an authorized business principal only",
  consumer_sales_permitted: false,
  purchaser_representation:
    "By submitting payment, the purchaser confirms it is acquiring this information service for business use and not as a consumer for household purposes.",
  sale_price_usdc: ENTRY_PACK_SALE_PRICE_USDC,
  saved_result_days: PAID_RESULT_TTL_DAYS,
  free_retrieval_scope: "same payment proof, tool, normalized input, price condition, and saved content version",
  future_versions_included: false,
  indefinite_storage_promised: false
} as const;
