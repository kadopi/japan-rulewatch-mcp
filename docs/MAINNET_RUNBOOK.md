# Mainnet release runbook

Status: preparation only. Nothing in this file authorizes deployment or a real payment.

1. Complete the commercial legal review and record any required copy changes.
2. Confirm the Base Mainnet USDC recipient address with the operator.
3. Re-authenticate Wrangler without pasting credentials into source or chat.
4. Create a dedicated D1 database named `japan-rulewatch-purchases-mainnet`.
5. Copy `wrangler.mainnet.example.jsonc` to ignored `wrangler.mainnet.local.jsonc`.
6. Replace both placeholders with the confirmed recipient and new D1 database ID.
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
