import entryPack from "../data/IYA-EXPERIENCE-DATA.json";
import { ENTRY_PACK_PURCHASE_TERMS } from "./product-terms";

export const ENTRY_PACK_ID = "jp-tokushima-miyoshi-iya-soba";
export const ENTRY_PACK_LANGUAGE = "en";

export type EntryPackInput = {
  pack_id: string;
  language: string;
  accepted_terms_version?: string;
  accepted_terms_sha256?: string;
  business_purchase_confirmed?: boolean;
  buyer_business_name?: string;
  buyer_country_code?: string;
};

export type EntryCaseSearchInput = {
  region_id: string;
  activity: string;
  language: string;
};

export const PRIVATE_OPERATOR_NOTICE = entryPack.operator_disclosure.notice_en;

export function searchEntryCases(input: EntryCaseSearchInput) {
  const supported =
    input.region_id === entryPack.region.region_id &&
    input.activity === entryPack.activity &&
    input.language === ENTRY_PACK_LANGUAGE;

  return {
    query: input,
    results: supported
      ? entryPack.cases.map((item) => ({
          region: entryPack.region,
          activity: entryPack.activity,
          case_id: item.case_id,
          title: item.title_ja,
          summary: item.summary_en,
          pack_id: entryPack.pack_id,
          preview: {
            model_case: {
              participants: entryPack.plan_facts.participants,
              venue: entryPack.plan_facts.venue,
              transport_arranged: entryPack.plan_facts.transport_arranged,
              lodging_arranged: entryPack.plan_facts.lodging_arranged
            },
            decision_preview: [
              "Confirm the provider's acceptance of the proposed group, resale and operating roles.",
              "Clarify who contracts with guests, takes payment and is responsible for food handling.",
              "Confirm language support and any venue-specific operating conditions."
            ],
            delivery_preview:
              "The paid preparation pack adds official-source locations, published contact routes, ready-to-send inquiry text and a prioritized action plan."
          },
          information_scope:
            "Free model-case preview only. It does not include source locations, contact routes, inquiry text or an action plan.",
          next_action: "Read get_commercial_terms before requesting the paid preparation pack.",
          operator_disclosure: PRIVATE_OPERATOR_NOTICE
        }))
      : [],
    operator_disclosure: PRIVATE_OPERATOR_NOTICE
  };
}

export function entryPackInputError(input: EntryPackInput): string | null {
  if (input.pack_id !== ENTRY_PACK_ID) return "PACK_NOT_FOUND";
  if (input.language !== ENTRY_PACK_LANGUAGE) return "LANGUAGE_NOT_SUPPORTED";
  return null;
}

export function getEntryPack(input: EntryPackInput) {
  const error = entryPackInputError(input);
  if (error) return null;

  return {
    ...entryPack,
    plan_facts_notice:
      "plan_facts describes a fictional sample proposal and is not customer-supplied input.",
    purchase_terms: ENTRY_PACK_PURCHASE_TERMS,
    operator_disclosure: entryPack.operator_disclosure
  };
}
