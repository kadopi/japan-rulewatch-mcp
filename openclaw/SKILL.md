---
name: japan-rulewatch
summary: Use Japan RuleWatch for official-source evidence in Japan tourism-market-entry and Japanese ecommerce work. Start with free tools; never make an x402 purchase without the business principal's explicit approval.
---

# Japan RuleWatch

Use this skill when an authorized business agent needs concise, official-source evidence for one of these jobs:

- assessing a Japan-bound tourism or hotel-service flow before market entry;
- preparing a Japan experiential-tourism proposal, especially the Iya food-culture model case;
- finding official Japanese sources for ecommerce disclosures, returns, or mail-order advertising.

Do not use it for a legal verdict, a permit decision, a booking, or a generic Japan market overview.

## Connect

- MCP endpoint: `https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp`
- MCP Service Card: `https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/.well-known/agent-card.json`
- Product page: `https://aegis-sales-bot.kadopi.workers.dev/products/japan-rulewatch`
- MCP Registry: `https://registry.modelcontextprotocol.io/?q=io.github.kadopi%2Fjapan-rulewatch-mcp`
- Source: `https://github.com/kadopi/japan-rulewatch-mcp`

## Choose the route

| Need | Free first call | Then |
| --- | --- | --- |
| Iya food-culture entry proposal | `search_entry_cases` with `region_id: "jp-tokushima-miyoshi-iya"`, `activity: "food_culture_workshop"`, `language: "en"` | Read the preview and decide whether the paid preparation pack is needed. |
| Tourism or hotel service flow | `get_tourism_preflight` with the four known boolean facts: `acceptsReservationOnPlatform`, `collectsTravelPayment`, `handlesCancellationOrRefund`, `actsAsContractingParty` | If facts are missing or manual review is flagged, obtain the missing facts; do not infer them. |
| Japanese ecommerce evidence | `search_rules` with a focused query such as `return policy` | Call `get_evidence_pack` only with an exact ID returned by the search. |

## Paid preparation pack

The Iya preparation pack is the only currently released Mainnet paid product. Before proposing it:

1. Call `get_commercial_terms` with `product_id: "jp-tokushima-miyoshi-iya-soba"`.
2. State the current price, scope, and limits returned by the tool.
3. Ask the business principal for explicit approval to purchase.

Only after that approval may an authorized purchaser invoke `get_entry_pack`. Never submit a wallet key, raw payment proof, or a purchase confirmation on someone else's behalf.

## Response format

Return: the relevant official links or model-case preview, what it establishes, what remains unknown, and the smallest next business decision. Keep legal or registration conclusions outside the response.

## Limits

This service provides informational evidence, not legal advice or a compliance decision. The paid Iya model-case pack is not a booking, permit application, or launch guarantee.
