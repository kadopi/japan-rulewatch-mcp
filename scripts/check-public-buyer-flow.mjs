import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// A no-key, no-payment buyer-flow check against the public Mainnet endpoint.
const endpoint = "https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp";
const expected = {
  network: "eip155:8453",
  asset: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  amount: "5000000",
  payTo: "0x5dc8c4a19ffd5dee720c3321a307d2a948d55656"
};

function textJson(result) {
  const text = result?.content?.find(block => block.type === "text")?.text;
  if (!text) throw new Error("missing_text_content");
  return JSON.parse(text);
}

let stage = "connect";
try {
  const client = new Client({ name: "japan-rulewatch-public-buyer-check", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  await client.connect(transport);

  stage = "tool_discovery";
  const tools = await client.listTools();
  if (!tools.tools.some(tool => tool.name === "get_commercial_terms") || !tools.tools.some(tool => tool.name === "get_entry_pack")) throw new Error("paid_tools_not_discoverable");

  stage = "commercial_terms";
  const terms = textJson(await client.callTool({ name: "get_commercial_terms", arguments: { product_id: "jp-tokushima-miyoshi-iya-soba" } }));
  if (terms.status !== "ready") throw new Error("commercial_terms_not_ready");

  const input = { pack_id: "jp-tokushima-miyoshi-iya-soba", language: "en" };
  stage = "purchase_confirmation";
  const first = await client.callTool({ name: "get_entry_pack", arguments: input });
  const confirmation = textJson(first);
  if (!first.isError || confirmation.error !== "PURCHASE_CONFIRMATION_REQUIRED" || typeof confirmation.terms?.terms_version !== "string" || !/^[a-f0-9]{64}$/.test(confirmation.terms_sha256 ?? "")) throw new Error("purchase_confirmation_not_returned");

  stage = "payment_requirement";
  const request = await client.callTool({
    name: "get_entry_pack",
    arguments: {
      ...input,
      accepted_terms_version: confirmation.terms.terms_version,
      accepted_terms_sha256: confirmation.terms_sha256,
      business_purchase_confirmed: true,
      buyer_business_name: "Public buyer-flow check",
      buyer_country_code: "JP"
    }
  });
  const payment = request._meta?.["x402/error"];
  const accept = Array.isArray(payment?.accepts) && payment.accepts.length === 1 ? payment.accepts[0] : undefined;
  const valid = request.isError && payment?.x402Version === 2 && payment?.error === "PAYMENT_REQUIRED" &&
    accept?.scheme === "exact" && accept.network === expected.network && accept.asset?.toLowerCase() === expected.asset &&
    accept.amount === expected.amount && accept.payTo?.toLowerCase() === expected.payTo;
  if (!valid) throw new Error("payment_requirement_mismatch");

  console.log(JSON.stringify({
    status: "ready_for_external_buyers",
    public_tools_discoverable: true,
    terms_disclosed: true,
    business_confirmation_required: true,
    exact_base_usdc_requirement_verified: true,
    payment_attempted: false
  }));
  await transport.close();
} catch {
  console.error(JSON.stringify({ status: "failed", stage, payment_attempted: false }));
  process.exitCode = 1;
}
