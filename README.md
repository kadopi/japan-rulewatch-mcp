# Japan RuleWatch

Remote MCP for official Japanese rule evidence. The current paid Mainnet product is a fixed Japan tourism entry-preparation pack for businesses and AI agents acting for an authorized business principal.

It exposes the existing evidence tools plus one fixed tourism-entry product over stateless Streamable HTTP:

- `search_rules` and `get_evidence_pack`: free ecommerce evidence lookup.
- `get_tourism_preflight`: free A/B/C service-flow classification, missing facts, and manual-review triggers.
- `get_tourism_evidence_pack`: x402-paid tourism evidence pack for a complete supported A/B/C flow.
- `get_commercial_terms`: free commercial-terms profile and Mainnet sale-readiness for a paid product.
- `search_entry_cases`: free search for the Iya soba experience sample and its known gaps.
- `get_entry_pack`: paid retrieval of the fixed Iya soba entry-preparation pack.

The paid pack returns official URLs, evidence locations, checked dates, source versions, general requirements, traveler-screen checks, and re-check triggers. It does not determine legal compliance, travel-business registration requirements, or legal risk for a particular service.

## Mainnet endpoint

`https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp`

## Paid Mainnet purchase flow

1. Call `get_commercial_terms` with `jp-tokushima-miyoshi-iya-soba` to read the business-only purchase conditions.
2. Call `get_entry_pack` with `{"pack_id":"jp-tokushima-miyoshi-iya-soba","language":"en"}`. The service returns the current terms version and hash, without requesting payment.
3. Submit the returned terms version and hash with `business_purchase_confirmed: true`, the contracting business name, and its ISO country code.
4. The service returns an x402 payment request for exactly 5 USDC on Base Mainnet. A compatible buyer wallet signs the request and receives the pack and purchase receipt.

The price is 5 USDC for one purchase on Base Mainnet. The saved result can be retrieved for seven days with the same payment proof, tool, normalized input, price condition, and content version. Base Sepolia uses 0.01 test USDC only for integration verification.

The paid service is offered only to businesses and AI agents acting for an
authorized business principal. It is not offered for household consumer use;
submitting payment represents business use under the disclosed purchase terms.
Until the product-specific commercial profile is `ready`, Mainnet paid delivery is
blocked before a payment requirement is returned.
Normal delivery and retrieval are automated. Unresolved purchase exceptions can
be sent to the email in the purchase terms with a purchase ID and transaction
reference. Do not send private keys or raw payment proofs.

The Mainnet runbook, including the first successful 5-USDC payment evidence, is in `docs/MAINNET_RUNBOOK.md`.

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

Mainnet deployment and the first 5-USDC purchase have been verified. Future releases and payments remain separate operational decisions.
