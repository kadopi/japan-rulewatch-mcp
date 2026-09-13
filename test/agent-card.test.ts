import { describe, expect, it } from "vitest";
import worker from "../src/index";

describe("Japan RuleWatch service card", () => {
  it("publishes MCP discovery tags and English examples without claiming A2A", async () => {
    const response = await worker.fetch(new Request("https://example.test/.well-known/agent-card.json"), {} as Env, {} as ExecutionContext);
    const card = await response.json() as { mcpEndpoint: string; skills: Array<{ tags: string[]; examples: string[]; firstTool: string }>; a2a: { supported: boolean } };
    expect(response.status).toBe(200);
    expect(card.mcpEndpoint).toBe("https://japan-rulewatch-mcp-mainnet.kadopi.workers.dev/mcp");
    expect(card.skills[0].tags).toEqual(expect.arrayContaining(["japan-tourism", "tour-operator", "official-sources", "market-entry"]));
    expect(card.skills[0].examples[0]).toContain("tour operator");
    expect(card.skills[0].firstTool).toBe("search_entry_cases");
    expect(card.a2a.supported).toBe(false);
  });
});
