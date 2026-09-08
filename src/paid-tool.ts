import { paymentConfig } from "./config";
import { claimPurchase, getPurchase, saveDeliveryFailure, saveSettled, type Purchase } from "./ledger";
import { PAID_RESULT_TTL_DAYS } from "./product-terms";

const DELIVERY_FAILURE_MESSAGE = "Payment settled but delivery failed. Contact operator support with the purchase ID and transaction reference. Automatic recovery is unavailable; do not create a new payment or send payment proofs to support.";

type ResourceServer = {
  buildPaymentRequirements(input: unknown): Promise<unknown>;
  findMatchingRequirements(requirements: unknown, payload: unknown): unknown;
  verifyPayment(payload: unknown, matching: unknown): Promise<{ isValid: boolean; invalidReason?: string; payer?: string }>;
  settlePayment(payload: unknown, matching: unknown): Promise<{ success: boolean; errorReason?: string; transaction?: unknown; network?: string; payer?: string }>;
};

export interface PaidToolOptions<TArgs extends Record<string, unknown>> {
  toolName: string;
  resource: { url: string; description: string; purchaseTerms?: Record<string, unknown> };
  env: Env;
  config: ReturnType<typeof paymentConfig>;
  resourceServer: ResourceServer;
  initialize: () => Promise<void>;
  validateNewPurchase?: (args: TArgs) => Promise<Record<string, unknown> | null>;
  execute: (args: TArgs) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

export function createPaidToolHandler<TArgs extends Record<string, unknown>>(options: PaidToolOptions<TArgs>) {
  return async (args: TArgs, extra: any) => {
    const token = extra?.mcpReq?._meta?.["x402/payment"] ?? extra?._meta?.["x402/payment"] ?? extra?.requestInfo?.headers?.["PAYMENT-SIGNATURE"];
    const fingerprint = typeof token === "string" ? await sha256(token) : "";
    const inputHash = await sha256(canonicalJson(args));
    if (typeof token === "string") {
      const existing = await getPurchase(options.env.DB, fingerprint);
      if (existing) return existingPurchaseResponse(existing, inputHash, options.toolName, options.config);
    }
    // Existing purchases replay their saved terms without accepting a newer version.
    const validation = await options.validateNewPurchase?.(args);
    if (validation) return result(validation, undefined, true);
    await options.initialize();
    const requirements = await options.resourceServer.buildPaymentRequirements({ scheme: "exact", payTo: options.config.recipient, price: options.config.priceUsd, network: options.config.network, maxTimeoutSeconds: 300 });
    if (typeof token !== "string") return paymentRequired(requirements, options.resource);

    let payload: unknown;
    try { payload = JSON.parse(atob(token)); } catch { return paymentRequired(requirements, options.resource, "INVALID_PAYMENT"); }
    const matching = options.resourceServer.findMatchingRequirements(requirements, payload);
    if (!matching) return paymentRequired(requirements, options.resource, "INVALID_PAYMENT");
    let verification;
    try { verification = await options.resourceServer.verifyPayment(payload, matching); } catch { return paymentRequired(requirements, options.resource, "INVALID_PAYMENT"); }
    if (!verification.isValid) return paymentRequired(requirements, options.resource, verification.invalidReason ?? "INVALID_PAYMENT");

    let preparedResult: string;
    try {
      preparedResult = JSON.stringify(await options.execute(args));
    } catch {
      return error("delivery_preparation_failed", "Could not prepare delivery. No settlement was attempted.", { paymentRequired: false });
    }
    const now = new Date();
    const claimed = await claimPurchase(options.env.DB, {
      purchase_id: crypto.randomUUID(), payment_fingerprint: fingerprint, payer: verification.payer ?? null,
      tool_name: options.toolName, input_hash: inputHash, network: options.config.network, asset: options.config.asset, amount: options.config.amount,
      created_at: now.toISOString(), updated_at: now.toISOString(), expires_at: new Date(now.getTime() + PAID_RESULT_TTL_DAYS * 86_400_000).toISOString(),
    }, preparedResult);
    if (!claimed.created) return existingPurchaseResponse(claimed.purchase, inputHash, options.toolName, options.config);
    if (claimed.purchase.result_json !== preparedResult) return error("delivery_preparation_failed", "Prepared delivery was not persisted. No settlement was attempted.", { paymentRequired: false });

    let settlement;
    try { settlement = await options.resourceServer.settlePayment(payload, matching); } catch { return pendingReceipt(claimed.purchase.purchase_id); }
    if (!settlement.success) return paymentRequired(requirements, options.resource, settlement.errorReason ?? "SETTLEMENT_FAILED");

    const receipt = { purchaseId: claimed.purchase.purchase_id, status: "settled", transaction: settlement.transaction, network: settlement.network, payer: settlement.payer };
    try {
      const body = { ...JSON.parse(preparedResult), receipt };
      await saveSettled(options.env.DB, fingerprint, String(settlement.transaction ?? ""), body);
      return result(body, { "x402/payment-response": receipt });
    } catch {
      try {
        await saveDeliveryFailure(options.env.DB, fingerprint, String(settlement.transaction ?? ""), "receipt_persistence_failed");
      } catch {
        return error("payment_confirmation_pending", "Payment settled but its receipt could not be persisted. Contact support with this receipt; do not pay again.", { ...receipt, next_action: "contact_support", paymentRequired: false });
      }
      return result({ ...JSON.parse(preparedResult), receipt }, { "x402/payment-response": receipt });
    }
  };
}

export function existingPurchaseResponse(purchase: Purchase, inputHash: string, toolName: string, config: ReturnType<typeof paymentConfig>) {
  if (purchase.input_hash !== inputHash || purchase.tool_name !== toolName || purchase.network !== config.network || purchase.asset.toLowerCase() !== config.asset.toLowerCase() || purchase.amount !== config.amount) return error("payment_reuse_rejected", "This payment proof belongs to a different tool call or price.");
  if (new Date(purchase.expires_at).getTime() <= Date.now()) return error("purchase_expired", "The saved result has expired. Do not reuse this payment proof.");
  if (purchase.status === "settled" && purchase.result_json) return result(JSON.parse(purchase.result_json));
  if (purchase.status === "delivery_failed" && purchase.result_json && purchase.transaction_ref) {
    return result({ ...JSON.parse(purchase.result_json), receipt: { purchaseId: purchase.purchase_id, status: "settled", transaction: purchase.transaction_ref, network: purchase.network, payer: purchase.payer } });
  }
  if (purchase.status === "delivery_failed") return error("delivery_failed", DELIVERY_FAILURE_MESSAGE, { purchaseId: purchase.purchase_id, transaction: purchase.transaction_ref, next_action: "contact_support", paymentRequired: false });
  return pendingReceipt(purchase.purchase_id);
}

function paymentRequired(accepts: unknown, resource: PaidToolOptions<Record<string, unknown>>["resource"], reason = "PAYMENT_REQUIRED") { return { isError: true, _meta: { "x402/error": { x402Version: 2, error: reason, resource: { ...resource, mimeType: "application/json" }, accepts } }, content: [{ type: "text" as const, text: JSON.stringify({ error: reason, resource, accepts }) }] }; }
function pendingReceipt(purchaseId: string) { return error("payment_confirmation_pending", "Settlement outcome is unknown. Retry only with the same payment proof; do not create a new payment.", { purchaseId }); }
function result(value: unknown, meta?: Record<string, unknown>, isError?: boolean) { return { content: [{ type: "text" as const, text: JSON.stringify(value) }], structuredContent: value as Record<string, unknown>, ...(meta ? { _meta: meta } : {}), ...(isError ? { isError: true } : {}) }; }
function error(code: string, message: string, details?: unknown) { const value = { error: code, message, ...(details && typeof details === "object" ? details : {}) }; return { isError: true, content: [{ type: "text" as const, text: JSON.stringify(value) }], structuredContent: value }; }
function canonicalJson(value: unknown): string { if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`; if (value && typeof value === "object") { const record = value as Record<string, unknown>; return `{${Object.keys(record).sort().map(k => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(",")}}`; } return JSON.stringify(value); }
async function sha256(value: string): Promise<string> { const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join(""); }
