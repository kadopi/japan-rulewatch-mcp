# Japan RuleWatch

Read-only Remote MCP for official Japanese rule evidence. The tourism pack targets overseas OTA and travel-tech teams implementing Japan-bound hotel flows.

It exposes the existing evidence tools plus one fixed tourism-entry product over stateless Streamable HTTP:

- `search_rules` and `get_evidence_pack`: free ecommerce evidence lookup.
- `get_tourism_preflight`: free A/B/C service-flow classification, missing facts, and manual-review triggers.
- `get_tourism_evidence_pack`: x402-paid tourism evidence pack for a complete supported A/B/C flow.
- `search_entry_cases`: free search for the Iya soba experience sample and its known gaps.
- `get_entry_pack`: paid retrieval of the fixed Iya soba entry-preparation pack.

The paid pack returns official URLs, evidence locations, checked dates, source versions, general requirements, traveler-screen checks, and re-check triggers. It does not determine legal compliance, travel-business registration requirements, or legal risk for a particular service.

## Public endpoint

`https://japan-rulewatch-mcp.kadopi.workers.dev/mcp`

## Tourism flow

Call `get_tourism_preflight` first with the four service-flow facts. Incomplete or unsupported facts remain free and return missing facts or a manual-review trigger. A complete supported flow can call `get_tourism_evidence_pack`; its x402 402 response is the authoritative payment requirement.

The approved provisional price for `get_entry_pack` is 5 USDC per single purchase. The saved result can be retrieved for seven days with the same payment proof, tool, normalized input, price condition, and content version. Future versions and indefinite storage are not included. Base Sepolia uses 0.01 test USDC only for integration verification. `X402_TEST_PRICE_USD` and `X402_SALE_PRICE_USD` are separate settings. Mainnet is not deployed or verified.

Mainnet preparation is documented in `docs/MAINNET_RUNBOOK.md`. The checked-in
`wrangler.mainnet.example.jsonc` is intentionally non-deployable until a dedicated
Mainnet D1 database and confirmed receiving address replace its placeholders.
The pre-release commercial checklist is in `docs/COMMERCIAL_LEGAL_REVIEW.md`.

Japan Rule is an independent, privately operated commercial information service. It is not operated by a government or municipality. Official-source links do not imply affiliation or endorsement. The fee covers Japan Rule's information service, not a government application or permit fee.

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
