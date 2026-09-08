# Mainnet release runbook

Status: Mainnet Worker deployed with sales closed on 2026-09-08 under explicit approval. Nothing in this file authorizes sales activation or a real payment.

## CDP authentication setup

- In https://portal.cdp.coinbase.com/ select the intended project, then API Keys > Secret API Keys > Create API key.
- Suggested name: `japan-rulewatch-mainnet`. Use Ed25519 as recommended by CDP.
- Save the key ID and secret securely (for example in 1Password); never paste them into chat, source, or shell command arguments.
- Required Worker secret names: `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`. A client API key or wallet secret is not a substitute.
- Guide the operator through secure secret entry separately; do not deploy a Worker just to install secrets without deployment approval.
- `src/facilitator.ts` generates authorization only for the exact CDP facilitator URL. Missing keys fail when authentication is requested, not when free tools are registered.
- After key setup, verify only GET `/supported` and Base Mainnet `exact` support first; this does not prove settlement works.
- Local check: `npm run check:cdp -- <1Password-item-id>`, with fields labeled `API key ID` and `Secret`. The script reads through the authenticated 1Password CLI into process memory and prints only sanitized status, never credentials or JWTs.
- Verified 2026-09-08: local HTTP 200 and Base Mainnet x402 v2 `exact` support. Both Worker secret names verified after registration from 1Password through stdin without plaintext files. Deployed-Worker CDP authentication and settlement remain untested.
- Live endpoint: https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp . Health passes; `get_entry_pack` returns `COMMERCIAL_TERMS_NOT_READY` with `paymentRequired: false`. Sales remain closed.
- Official instructions: https://docs.cdp.coinbase.com/api-reference/v2/authentication

## Release sequence

1. Review the source-informed commercial terms and resolve concrete disclosure/input gaps. Paid professional sign-off is not a blanket requirement.
2. Use the operator-confirmed Base Mainnet USDC recipient
   `0x5dc8c4a19ffd5dee720c3321a307d2a948d55656`.
3. Re-authenticate Wrangler without pasting credentials into source or chat.
4. Use dedicated D1 `japan-rulewatch-purchases-mainnet`
   (`b225aca0-3ac1-4fef-9968-d2275f84cf2b`).
5. Copy `wrangler.mainnet.example.jsonc` to ignored `wrangler.mainnet.local.jsonc`.
6. Confirm the checked-in recipient still matches the intended receiving wallet.
7. Apply `migrations/0001_purchases.sql` to that Mainnet D1 database.
8. Run `npm run check`, `npm test`, `git diff --check`, and a secret scan.
9. Run `wrangler deploy --dry-run --config <local-mainnet-config>`.
10. Obtain explicit approval for the named Mainnet Worker deployment.
11. Deploy, then confirm the free search and unpaid 5-USDC payment requirement.
12. Obtain separate approval for one real 5-USDC purchase test.
13. Reconcile the tool receipt, D1 settled record, transaction, and recipient balance.

Fixed Mainnet payment settings:

- Network: Base Mainnet (`eip155:8453`)
- Asset: native Base USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Amount: `5000000` atomic units (5 USDC)
- Facilitator: `https://api.cdp.coinbase.com/platform/v2/x402`
- Saved-result window: seven days under the existing replay constraints

Stop conditions: recipient mismatch, shared Testnet/Mainnet D1, missing sale price,
failed migration, failed tests, unexpected 402 amount, or unsettled reconciliation.
