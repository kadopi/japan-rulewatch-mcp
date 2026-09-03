# Japan RuleWatch

Minimal, read-only Remote MCP for official Japanese rule evidence.

Version `0.0.1` covers one topic: Japanese mail-order sales advertising. It exposes two tools over stateless Streamable HTTP:

- `search_rules`
- `get_evidence_pack`

The dataset is a small allowlist of official Consumer Affairs Agency and e-Gov sources. There is no account, authentication, database, crawler, payment, legal-compliance verdict, or write operation.

## Public endpoint

`https://japan-rulewatch-mcp.kadopi.workers.dev/mcp`

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
