import { ENTRY_PACK_ID } from "./entry-pack";
import { ENTRY_PACK_PURCHASE_TERMS as purchaseTerms } from "./product-terms";

type CommercialTermsStatus = "ready" | "operator_details_pending";

type CommercialTerms = {
  product_id: string;
  terms_version: string;
  status: CommercialTermsStatus;
  purchaser_scope: string;
  consumer_sales_permitted: boolean;
  price: { amount_usdc: number; network: string; purchase_type: string };
  delivery: { timing: string; saved_result_days: number; future_versions_included: boolean };
  delivery_failure: { automatic_recovery: boolean; remedy: string };
  operator_details: string;
  support_channel: string;
  support: typeof purchaseTerms.support;
  governing_law_and_forum: string;
  data_handling: string;
};

export const ENTRY_PACK_COMMERCIAL_TERMS: CommercialTerms = {
  product_id: ENTRY_PACK_ID,
  terms_version: purchaseTerms.commercial_terms_version,
  status: "ready",
  purchaser_scope: purchaseTerms.purchaser_scope,
  consumer_sales_permitted: purchaseTerms.consumer_sales_permitted,
  price: { amount_usdc: purchaseTerms.sale_price_usdc, network: "Base Mainnet", purchase_type: purchaseTerms.purchase_type },
  delivery: {
    timing: "immediate after successful x402 settlement",
    saved_result_days: purchaseTerms.saved_result_days,
    future_versions_included: purchaseTerms.future_versions_included
  },
  delivery_failure: {
    automatic_recovery: false,
    remedy: "no change-of-mind cancellation after successful delivery; seven-day same-proof retrieval does not limit non-delivery claims; confirmed non-delivery or material mismatch is remedied first, then refunded at 5 USDC if it cannot be remedied; manual refund normally to the original Base payer address after receipt checks, with an authenticated alternative if necessary; seller pays refund transaction fees; mandatory legal remedies remain unaffected"
  },
  operator_details: "門屋哲朗 (sole proprietor trading as ぬこファクトリー); 〒790-0012 愛媛県松山市湊町４丁目５－６プログレッソ松山",
  support_channel: purchaseTerms.support.email,
  support: purchaseTerms.support,
  governing_law_and_forum: "Japanese law; Matsuyama District Court or Matsuyama Summary Court as appropriate has exclusive first-instance jurisdiction to the extent permitted by applicable law; mandatory rules prevail",
  data_handling: "payment ledger stores settlement and delivery state, never private keys or raw payment proofs"
};

export function commercialTermsFor(productId: string) {
  return productId === ENTRY_PACK_ID ? ENTRY_PACK_COMMERCIAL_TERMS : null;
}

export function commercialTermsReady(terms: CommercialTerms = ENTRY_PACK_COMMERCIAL_TERMS) {
  const confirmed = (value: string) => value.trim().length > 0 && !/pending|\[OPERATOR/i.test(value);
  return terms.status === "ready" && [terms.operator_details, terms.support_channel,
    terms.governing_law_and_forum, terms.delivery_failure.remedy].every(confirmed);
}
