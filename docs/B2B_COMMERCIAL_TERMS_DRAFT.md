# Japan Rule B2B commercial terms draft

Status: source-informed release candidate, 2026-09-08. Local draft; not yet
deployed. Paid professional advice is not a blanket release requirement.
Sales activation remains a separate operator decision.

## 運営者向け要約

- 事業者（個人事業者を含む）と、その権限で購入するAIエージェント向け。
- 英語の固定情報パック1件、総額5 USDC。適用される売主側の消費税等を含み、後から追加請求しない。
- 購入者が利用するウォレット・交換業者等の費用は当該業者の表示による。売主独自の追加手数料はない。
- 決済確認後、通常は同じリクエスト内で提供。同じ購入証跡で7日間再取得できる。
- 正常提供後のお客様都合の取消は不可。未提供は再提供を優先し、提供不能と決済を確認した場合は5 USDCを返金する。
- 返金は原則としてBase上の元の支払元へ。受領できないアドレスの場合は本人確認・安全な受領方法の確認後に対応する。
- 日本法を準拠法とし、第一審は事案に応じ松山地方裁判所または松山簡易裁判所とする。
- 問い合わせは既存メール。回答期限・自動返金は約束しない。法令上排除できない権利は制限しない。

以下の英語条項が購入者向け案。上記日本語は運営者確認用の要約。

## 1. Buyer eligibility

Japan Rule sells the entry pack only to a business, including a sole proprietor,
or an AI agent acting under authority for that business. The business principal
is the purchaser and is responsible for its agent's authorized actions.
The service is not offered for household
consumer use. By submitting payment, the buyer represents that this eligibility
condition is met.

Before a new payment request, the buyer must provide its business name and the
ISO country code of its residence or principal office, confirm its authority to
buy for business use, and accept the version and hash of these terms shown by
the service. This is a buyer declaration, not identity verification or an
automatic tax classification. It is saved with the purchase result for delivery,
support, and accounting.

## 2. Product and delivery

The product is the fixed `jp-tokushima-miyoshi-iya-soba` information pack in
English. It is an informational evidence pack, not legal advice, a compliance
verdict, booking service, government application, or government fee.

Delivery is immediate after a successfully settled x402 payment. The same proof
may retrieve the saved delivered version for seven days only, under the existing
same-proof, tool, normalized-input, price-condition, and content-version rules.
Future versions and indefinite storage are not included.

## 3. Price and payment

The total amount payable to the seller is 5 USDC for one pack purchase on Base
Mainnet through x402, including any applicable Japanese consumption tax charged
by the seller. The seller will not add tax or a handling fee after purchase.
Any independent wallet, network or exchange-provider charges are payable under
that provider's terms and should be checked before authorization. There is no
subscription or automatic renewal. Payment is settled before release of the pack.
An arbitrary direct wallet transfer does not constitute an x402 purchase.

## 4. Delivery failure and refund policy

Change-of-mind cancellation is not offered after the described pack has been
successfully provided. This does not exclude remedies for non-delivery, a
material failure to match the agreed description, or rights that cannot legally
be excluded. A
settled purchase may retrieve its prepared delivery with the same proof for seven
days. If the delivery remains technically unavailable after support review, the
seller will refund the confirmed 5 USDC payment. Refunds are reviewed manually
and normally sent on Base to the original payer address after checking the
purchase and its ability to receive the refund. If that address cannot safely
receive it, an authenticated alternative must be agreed; an emailed replacement
address alone is insufficient. The seller bears its refund transaction fee.
Independent third-party charges and exchange-rate changes are not included in
the ordinary purchase-price refund. Mandatory legal remedies remain available;
this is not a general exclusion of liability for seller misconduct.
Current technical behavior: delivery is prepared and persisted before settlement.
Saved results can be retrieved with the same proof after settlement is recorded,
including when the final receipt/result update failed but the transaction was saved.
Unconfirmed settlement or missing saved delivery requires support with the purchase ID and transaction reference;
do not pay again or send raw payment proofs to support. A seven-day waiting
period is not required. The seven-day retrieval window does not extinguish a
claim for non-delivery. A material mismatch should be reported for correction
or re-delivery; if it cannot be remedied, the same purchase-price refund applies.

## 5. Operator and support

- Contracting seller: 門屋哲朗 (individual business owner, trading as ぬこファクトリー)
- Business address: 〒790-0012 愛媛県松山市湊町４丁目５－６プログレッソ松山
- Responsible person: 門屋哲朗
- Support email: kadoya@nuko-factory.com
- Normal delivery and retrieval are automated; email is for unresolved purchase exceptions only.
- No response deadline or response-time SLA is promised.
- Include the purchase ID and transaction reference if available; never send private keys or raw payment proofs.

## 6. Governing terms

Japanese law governs this purchase. To the extent permitted by applicable law,
the Matsuyama District Court or Matsuyama Summary Court, as appropriate to the
case, has exclusive jurisdiction at first instance over disputes arising from
this purchase. Mandatory rules and jurisdiction that cannot be excluded prevail.
The English purchase terms control over convenience translations.
The version disclosed and agreed before payment applies to that purchase;
later revisions do not retroactively reduce its rights.

## 7. Data handling

The payment ledger stores a payment fingerprint, payer address where returned by
the facilitator, tool name, normalized-input hash, network, asset, amount,
settlement reference, delivery result, and expiry timestamps. It does not store
private keys or raw payment proofs. These records and support correspondence
are used for delivery, recovery, fraud prevention, dispute handling and the
seller's accounting obligations. Cloudflare hosts the service and CDP processes
payment verification/settlement; blockchain transactions are publicly visible.
Seven days is the delivery-retrieval window, not a promise to delete accounting
or support records. The seller retains necessary records for their applicable
business/legal purpose and handles data requests through the support email.

## Remaining factual and implementation checks

1. The operator confirmed the contracting seller is 門屋哲朗, an individual
   business owner trading as ぬこファクトリー. Telephone disclosure, if applicable,
   still needs a real contact.
2. Display and bind the applicable terms before payment; the free terms tool
   alone is not evidence that a buyer agreed. The sales gate remains closed.
3. Integrate USDC transaction records into the operator's existing annual filing
   process; see `COMMERCIAL_LEGAL_REVIEW.md`. No new accountant contract is required.
4. No automatic refund implementation is promised by these terms.
