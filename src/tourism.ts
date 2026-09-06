export type TourismFlowType = "A_REFERRAL" | "B_BOOKING_PAY_AT_STAY" | "C_BOOKING_PREPAID";

export type TourismInput = {
  acceptsReservationOnPlatform?: boolean;
  collectsTravelPayment?: boolean;
  handlesCancellationOrRefund?: boolean;
  actsAsContractingParty?: boolean;
};

export type TourismPackStatus = "ready" | "needs_input" | "manual_review";

type TourismClassification =
  | {
      status: "ready";
      serviceFlowType: TourismFlowType;
      missingFacts: string[];
    }
  | {
      status: "needs_input" | "manual_review";
      serviceFlowType?: never;
      missingFacts: string[];
    };

export type OfficialSource = {
  id: string;
  authority: "Japan Tourism Agency" | "Consumer Affairs Agency";
  title: string;
  officialUrl: string;
  evidenceLocation: string;
  checkedAt: string;
  sourceVersion: string;
};

export type TourismInformationPack = {
  status: TourismPackStatus;
  serviceFlowType?: TourismFlowType;
  observedFacts: string[];
  missingFacts: string[];
  generalRequirements: string[];
  officialSources: readonly OfficialSource[];
  screenChecklist: string[];
  changeTriggers: string[];
  professionalReviewTriggers: string[];
  informationOnly: true;
  disclaimer: string;
};

export type TourismPreflight = Pick<
  TourismInformationPack,
  | "status"
  | "serviceFlowType"
  | "observedFacts"
  | "missingFacts"
  | "changeTriggers"
  | "professionalReviewTriggers"
  | "informationOnly"
  | "disclaimer"
>;

const TOURISM_SOURCES = [
  {
    id: "jta-travel-agency-act-overview",
    authority: "Japan Tourism Agency",
    title: "旅行業法概要",
    officialUrl:
      "https://www.mlit.go.jp/kankocho/seisaku_seido/ryokogyoho/ryokogyohogaiyo.html",
    evidenceLocation: "Overview page: travel-business system and related guidance links",
    checkedAt: "2026-09-06",
    sourceVersion: "page updated 2026-04-30"
  },
  {
    id: "jta-ota-guidance",
    authority: "Japan Tourism Agency",
    title: "オンライン旅行予約サイト等に関するガイドライン",
    officialUrl: "https://www.mlit.go.jp/kankocho/content/810000472.pdf",
    evidenceLocation: "Guidance PDF: online travel reservation site service-flow sections",
    checkedAt: "2026-09-06",
    sourceVersion: "current publication checked"
  },
  {
    id: "caa-mail-order",
    authority: "Consumer Affairs Agency",
    title: "通信販売",
    officialUrl: "https://www.no-trouble.caa.go.jp/what/mailorder/",
    evidenceLocation: "Official overview page: mail-order sales disclosure guidance",
    checkedAt: "2026-09-06",
    sourceVersion: "current publication checked"
  }
] as const satisfies readonly OfficialSource[];

const DISCLAIMER =
  "Informational evidence only. This pack does not provide legal advice and does not determine legal compliance, registration requirements, or legal risk for a specific business.";

const FACT_LABELS: Record<keyof TourismInput, string> = {
  acceptsReservationOnPlatform: "whether reservations are accepted on the platform",
  collectsTravelPayment: "whether the platform collects travel payment",
  handlesCancellationOrRefund: "whether the platform handles cancellation or refunds",
  actsAsContractingParty: "whether the operator acts as a contracting party"
};

function missingFacts(input: TourismInput): string[] {
  return (Object.keys(FACT_LABELS) as Array<keyof TourismInput>)
    .filter((key) => input[key] === undefined)
    .map((key) => FACT_LABELS[key]);
}

function observedFacts(input: TourismInput): string[] {
  return (Object.keys(FACT_LABELS) as Array<keyof TourismInput>)
    .filter((key) => input[key] !== undefined)
    .map((key) => `${FACT_LABELS[key]}: ${input[key] ? "yes" : "no"}`);
}

export function classifyTourismFlow(input: TourismInput): TourismClassification {
  const missing = missingFacts(input);
  if (missing.length > 0) {
    return { status: "needs_input", missingFacts: missing };
  }

  const reservation = input.acceptsReservationOnPlatform;
  const payment = input.collectsTravelPayment;
  const contractingParty = input.actsAsContractingParty;
  const cancellation = input.handlesCancellationOrRefund;

  if (!reservation && !payment && !contractingParty && !cancellation) {
    return { status: "ready", serviceFlowType: "A_REFERRAL", missingFacts: [] };
  }

  if (reservation && !payment && contractingParty) {
    return {
      status: "ready",
      serviceFlowType: "B_BOOKING_PAY_AT_STAY",
      missingFacts: []
    };
  }

  if (reservation && payment && contractingParty) {
    return {
      status: "ready",
      serviceFlowType: "C_BOOKING_PREPAID",
      missingFacts: []
    };
  }

  return { status: "manual_review", missingFacts: [] };
}

export function buildTourismInformationPack(input: TourismInput): TourismInformationPack {
  const classification = classifyTourismFlow(input);

  if (classification.status !== "ready") {
    return {
      status: classification.status,
      observedFacts: observedFacts(input),
      missingFacts: classification.missingFacts,
      generalRequirements: [
        "The submitted facts do not fit a supported fixed service-flow model. Do not use this output as a legal conclusion."
      ],
      officialSources: TOURISM_SOURCES,
      screenChecklist: [],
      changeTriggers: [
        "A reservation, payment, cancellation, or contracting-party responsibility changes."
      ],
      professionalReviewTriggers: [
        "A specific legal conclusion, registration determination, or compliance verdict is requested."
      ],
      informationOnly: true,
      disclaimer: DISCLAIMER
    };
  }

  const flowRequirements: Record<TourismFlowType, string[]> = {
    A_REFERRAL: [
      "Record whether the platform remains outside the reservation, payment, cancellation, and contracting flow.",
      "Re-check this pack if a direct booking or payment feature is added."
    ],
    B_BOOKING_PAY_AT_STAY: [
      "Record the booking party, hotel payment flow, cancellation contact, and contract documents shown to the traveler.",
      "Check the relevant official sources again if the platform begins collecting travel payment."
    ],
    C_BOOKING_PREPAID: [
      "Record the payment collector, refund handler, booking party, and traveler-facing price and cancellation information.",
      "Check the relevant official sources again if payment, refund, or contracting responsibilities change."
    ]
  };

  return {
    status: "ready",
    serviceFlowType: classification.serviceFlowType,
    observedFacts: observedFacts(input),
    missingFacts: [],
    generalRequirements: flowRequirements[classification.serviceFlowType],
    officialSources: TOURISM_SOURCES,
    screenChecklist: [
      "service operator identity",
      "price and payment timing where displayed",
      "cancellation and refund contact",
      "terms shown before and after reservation"
    ],
    changeTriggers: [
      "A reservation, payment, cancellation, refund, or contracting-party responsibility changes.",
      "A traveler-facing price, terms, or confirmation screen changes.",
      "An official source is revised."
    ],
    professionalReviewTriggers: [
      "A specific legal conclusion, registration determination, or compliance verdict is requested.",
      "The service introduces traveler-data handling, payment collection, or a flow outside A/B/C."
    ],
    informationOnly: true,
    disclaimer: DISCLAIMER
  };
}

export function buildTourismPreflight(input: TourismInput): TourismPreflight {
  const pack = buildTourismInformationPack(input);
  return {
    status: pack.status,
    ...(pack.serviceFlowType ? { serviceFlowType: pack.serviceFlowType } : {}),
    observedFacts: pack.observedFacts,
    missingFacts: pack.missingFacts,
    changeTriggers: pack.changeTriggers,
    professionalReviewTriggers: pack.professionalReviewTriggers,
    informationOnly: true,
    disclaimer: pack.disclaimer
  };
}

export const buildTourismEvidencePack = buildTourismInformationPack;
