# Commercial legal review checklist

Status: primary-source desk review only; this is not a lawyer's opinion or an
individual determination of legal compliance.

## Release blockers

1. Publish an easily reachable Specified Commercial Transactions Act notice.
   It should identify the legal seller/operator name, operating address,
   reachable telephone number, and representative or responsible person.
2. State the total consideration and tax treatment, payment method and timing,
   delivery timing, service period, cancellation/refund terms, and support route.
3. Show those terms before the buyer creates the 5-USDC payment signature. The
   buyer must be able to identify the purchase, quantity, total price, delivery,
   and cancellation terms without relying only on post-payment output.
4. Define the digital-delivery failure/refund process. The existing seven-day
   same-proof replay is delivery recovery, not a complete refund policy.
5. Confirm with Japanese counsel whether the MCP/x402 flow is a regulated
   mail-order advertisement/application flow and whether the machine-readable
   payment step satisfies final-confirmation display requirements.
6. Confirm with financial-regulatory counsel that accepting USDC only as payment
   for this operator's own information service does not add registration duties
   for this exact flow. Do not market exchange, custody, brokerage, or transfer.
7. Obtain tax/accounting advice for consumption-tax display, cross-border sales,
   and JPY valuation of USDC receipts.

## Already present

- Fixed product, price, supported input, and seven-day saved-result terms.
- Private commercial operator and no government affiliation/endorsement notice.
- Informational evidence only; no customer-specific legal conclusion.
- Unknown product/language is rejected before payment.

## Primary sources checked on 2026-09-08

- Consumer Affairs Agency, mail-order advertising requirements:
  https://www.no-trouble.caa.go.jp/what/mailorder/advertising.html
- Consumer Affairs Agency, application/final-confirmation guidance:
  https://www.no-trouble.caa.go.jp/what/mailorder/guidelines.html
- Consumer Affairs Agency, final-confirmation summary:
  https://www.caa.go.jp/notice/assets/consumer_transaction_cms203_240315_02.pdf
- Financial Services Agency, FinTech support desk and registration guidance:
  https://www.fsa.go.jp/news/27/sonota/20151214-2.html

## Decision

Mainnet technical preparation may continue, but public sale and the real 5-USDC
test remain on hold until items 1-4 have concrete operator-approved terms and
items 5-7 have qualified professional confirmation or an accepted risk decision.
