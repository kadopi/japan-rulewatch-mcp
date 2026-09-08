import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createAuthHeader } from "@coinbase/x402";

// Read credentials only into process memory. Never print raw CLI/API errors,
// secrets, JWTs, payer addresses, or the complete supported response.
const itemId = process.argv[2];
if (!itemId) {
  console.error("Usage: npm run check:cdp -- <1Password-item-id>");
  process.exit(1);
}
let stage = "onepassword_read";
try {
  const { stdout } = await promisify(execFile)("op", ["item", "get", itemId, "--format", "json"], { maxBuffer: 1024 * 1024, timeout: 120000 });
  const item = JSON.parse(stdout);
  const field = label => {
    const matches = (item.fields ?? []).filter(f => f.label === label);
    if (matches.length !== 1 || !matches[0].value?.trim()) throw new Error("missing_or_ambiguous_field");
    return matches[0].value;
  };
  stage = "jwt_generation";
  const authorization = await createAuthHeader(field("API key ID"), field("Secret"), "GET", "api.cdp.coinbase.com", "/platform/v2/x402/supported");
  stage = "supported_request";
  const response = await fetch("https://api.cdp.coinbase.com/platform/v2/x402/supported", {
    headers: { Authorization: authorization }, redirect: "error", signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    console.log(JSON.stringify({ status: "failed", stage, http_status: response.status, settlement_attempted: false }));
    process.exitCode = 1;
  } else {
    stage = "supported_response";
    const body = await response.json();
    const supported = Array.isArray(body.kinds) && body.kinds.some(k => k.x402Version === 2 && k.scheme === "exact" && k.network === "eip155:8453");
    console.log(JSON.stringify({ status: supported ? "ok" : "unsupported", http_status: response.status, base_mainnet_x402_v2_exact: supported, settlement_attempted: false }));
    if (!supported) process.exitCode = 1;
  }
} catch {
  console.error(JSON.stringify({ status: "failed", stage, settlement_attempted: false }));
  process.exitCode = 1;
}
