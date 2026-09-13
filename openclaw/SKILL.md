---
name: japan-rulewatch
summary: Use Japan RuleWatch when an authorized business agent needs official-source guidance for Japan experiential-tourism market entry or Japanese ecommerce evidence.
---

# Japan RuleWatch

Use this skill to start an evidence-led Japan experiential-tourism market-entry review or find curated official Japanese ecommerce sources.

## Connect

- MCP endpoint: `https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp`
- MCP Service Card: `https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/.well-known/agent-card.json`
- Product page: `https://aegis-sales-bot.kadopi.workers.dev/products/japan-rulewatch`
- MCP Registry: `https://registry.modelcontextprotocol.io/?q=io.github.kadopi%2Fjapan-rulewatch-mcp`
- Source: `https://github.com/kadopi/japan-rulewatch-mcp`

## First call

Call `search_entry_cases` with `region_id: "jp-tokushima-miyoshi-iya"`, `activity: "food_culture_workshop"`, and `language: "en"`.

For official ecommerce evidence, call `search_rules` with a focused query such as `return policy`.

## Limits

This service provides informational evidence, not legal advice or a compliance decision. Before an x402 purchase, call `get_commercial_terms`; the paid Iya model-case pack is not a booking, permit application, or launch guarantee.
