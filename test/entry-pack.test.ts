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
import type { Purchase } from "../src/ledger";

const config = paymentConfig({
  X402_NETWORK: "eip155:84532",
  X402_ASSET: paymentDefaults.baseSepoliaUsdc,
  X402_AMOUNT: "10000",
  X402_TEST_PRICE_USD: "0.01",
  X402_PAY_TO: "0x1111111111111111111111111111111111111111",
  X402_FACILITATOR_URL: "https://x402.org/facilitator"
} as Env);

function fakeDb() {
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
                  result_json: null,
                  error_code: null,
                  created_at: String(values[8]),
                  updated_at: String(values[9]),
                  expires_at: String(values[10])
                };
              } else if (sql.startsWith("UPDATE purchases SET status = 'settled'") && purchase) {
                purchase.status = "settled";
                purchase.transaction_ref = String(values[0]);
                purchase.result_json = String(values[1]);
                purchase.updated_at = String(values[2]);
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
  it("finds the single supported case and discloses scope before purchase", () => {
    const result = searchEntryCases({
      region_id: "jp-tokushima-miyoshi-iya",
      activity: "food_culture_workshop",
      language: "en"
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({ pack_id: ENTRY_PACK_ID });
    expect(result.results[0]?.missing_information).toContain("contracting_party");
    expect(result.results[0]?.purchase_terms).toMatchObject({
      sale_price_usdc: 5,
      saved_result_days: 7,
      future_versions_included: false
    });
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
  it("requires payment, delivers after a mock payment, replays the saved version, and rejects changed input", async () => {
    const handler = createPaidToolHandler<EntryPackInput>({
      toolName: "get_entry_pack",
      resource: { url: "x402://get_entry_pack", description: "Fixed Iya entry pack" },
      env: { DB: fakeDb() } as Env,
      config,
      initialize: async () => {},
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

    const replay = await handler(input, { _meta: { "x402/payment": proof } });
    expect(JSON.parse(replay.content[0]!.text)).toMatchObject({ pack_id: ENTRY_PACK_ID, content_version: "2026-09-08.2" });

    const misuse = await handler({ ...input, language: "ja" }, { _meta: { "x402/payment": proof } });
    expect(JSON.parse(misuse.content[0]!.text)).toMatchObject({ error: "payment_reuse_rejected" });
  });
});
