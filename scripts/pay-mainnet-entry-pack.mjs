import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";

// This is intentionally narrowed to the one operator-approved Mainnet test.
// It reads the payer key only into process memory and never prints it, a
// payment payload, or the full delivery. Run without --execute to preflight.
const itemId = process.argv[2];
const execute = process.argv.includes("--execute");
const endpoint = "https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp";
const expected = {
  payer: "0x8ef3d8d7e05c53d30a9c93ef16f301f6658fbe62",
  network: "eip155:8453",
  asset: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  amount: "5000000",
  payTo: "0x5dc8c4a19ffd5dee720c3321a307d2a948d55656"
};

function fail(stage) {
  console.error(JSON.stringify({ status: "failed", stage, payment_attempted: paymentSubmitted }));
  process.exit(1);
}

function contentJson(result) {
  const text = result?.content?.find(block => block.type === "text")?.text;
  if (!text) throw new Error("missing_text_content");
  return JSON.parse(text);
}

let stage = "onepassword_read";
let paymentSubmitted = false;
try {
  if (!itemId) fail("usage_item_id_required");
  const { stdout } = await promisify(execFile)("op", ["item", "get", itemId, "--format", "json"], { maxBuffer: 1024 * 1024, timeout: 120000 });
  const item = JSON.parse(stdout);
  const key = (item.fields ?? []).find(field => field.label === "password")?.value;
  if (typeof key !== "string" || !key.trim()) fail("payer_key_missing");

  stage = "payer_identity";
  const account = privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`);
  if (account.address.toLowerCase() !== expected.payer) fail("payer_address_mismatch");

  stage = "mcp_connect";
  const client = new Client({ name: "japan-rulewatch-mainnet-test", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  await client.connect(transport);

  const input = { pack_id: "jp-tokushima-miyoshi-iya-soba", language: "en" };
  stage = "terms_request";
  const first = await client.callTool({ name: "get_entry_pack", arguments: input });
  const termsRequired = contentJson(first);
  if (!first.isError || termsRequired.error !== "PURCHASE_CONFIRMATION_REQUIRED" ||
      typeof termsRequired.terms?.terms_version !== "string" || !/^[a-f0-9]{64}$/.test(termsRequired.terms_sha256 ?? "")) fail("terms_preflight_mismatch");

  const purchase = {
    ...input,
    accepted_terms_version: termsRequired.terms.terms_version,
    accepted_terms_sha256: termsRequired.terms_sha256,
    business_purchase_confirmed: true,
    buyer_business_name: "ぬこファクトリー",
    buyer_country_code: "JP"
  };
  if (!execute) {
    console.log(JSON.stringify({ status: "ready", payer_verified: true, terms_verified: true, payment_attempted: false }));
    await transport.close();
    process.exit(0);
  }

  stage = "payment_request";
  const required = await client.callTool({ name: "get_entry_pack", arguments: purchase });
  const x402Error = required._meta?.["x402/error"];
  const requirement = Array.isArray(x402Error?.accepts) && x402Error.accepts.length === 1 ? x402Error.accepts[0] : undefined;
  const valid = required.isError && x402Error?.x402Version === 2 && requirement?.scheme === "exact" &&
    requirement.network === expected.network && requirement.asset?.toLowerCase() === expected.asset &&
    requirement.amount === expected.amount && requirement.payTo?.toLowerCase() === expected.payTo;
  if (!valid) fail("payment_requirement_mismatch");
  const paymentClient = x402Client.fromConfig({
    schemes: [{ network: expected.network, client: new ExactEvmScheme(account, { rpcUrl: "https://mainnet.base.org" }) }],
    spendControls: { maxAmountPerPayment: "$5" }
  });
  const paymentPayload = await paymentClient.createPaymentPayload({
    x402Version: 2,
    resource: x402Error.resource,
    accepts: x402Error.accepts,
    extensions: x402Error.extensions
  });
  stage = "payment_submit";
  paymentSubmitted = true;
  const result = await client.callTool({
    name: "get_entry_pack",
    arguments: purchase,
    _meta: { "x402/payment": Buffer.from(JSON.stringify(paymentPayload)).toString("base64") }
  });

  stage = "settlement_response";
  const body = contentJson(result);
  const receipt = body?.receipt;
  if (result.isError || body?.pack_id !== input.pack_id || receipt?.status !== "settled" || !receipt.transaction) fail("settlement_not_confirmed");
  console.log(JSON.stringify({
    status: "settled",
    payment_attempted: true,
    purchase_id: receipt.purchaseId,
    transaction: receipt.transaction,
    network: receipt.network,
    payer: receipt.payer,
    delivery_received: true
  }));
  await transport.close();
} catch {
  console.error(JSON.stringify({ status: "failed", stage, payment_attempted: paymentSubmitted }));
  process.exitCode = 1;
}
