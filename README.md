# Japan RuleWatch

Minimal, read-only Remote MCP for official Japanese rule evidence.

Version `0.0.1` covers one topic: Japanese mail-order sales advertising. It exposes two tools over stateless Streamable HTTP:

- `search_rules`
- `get_evidence_pack`

The dataset is a small allowlist of official Consumer Affairs Agency and e-Gov sources. There is no account, authentication, database, crawler, payment, legal-compliance verdict, or write operation.

## Public endpoint

`https://japan-rulewatch-mcp.kadopi.workers.dev/mcp`

## Example: find official sources for a Japanese ecommerce workflow

Use Japan RuleWatch to find curated official sources when researching mail-order advertising and return-policy disclosures for a Japanese online store.

Connect your MCP client to the public endpoint above.

1. Call `search_rules` with `{"query":"return policy","limit":2}`.
2. Choose a returned ID and call `get_evidence_pack`, for example `{"id":"caa-mail-order-advertising-qa"}`.

The response includes an official source URL, a short summary, and scope limitations. Open the official source to verify its current content before using it. This is a small curated index, not a live legal-update feed, a website scanner, or a compliance verdict. `retrievedAt` is the response time, not the date the official source was last verified.

## Local development

```bash
npm install
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
- Inputs limited by schema
- No personal data or request-body persistence
- Outputs are informational evidence, not legal advice

Deployment is manual and requires explicit approval.
