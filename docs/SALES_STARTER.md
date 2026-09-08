# Japan RuleWatch sales starter

## 商品案内（日本語）

Japan RuleWatchは、訪日観光サービスの企画初期に必要な公式根拠を、AIエージェントが扱える構造化パックで提供するMCPです。最初の商品は、徳島県三好市・祖谷の既存そば打ち体験を題材にした英語のエントリー準備パックです。

購入者は、公式情報のURL・確認箇所・確認日・一般的な要件・旅行者画面の確認項目・再確認が必要になる条件を受け取れます。個別案件の適法判定、提携可否、予約実行、許認可申請は含みません。

- 対象: 事業者、およびその権限で利用するAIエージェント
- 価格: Base Mainnetで5 USDC、1回購入
- 提供: x402決済の成功後すぐに配信。購入証跡が同じ場合は7日間再取得可能
- MCP接続先: `https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp`
- 開始方法: `get_commercial_terms` で条件を確認し、`get_entry_pack` の初回呼出しで表示される条件バージョンとハッシュを受け取る。事業者確認、事業者名、国コードを送ると正確な5 USDCの支払い要求を返す。

## Directory listing copy (English)

**Name**: Japan RuleWatch

**Short description**: Official-source evidence MCP for Japan-bound travel product planning. Includes a business-only, fixed entry-preparation pack paid with 5 USDC on Base Mainnet.

**Who it is for**: Travel-tech teams, OTAs, and AI agents authorized by a business principal that need a source-backed starting point for a Japan tourism product.

**Current paid pack**: `jp-tokushima-miyoshi-iya-soba` is an English preparation pack for a proposed six-person soba workshop at an existing provider in Iya, Miyoshi, Tokushima. It includes official source URLs, checked locations and dates, general requirement questions, traveler-screen checks, and re-check triggers. The venue is not a confirmed partner and the pack is not legal advice, a compliance verdict, booking, or a government service.

**Price and delivery**: 5 USDC per purchase on Base Mainnet through x402. After successful settlement, the service returns the pack and a purchase receipt. The same payment proof can retrieve the saved result for seven days.

**Connection**: `https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp`

**Purchase flow**: Call `get_commercial_terms`, then call `get_entry_pack` once to receive the current purchase terms version and hash. Submit those values with business-use confirmation, the contracting business name, and its ISO country code to receive the payment requirement.

## First listing candidates

1. **Smithery** — first choice. It accepts a public Streamable HTTP MCP URL and scans the server metadata and tools. Submit the Mainnet endpoint above using its hosted-server publishing flow.
2. **Glama** — second choice. It accepts a GitHub repository or remote connector. Submit `https://github.com/kadopi/japan-rulewatch-mcp` with the Mainnet endpoint as the connector target.

Both listings are external publication actions. Publish the Smithery listing first, then verify its displayed endpoint, price, and business-only scope before deciding on Glama.
