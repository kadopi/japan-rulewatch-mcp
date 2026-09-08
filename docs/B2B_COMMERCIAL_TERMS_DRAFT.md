# Japan Rule B2B commercial terms draft

Status: operator decision draft. Do not publish or present this as final terms
until every `[OPERATOR TO CONFIRM]` field is completed and legal/tax review is
accepted.

## 1. Buyer eligibility

Japan Rule sells the entry pack only to a business entity, or an AI agent acting
under authority for a business entity. The service is not offered for household
consumer use. By submitting payment, the buyer represents that this eligibility
condition is met.

## 2. Product and delivery

The product is the fixed `jp-tokushima-miyoshi-iya-soba` information pack in
English. It is an informational evidence pack, not legal advice, a compliance
verdict, booking service, government application, or government fee.

Delivery is immediate after a successfully settled x402 payment. The same proof
may retrieve the saved delivered version for seven days only, under the existing
same-proof, tool, normalized-input, price-condition, and content-version rules.
Future versions and indefinite storage are not included.

## 3. Price and payment

Price: 5 USDC for one pack purchase, paid on Base Mainnet through x402.
Network/wallet cost allocation and seller tax treatment: `[OPERATOR TO CONFIRM]`.

## 4. Delivery failure and refund policy

Refund policy: `[OPERATOR TO CONFIRM]`.
Current technical behavior: delivery is prepared and persisted before settlement.
Saved results can be retrieved with the same proof after settlement is recorded,
including when the final receipt/result update failed but the transaction was saved.
Unconfirmed settlement or missing saved delivery requires support with the purchase ID and transaction reference;
do not pay again or send raw payment proofs to support. A seven-day waiting
period is not required. Refund/remedy policy remains unconfirmed.

## 5. Operator and support

- Seller name supplied by operator: ぬこファクトリー
- Business address: 〒790-0012 愛媛県松山市湊町４丁目５－６プログレッソ松山
- Responsible person: 門屋哲朗
- Support email: kadoya@nuko-factory.com
- Normal delivery and retrieval are automated; email is for unresolved purchase exceptions only.
- No response deadline or response-time SLA is promised.
- Include the purchase ID and transaction reference if available; never send private keys or raw payment proofs.

## 6. Governing terms

Recommended default: English is the controlling language for the B2B service.
Governing law and forum: `[OPERATOR AND COUNSEL TO CONFIRM]`.

## 7. Data handling

The payment ledger stores a payment fingerprint, payer address where returned by
the facilitator, tool name, normalized-input hash, network, asset, amount,
settlement reference, delivery result, and expiry timestamps. It does not store
private keys or raw payment proofs. A public privacy/data notice still requires
operator approval.

## Decisions required from the operator

1. Confirm contracting seller identity (trade name/person/entity). Publication of the supplied details is approved.
2. Whether the recommended delivery-failure remedy is accepted.
3. Support policy is confirmed: automated normal operation, exception email, no promised response deadline.
4. Governing law and forum after legal advice.
5. Tax treatment and accounting process for USDC receipts.
