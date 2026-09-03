export type RuleRecord = {
  id: string;
  title: string;
  titleEn: string;
  authority: "Consumer Affairs Agency" | "Digital Agency";
  officialUrl: string;
  topics: string[];
  summary: string;
  evidence: string[];
  limitations: string[];
};

export type SearchResult = Pick<
  RuleRecord,
  "id" | "title" | "titleEn" | "authority" | "officialUrl" | "summary"
> & { matchedTopics: string[] };

export const DATASET_UPDATED_AT = "2026-09-03";

export const RULES: readonly RuleRecord[] = [
  {
    id: "specified-commercial-transactions-act",
    title: "特定商取引に関する法律",
    titleEn: "Act on Specified Commercial Transactions",
    authority: "Digital Agency",
    officialUrl: "https://laws.e-gov.go.jp/law/351AC0000000057",
    topics: [
      "通信販売",
      "通販",
      "オンライン販売",
      "広告表示",
      "返品",
      "mail order",
      "ecommerce",
      "online sales",
      "advertising disclosure",
      "returns"
    ],
    summary:
      "Primary statutory text governing specified commercial transactions, including mail-order sales advertising and application-stage disclosures.",
    evidence: [
      "Use the current statutory text as the controlling primary source.",
      "Relevant requirements depend on the transaction type and the actual sales flow."
    ],
    limitations: [
      "This record does not determine whether a specific business falls within the Act.",
      "Confirm the current article text and effective date on e-Gov."
    ]
  },
  {
    id: "caa-mail-order-advertising-overview",
    title: "通信販売広告について",
    titleEn: "Mail-order sales advertising overview",
    authority: "Consumer Affairs Agency",
    officialUrl: "https://www.no-trouble.caa.go.jp/what/mailorder/advertising.php",
    topics: [
      "通信販売",
      "広告",
      "ウェブサイト",
      "電子メール",
      "バナー",
      "mail order",
      "advertising",
      "website",
      "email",
      "banner"
    ],
    summary:
      "Official overview explaining what can constitute mail-order sales advertising across websites, email, banners, and other media.",
    evidence: [
      "Whether content is advertising depends on whether it enables or leads consumers to make a remote application.",
      "The advertising medium is not limited to a particular format."
    ],
    limitations: [
      "The page is an overview; consult the statutory provisions for controlling requirements."
    ]
  },
  {
    id: "caa-mail-order-advertising-qa",
    title: "通信販売広告Q&A",
    titleEn: "Mail-order sales advertising Q&A",
    authority: "Consumer Affairs Agency",
    officialUrl: "https://www.no-trouble.caa.go.jp/qa/advertising.html",
    topics: [
      "表示場所",
      "ランディングページ",
      "返品特約",
      "申込み",
      "disclosure placement",
      "landing page",
      "return policy",
      "application"
    ],
    summary:
      "Official Q&A covering practical display questions for internet mail-order advertising.",
    evidence: [
      "Required advertising information generally needs to be presented within the relevant advertisement.",
      "Return-policy terms require clear and readily recognizable presentation when applicable."
    ],
    limitations: [
      "Q&A examples are context-specific and should not be generalized without checking the facts."
    ]
  },
  {
    id: "caa-mail-order-guidelines",
    title: "通信販売ガイドライン一覧",
    titleEn: "Mail-order sales guidelines index",
    authority: "Consumer Affairs Agency",
    officialUrl: "https://www.no-trouble.caa.go.jp/what/mailorder/guidelines.html",
    topics: [
      "ガイドライン",
      "返品特約",
      "最終確認画面",
      "申込み段階",
      "guidelines",
      "return policy",
      "final confirmation screen",
      "application stage"
    ],
    summary:
      "Official index of detailed guidelines for return-policy displays, application-stage displays, and related mail-order issues.",
    evidence: [
      "Use the linked guideline that matches the sales flow and display being reviewed.",
      "Advertising-stage and application-stage requirements should be checked separately."
    ],
    limitations: [
      "Individual linked documents may have their own publication or revision dates."
    ]
  }
] as const;

const normalize = (value: string): string => value.trim().toLocaleLowerCase("ja-JP");

export function searchRules(query: string, limit = 5): SearchResult[] {
  const normalized = normalize(query);
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/u).filter(Boolean);

  return RULES.map((rule) => {
    const searchable = normalize(
      [rule.title, rule.titleEn, rule.summary, ...rule.topics].join(" ")
    );
    const score = tokens.filter((token) => searchable.includes(token)).length;
    const matchedTopics = rule.topics.filter((topic) =>
      tokens.some((token) => normalize(topic).includes(token) || token.includes(normalize(topic)))
    );
    return { rule, score, matchedTopics };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.rule.id.localeCompare(b.rule.id))
    .slice(0, limit)
    .map(({ rule, matchedTopics }) => ({
      id: rule.id,
      title: rule.title,
      titleEn: rule.titleEn,
      authority: rule.authority,
      officialUrl: rule.officialUrl,
      summary: rule.summary,
      matchedTopics
    }));
}

export function getEvidencePack(id: string): RuleRecord | undefined {
  return RULES.find((rule) => rule.id === id);
}
