# Mainnet release runbook

Status: Mainnet Worker deployed and sale gate opened on 2026-09-08 under explicit approval. Nothing in this file authorizes a real payment.

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
- Live endpoint: https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp . Health passes; an unpaid first call returns `PURCHASE_CONFIRMATION_REQUIRED` with the current terms snapshot/hash. A confirmation-complete call, without a payment signature, returns `PAYMENT_REQUIRED` for exactly 5 USDC on Base Mainnet. No payment was made during this check.
- Official instructions: https://docs.cdp.coinbase.com/api-reference/v2/authentication

## Current real-payment test sequence

1. Terra preflight is complete: source-informed terms, buyer confirmation gate,
   31 tests, Mainnet dry-run, and live unpaid 5-USDC requirement check passed.
2. Astra reviews the current recipient, terms snapshot/hash, and test input
   immediately before payment.
3. Use the operator-confirmed Base Mainnet USDC recipient
   `0x5dc8c4a19ffd5dee720c3321a307d2a948d55656`.
4. Use dedicated D1 `japan-rulewatch-purchases-mainnet`
   (`b225aca0-3ac1-4fef-9968-d2275f84cf2b`).
5. On the buyer's own wallet, review the exact 5-USDC Base payment request
   after providing the current terms version/hash, business purchase confirmation,
   business name, and ISO country code.
6. Obtain separate approval for that one payment signature, then execute it.
7. Immediately record the tool receipt, transaction hash, D1 settled record,
   delivery result, and recipient balance. Confirm same-proof retrieval once;
   do not create a second payment.

Fixed Mainnet payment settings:

- Network: Base Mainnet (`eip155:8453`)
- Asset: native Base USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Amount: `5000000` atomic units (5 USDC)
- Facilitator: `https://api.cdp.coinbase.com/platform/v2/x402`
- Saved-result window: seven days under the existing replay constraints

Stop conditions: recipient mismatch, shared Testnet/Mainnet D1, missing sale price,
failed migration, failed tests, unexpected 402 amount, or unsettled reconciliation.
