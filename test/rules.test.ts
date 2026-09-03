import { describe, expect, it } from "vitest";
import { getEvidencePack, RULES, searchRules } from "../src/rules";

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
