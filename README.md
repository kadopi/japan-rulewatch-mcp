# Japan RuleWatch

Read-only Remote MCP for official Japanese rule evidence. The tourism pack targets overseas OTA and travel-tech teams implementing Japan-bound hotel flows.

It exposes four tools over stateless Streamable HTTP:

- `search_rules` and `get_evidence_pack`: free ecommerce evidence lookup.
- `get_tourism_preflight`: free A/B/C service-flow classification, missing facts, and manual-review triggers.
- `get_tourism_evidence_pack`: x402-paid tourism evidence pack for a complete supported A/B/C flow.

The paid pack returns official URLs, evidence locations, checked dates, source versions, general requirements, traveler-screen checks, and re-check triggers. It does not determine legal compliance, travel-business registration requirements, or legal risk for a particular service.

## Public endpoint

`https://japan-rulewatch-mcp.kadopi.workers.dev/mcp`

## Tourism flow

Call `get_tourism_preflight` first with the four service-flow facts. Incomplete or unsupported facts remain free and return missing facts or a manual-review trigger. A complete supported flow can call `get_tourism_evidence_pack`; its x402 402 response is the authoritative payment requirement.

The commercial hypothesis is 25 USDC per evidence pack. Base Sepolia uses 0.01 test USDC only for integration verification. Mainnet is not deployed or verified.

## Example: find official sources for a Japanese ecommerce workflow

Use Japan RuleWatch to find curated official sources when researching mail-order advertising and return-policy disclosures for a Japanese online store.

Connect your MCP client to the public endpoint above.

1. Call `search_rules` with `{"query":"return policy","limit":2}`.
2. Choose a returned ID and call `get_evidence_pack`, for example `{"id":"caa-mail-order-advertising-qa"}`.

The response includes an official source URL, a short summary, and scope limitations. Open the official source to verify its current content before using it. This is a small curated index, not a live legal-update feed, a website scanner, or a compliance verdict. `retrievedAt` is the response time, not the date the official source was last verified.

## Local development

```bash
npm install
npx wrangler d1 create your-japan-rulewatch-purchases
# Replace the Worker name, D1 name/ID, and receiving address placeholders in wrangler.jsonc.
npx wrangler d1 execute your-japan-rulewatch-purchases --local --file migrations/0001_purchases.sql
npm run check
npm test
npm run dev
```

Endpoints:

- `GET /`
- `GET /health`
- MCP Streamable HTTP: `/mcp`

## Safety boundary

- Official HTTPS sources only
- Fixed local dataset; no arbitrary URL fetching
- Read-only tools
- Inputs limited by schema; incomplete tourism requests are never charged
- D1 retains payment state and saved paid results; no private key or raw proof
- Outputs are informational evidence, not legal advice

Deployment is manual and requires explicit approval.
