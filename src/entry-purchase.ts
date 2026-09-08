import { z } from "zod";
import { commercialTermsFor, commercialTermsReady } from "./commercial-terms";
import { ENTRY_PACK_ID, getEntryPack, type EntryPackInput } from "./entry-pack";
import { ENTRY_PACK_PURCHASE_TERMS } from "./product-terms";

// ISO 3166-1 alpha-2 codes; a declaration is not independent residence evidence.
const countries = new Set("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" "));

export const ENTRY_PURCHASE_INPUT_SCHEMA = z.object({
  pack_id: z.string().trim().min(1).max(100),
  language: z.string().trim().min(2).max(10),
  accepted_terms_version: z.string().trim().max(100).optional(),
  accepted_terms_sha256: z.string().trim().regex(/^[a-f0-9]{64}$/).optional(),
  business_purchase_confirmed: z.boolean().optional(),
  buyer_business_name: z.string().trim().min(1).max(200).optional(),
  buyer_country_code: z.string().trim().toUpperCase().refine(code => countries.has(code), "Use an ISO 3166-1 country code").optional()
});

export async function entryPurchaseTerms() {
  const snapshot = {
    ...commercialTermsFor(ENTRY_PACK_ID)!,
    purchase_terms: ENTRY_PACK_PURCHASE_TERMS,
    buyer_declaration: "Provide the contracting business name and its country of residence or principal office, not the AI server or wallet provider location. Confirm authority to purchase and acceptance of this terms version and hash.",
    location_evidence: "self_declared_only; not independently verified or an automatic tax classification",
    data_notice: "Business name and declared country are saved with the purchase for delivery, support and accounting; never submit private keys."
  };
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(snapshot)));
  return { snapshot, sha256: [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("") };
}

export async function validateEntryPurchase(input: EntryPackInput, mainnet: boolean) {
  const terms = await entryPurchaseTerms();
  const details = { paymentRequired: false, terms: terms.snapshot, terms_sha256: terms.sha256 };
  if (mainnet && !commercialTermsReady()) return { error: "COMMERCIAL_TERMS_NOT_READY", ...details };
  if (input.business_purchase_confirmed !== true || !input.buyer_business_name?.trim() || !countries.has(input.buyer_country_code ?? "") || input.accepted_terms_version !== terms.snapshot.terms_version || input.accepted_terms_sha256 !== terms.sha256) {
    return { error: "PURCHASE_CONFIRMATION_REQUIRED", ...details,
      required_fields: ["accepted_terms_version", "accepted_terms_sha256", "business_purchase_confirmed", "buyer_business_name", "buyer_country_code"] };
  }
  return null;
}

export async function prepareEntryPurchase(input: EntryPackInput) {
  const terms = await entryPurchaseTerms();
  return { ...getEntryPack(input)!, purchase_agreement: {
    terms_snapshot: terms.snapshot, terms_sha256: terms.sha256,
    accepted_terms_version: input.accepted_terms_version,
    buyer_business_name: input.buyer_business_name, buyer_country_code: input.buyer_country_code,
    business_purchase_confirmed: input.business_purchase_confirmed,
    location_evidence: "self_declared_only", recorded_at: new Date().toISOString()
  } };
}
