import entryPack from "../data/IYA-EXPERIENCE-DATA.json";
import { ENTRY_PACK_PURCHASE_TERMS } from "./product-terms";

export const ENTRY_PACK_ID = "jp-tokushima-miyoshi-iya-soba";
export const ENTRY_PACK_LANGUAGE = "en";

export type EntryPackInput = {
  pack_id: string;
  language: string;
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
          assumed_plan: {
            participants: entryPack.plan_facts.participants,
            venue: entryPack.plan_facts.venue,
            transport_arranged: entryPack.plan_facts.transport_arranged,
            lodging_arranged: entryPack.plan_facts.lodging_arranged
          },
          information_scope: entryPack.completion_scope,
          missing_information: entryPack.missing_information,
          coverage_gaps: entryPack.coverage_gaps,
          scenario_type: entryPack.scenario_type,
          purchase_terms: ENTRY_PACK_PURCHASE_TERMS,
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
