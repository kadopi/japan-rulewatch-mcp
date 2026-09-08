import { describe, expect, it } from "vitest";
import { paymentConfig, paymentDefaults } from "../src/config";
import type { Purchase } from "../src/ledger";
import { existingPurchaseResponse } from "../src/paid-tool";

const config = paymentConfig({
  X402_NETWORK: "eip155:84532",
  X402_ASSET: paymentDefaults.baseSepoliaUsdc,
  X402_AMOUNT: "10000",
  X402_TEST_PRICE_USD: "0.01",
  X402_PAY_TO: "0x1111111111111111111111111111111111111111",
  X402_FACILITATOR_URL: "https://x402.org/facilitator"
} as Env);

const purchase: Purchase = {
  purchase_id: "tourism-purchase-1", payment_fingerprint: "fingerprint", payer: null,
  tool_name: "get_tourism_evidence_pack", input_hash: "input-a", network: config.network,
  asset: config.asset, amount: config.amount, status: "settled", transaction_ref: "tx",
  result_json: JSON.stringify({ status: "ready", serviceFlowType: "C_BOOKING_PREPAID" }),
  error_code: null, created_at: "2026-09-06T00:00:00.000Z",
  updated_at: "2026-09-06T00:00:00.000Z", expires_at: "2099-09-06T00:00:00.000Z"
};

describe("tourism payment configuration", () => {
  it("accepts the Base Sepolia USDC tuple", () => expect(config.network).toBe("eip155:84532"));
  it("requires a separately configured sale price for Mainnet", () =>
    expect(() => paymentConfig({
      ...config,
      X402_NETWORK: "eip155:8453",
      X402_ASSET: paymentDefaults.baseUsdc,
      X402_AMOUNT: "25000000",
      X402_TEST_PRICE_USD: "0.01",
      X402_PRICE_USD: undefined
    } as unknown as Env)).toThrow("payment_not_configured"));
  it("accepts the approved 5 USDC sale price only from the Mainnet sale-price setting", () =>
    expect(paymentConfig({
      X402_NETWORK: "eip155:8453",
      X402_ASSET: paymentDefaults.baseUsdc,
      X402_AMOUNT: "5000000",
      X402_TEST_PRICE_USD: "0.01",
      X402_SALE_PRICE_USD: "5",
      X402_PAY_TO: "0x1111111111111111111111111111111111111111",
      X402_FACILITATOR_URL: "https://x402.org/facilitator"
    } as unknown as Env).priceUsd).toBe(5));
  it("rejects an asset that does not match the selected network", () =>
    expect(() => paymentConfig({ ...config, X402_ASSET: paymentDefaults.baseUsdc } as unknown as Env)).toThrow("payment_not_configured"));
});

describe("tourism evidence purchase replay", () => {
  it("routes settled delivery failures to support without requesting another payment", () => {
    const response = existingPurchaseResponse({ ...purchase, status: "delivery_failed", result_json: null }, "input-a", "get_tourism_evidence_pack", config);
    expect(response.structuredContent).toMatchObject({ error: "delivery_failed", next_action: "contact_support", paymentRequired: false, purchaseId: purchase.purchase_id });
    expect(JSON.stringify(response)).toContain("Automatic recovery is unavailable");
  });
  it("returns the saved evidence pack for the same proof and input", () =>
    expect(existingPurchaseResponse(purchase, "input-a", "get_tourism_evidence_pack", config).structuredContent).toMatchObject({ status: "ready" }));
  it("rejects a proof reused for different input", () =>
    expect(existingPurchaseResponse(purchase, "input-b", "get_tourism_evidence_pack", config).structuredContent).toMatchObject({ error: "payment_reuse_rejected" }));
  it("does not request a new payment while settlement is pending", () =>
    expect(existingPurchaseResponse({ ...purchase, status: "settling", result_json: null }, "input-a", "get_tourism_evidence_pack", config).structuredContent).toMatchObject({ error: "payment_confirmation_pending" }));
});
