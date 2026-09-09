import { describe, expect, it } from "vitest";
import { paymentConfig, paymentDefaults } from "../src/config";
import {
  ENTRY_PACK_ID,
  entryPackInputError,
  getEntryPack,
  searchEntryCases,
  type EntryPackInput
} from "../src/entry-pack";
import { createPaidToolHandler } from "../src/paid-tool";
import { commercialTermsFor, commercialTermsReady } from "../src/commercial-terms";
import { entryPurchaseTerms, validateEntryPurchase } from "../src/entry-purchase";
import type { Purchase } from "../src/ledger";

const config = paymentConfig({
  X402_NETWORK: "eip155:84532",
  X402_ASSET: paymentDefaults.baseSepoliaUsdc,
  X402_AMOUNT: "10000",
  X402_TEST_PRICE_USD: "0.01",
  X402_PAY_TO: "0x1111111111111111111111111111111111111111",
  X402_FACILITATOR_URL: "https://x402.org/facilitator"
} as Env);

function fakeDb(failReceipt = false, failPreparation = false) {
  let purchase: Purchase | null = null;
  return {
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async first() {
              return purchase;
            },
            async run() {
              if (sql.startsWith("INSERT") && !purchase) {
                if (failPreparation) throw new Error("storage unavailable");
                purchase = {
                  purchase_id: String(values[0]),
                  payment_fingerprint: String(values[1]),
                  payer: values[2] === null ? null : String(values[2]),
                  tool_name: String(values[3]),
                  input_hash: String(values[4]),
                  network: String(values[5]),
                  asset: String(values[6]),
                  amount: String(values[7]),
                  status: "settling",
                  transaction_ref: null,
                  result_json: String(values[11]),
                  error_code: null,
                  created_at: String(values[8]),
                  updated_at: String(values[9]),
                  expires_at: String(values[10])
                };
              } else if (sql.startsWith("UPDATE purchases SET status = 'settled'") && purchase) {
                if (failReceipt) throw new Error("receipt write failed");
                purchase.status = "settled";
                purchase.transaction_ref = String(values[0]);
                purchase.result_json = String(values[1]);
                purchase.updated_at = String(values[2]);
              } else if (sql.startsWith("UPDATE purchases SET status = 'delivery_failed'") && purchase) {
                purchase.status = "delivery_failed";
                purchase.transaction_ref = String(values[0]);
              }
              return { success: true };
            }
          };
        }
      };
    }
  } as unknown as D1Database;
}

describe("Iya entry-case catalog", () => {
  it("keeps Mainnet sale closed until the operator explicitly opens it", () => {
    expect(commercialTermsFor(ENTRY_PACK_ID)).toMatchObject({
      purchaser_scope: "businesses and AI agents acting for an authorized business principal only",
      consumer_sales_permitted: false,
      status: "ready"
    });
    expect(commercialTermsReady()).toBe(true);
    expect(commercialTermsReady({ ...commercialTermsFor(ENTRY_PACK_ID)!, status: "ready" })).toBe(true);
  });

  it("requires a current terms hash and business purchase declaration before a new purchase", async () => {
    const input = { pack_id: ENTRY_PACK_ID, language: "en" };
    await expect(validateEntryPurchase(input, true)).resolves.toMatchObject({
      error: "PURCHASE_CONFIRMATION_REQUIRED", paymentRequired: false
    });
    const { snapshot, sha256 } = await entryPurchaseTerms();
    await expect(validateEntryPurchase({
      ...input, accepted_terms_version: snapshot.terms_version, accepted_terms_sha256: sha256,
      business_purchase_confirmed: true, buyer_business_name: "Example Ltd", buyer_country_code: "JP"
    }, false)).resolves.toBeNull();
  });

  it("finds the single supported case and provides an execution-oriented free preview", () => {
    const result = searchEntryCases({
      region_id: "jp-tokushima-miyoshi-iya",
      activity: "food_culture_workshop",
      language: "en"
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({ pack_id: ENTRY_PACK_ID });
    expect(result.results[0]?.preview).toMatchObject({
      model_case: { participants: 6, transport_arranged: false, lodging_arranged: false },
      delivery_preview: expect.stringContaining("official-source locations")
    });
    expect(result.results[0]?.preview.decision_preview).toHaveLength(3);
    expect(result.results[0]?.next_action).toContain("get_commercial_terms");
    expect(result.results[0]).not.toHaveProperty("purchase_terms");
    expect(result.results[0]).not.toHaveProperty("sources");
    expect(result.results[0]).not.toHaveProperty("contacts");
    expect(result.results[0]).not.toHaveProperty("checks");
    expect(result.results[0]).not.toHaveProperty("consultation_brief_en");
    expect(result.results[0]).not.toHaveProperty("next_actions");
    expect(result.operator_disclosure).toContain("privately operated commercial");
  });

  it("returns an empty result outside the supported region, activity, or language", () => {
    expect(searchEntryCases({ region_id: "jp-tokyo", activity: "food_culture_workshop", language: "en" }).results).toEqual([]);
    expect(searchEntryCases({ region_id: "jp-tokushima-miyoshi-iya", activity: "cycling", language: "en" }).results).toEqual([]);
    expect(searchEntryCases({ region_id: "jp-tokushima-miyoshi-iya", activity: "food_culture_workshop", language: "ja" }).results).toEqual([]);
  });

  it("returns the fixed full pack and resolves every source and contact reference", () => {
    const pack = getEntryPack({ pack_id: ENTRY_PACK_ID, language: "en" });
    expect(pack?.content_version).toBe("2026-09-08.2");
    expect(pack?.scenario_type).toBe("fictional_proposal");
    expect(pack?.plan_facts_notice).toContain("not customer-supplied");
    const sourceIds = new Set(pack?.sources.map((item) => item.source_id));
    const contactIds = new Set(pack?.contacts.map((item) => item.contact_id));
    for (const check of pack?.checks ?? []) {
      expect(check.source_ids.every((id) => sourceIds.has(id))).toBe(true);
      expect(check.contact_ids.every((id) => contactIds.has(id))).toBe(true);
    }
  });

  it("rejects unknown IDs and unsupported languages before payment", () => {
    expect(entryPackInputError({ pack_id: "missing", language: "en" })).toBe("PACK_NOT_FOUND");
    expect(entryPackInputError({ pack_id: ENTRY_PACK_ID, language: "ja" })).toBe("LANGUAGE_NOT_SUPPORTED");
  });
});

describe("Iya entry-pack x402 adapter", () => {
  it.each(["receipt_failure", "storage_failure", "generation_failure", "unknown_settlement"])("handles %s without charging twice or leaking unconfirmed delivery", async (mode) => {
    let settlements = 0;
    let executions = 0;
    const handler = createPaidToolHandler<EntryPackInput>({
      toolName: "get_entry_pack", resource: { url: "x402://get_entry_pack", description: "test" },
      env: { DB: fakeDb(mode === "receipt_failure", mode === "storage_failure") } as Env,
      config, initialize: async () => {},
      resourceServer: {
        buildPaymentRequirements: async () => [], findMatchingRequirements: () => ({}),
        verifyPayment: async () => ({ isValid: true }),
        settlePayment: async () => { settlements++; if (mode === "unknown_settlement") throw new Error("timeout"); return { success: true, transaction: "tx" }; }
      },
      execute: () => { executions++; if (mode === "generation_failure") throw new Error("generation failed"); return { private_delivery: "original" }; }
    });
    const input = { pack_id: ENTRY_PACK_ID, language: "en" };
    const extra = { _meta: { "x402/payment": btoa("{}") } };
    if (mode === "storage_failure") {
      await expect(handler(input, extra)).rejects.toThrow("storage unavailable");
      expect(settlements).toBe(0);
      return;
    }
    const first = await handler(input, extra);
    if (mode === "generation_failure") { expect(settlements).toBe(0); expect(JSON.stringify(first)).not.toContain("private_delivery"); return; }
    const replay = await handler(input, extra);
    expect(settlements).toBe(1);
    expect(executions).toBe(1);
    for (const response of [first, replay]) {
      if (mode === "receipt_failure") expect(JSON.parse(response.content[0]!.text)).toMatchObject({ private_delivery: "original", receipt: { transaction: "tx" } });
      else expect(JSON.stringify(response)).not.toContain("private_delivery");
    }
  });
  it("requires payment, delivers after a mock payment, replays the saved version, and rejects changed input", async () => {
    let facilitatorUnavailable = false;
    const handler = createPaidToolHandler<EntryPackInput>({
      toolName: "get_entry_pack",
      resource: { url: "x402://get_entry_pack", description: "Fixed Iya entry pack" },
      env: { DB: fakeDb() } as Env,
      config,
      initialize: async () => { if (facilitatorUnavailable) throw new Error("facilitator offline"); },
      resourceServer: {
        buildPaymentRequirements: async () => [{ test: true }],
        findMatchingRequirements: () => ({ test: true }),
        verifyPayment: async () => ({ isValid: true, payer: "0x2222222222222222222222222222222222222222" }),
        settlePayment: async () => ({ success: true, transaction: "mock-tx", network: config.network })
      },
      execute: (input) => getEntryPack(input)!
    });
    const input = { pack_id: ENTRY_PACK_ID, language: "en" };

    const unpaid = await handler(input, {});
    expect("isError" in unpaid && unpaid.isError).toBe(true);
    expect(JSON.stringify(unpaid)).not.toContain("consultation_brief_en");

    const proof = btoa(JSON.stringify({ mock: "payment" }));
    const paid = await handler(input, { _meta: { "x402/payment": proof } });
    expect(JSON.parse(paid.content[0]!.text)).toMatchObject({ pack_id: ENTRY_PACK_ID, content_version: "2026-09-08.2" });

    facilitatorUnavailable = true;
    const replay = await handler(input, { _meta: { "x402/payment": proof } });
    expect(JSON.parse(replay.content[0]!.text)).toMatchObject({ pack_id: ENTRY_PACK_ID, content_version: "2026-09-08.2" });

    const misuse = await handler({ ...input, language: "ja" }, { _meta: { "x402/payment": proof } });
    expect(JSON.parse(misuse.content[0]!.text)).toMatchObject({ error: "payment_reuse_rejected" });
  });
});
