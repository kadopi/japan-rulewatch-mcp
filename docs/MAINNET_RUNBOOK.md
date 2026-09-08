# Mainnet release runbook

Status: preparation only. Nothing in this file authorizes deployment or a real payment.

1. Complete the commercial legal review and record any required copy changes.
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
