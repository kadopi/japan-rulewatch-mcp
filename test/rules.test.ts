import { describe, expect, it } from "vitest";
import { getEvidencePack, RULES, searchRules } from "../src/rules";
import {
  buildTourismEvidencePack,
  buildTourismPreflight,
  classifyTourismFlow
} from "../src/tourism";

describe("rule index", () => {
  it("uses only HTTPS official sources", () => {
    expect(RULES).toHaveLength(4);
    for (const rule of RULES) {
      const url = new URL(rule.officialUrl);
      expect(url.protocol).toBe("https:");
      expect(["laws.e-gov.go.jp", "www.no-trouble.caa.go.jp"]).toContain(
        url.hostname
      );
    }
  });

  it("searches in Japanese", () => {
    const results = searchRules("通信販売 広告");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.officialUrl).toMatch(/^https:\/\//u);
  });

  it("searches in English", () => {
    expect(searchRules("return policy").map((item) => item.id)).toContain(
      "caa-mail-order-advertising-qa"
    );
  });

  it("returns no results for empty or unrelated input", () => {
    expect(searchRules("   ")).toEqual([]);
    expect(searchRules("cryptocurrency custody")).toEqual([]);
  });

  it("returns an evidence pack only for an exact ID", () => {
    expect(getEvidencePack("caa-mail-order-guidelines")?.authority).toBe(
      "Consumer Affairs Agency"
    );
    expect(getEvidencePack("missing")).toBeUndefined();
  });
});

describe("tourism information pack", () => {
  it("classifies the three supported service flows from facts", () => {
    expect(
      classifyTourismFlow({
        acceptsReservationOnPlatform: false,
        collectsTravelPayment: false,
        handlesCancellationOrRefund: false,
        actsAsContractingParty: false
      }).serviceFlowType
    ).toBe("A_REFERRAL");

    expect(
      classifyTourismFlow({
        acceptsReservationOnPlatform: true,
        collectsTravelPayment: false,
        handlesCancellationOrRefund: true,
        actsAsContractingParty: true
      }).serviceFlowType
    ).toBe("B_BOOKING_PAY_AT_STAY");

    expect(
      classifyTourismFlow({
        acceptsReservationOnPlatform: true,
        collectsTravelPayment: true,
        handlesCancellationOrRefund: true,
        actsAsContractingParty: true
      }).serviceFlowType
    ).toBe("C_BOOKING_PREPAID");
  });

  it("stops before a conclusion when facts are missing or inconsistent", () => {
    expect(classifyTourismFlow({ acceptsReservationOnPlatform: true }).status).toBe(
      "needs_input"
    );
    expect(
      classifyTourismFlow({
        acceptsReservationOnPlatform: false,
        collectsTravelPayment: true,
        handlesCancellationOrRefund: false,
        actsAsContractingParty: false
      }).status
    ).toBe("manual_review");
  });

  it("returns an informational pack without a legal verdict", () => {
    const pack = buildTourismEvidencePack({
      acceptsReservationOnPlatform: true,
      collectsTravelPayment: true,
      handlesCancellationOrRefund: true,
      actsAsContractingParty: true
    });

    expect(pack.informationOnly).toBe(true);
    expect(pack.serviceFlowType).toBe("C_BOOKING_PREPAID");
    expect(pack.officialSources).toHaveLength(3);
    expect(pack.officialSources.every((source) => source.evidenceLocation.length > 0)).toBe(true);
    for (const source of pack.officialSources) {
      const url = new URL(source.officialUrl);
      expect(url.protocol).toBe("https:");
      expect(["www.mlit.go.jp", "www.no-trouble.caa.go.jp"]).toContain(url.hostname);
    }
    expect(JSON.stringify(pack)).not.toContain("registration_not_required");
    expect(JSON.stringify(pack)).not.toContain("compliant");
  });

  it("keeps official evidence out of the free preflight", () => {
    const preflight = buildTourismPreflight({
      acceptsReservationOnPlatform: true,
      collectsTravelPayment: true,
      handlesCancellationOrRefund: true,
      actsAsContractingParty: true
    });

    expect(preflight.status).toBe("ready");
    expect(JSON.stringify(preflight)).not.toContain("officialSources");
    expect(JSON.stringify(preflight)).not.toContain("screenChecklist");
  });
});
