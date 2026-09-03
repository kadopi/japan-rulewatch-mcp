import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { DATASET_UPDATED_AT, getEvidencePack, RULES, searchRules } from "./rules";

const DISCLAIMER =
  "Informational evidence only. This service does not provide legal advice or determine legal compliance. Verify the current official source before acting.";

const GLAMA_CONNECTOR_CLAIM = {
  $schema: "https://glama.ai/mcp/schemas/connector.json",
  claim: "glama_claim_U906vwxFl_Nm5Z_JWl8pVoyM5XdPeBpo"
};

function textResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
  };
}

function createServer() {
  const server = new McpServer({
    name: "Japan RuleWatch",
    version: "0.0.1"
  });

  server.registerTool(
    "search_rules",
    {
      description:
        "Search a small curated index of official Japanese sources about mail-order sales advertising. Use this before get_evidence_pack. Results are evidence pointers, not legal conclusions.",
      inputSchema: {
        query: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe("Japanese or English search terms, maximum 200 characters"),
        limit: z.number().int().min(1).max(5).default(5)
      }
    },
    async ({ query, limit }) =>
      textResult({
        query,
        results: searchRules(query, limit),
        datasetUpdatedAt: DATASET_UPDATED_AT,
        disclaimer: DISCLAIMER
      })
  );

  server.registerTool(
    "get_evidence_pack",
    {
      description:
        "Return a concise evidence pack for one rule ID returned by search_rules. Includes official URLs, scope limits, and no legal-compliance verdict.",
      inputSchema: {
        id: z
          .string()
          .min(1)
          .max(100)
          .describe("Exact rule ID returned by search_rules")
      }
    },
    async ({ id }) => {
      const rule = getEvidencePack(id);
      if (!rule) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "RULE_NOT_FOUND",
                availableIds: RULES.map((item) => item.id)
              })
            }
          ],
          isError: true
        };
      }

      return textResult({
        ...rule,
        datasetUpdatedAt: DATASET_UPDATED_AT,
        retrievedAt: new Date().toISOString(),
        disclaimer: DISCLAIMER
      });
    }
  );

  return server;
}

const mcpHandler = createMcpHandler(createServer, {
  route: "/mcp",
  legacy: "stateless"
});

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ status: "ok", version: "0.0.1" });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return Response.json({
        name: "Japan RuleWatch",
        version: "0.0.1",
        mcp: "/mcp",
        topic: "Japanese mail-order sales advertising",
        tools: ["search_rules", "get_evidence_pack"],
        datasetUpdatedAt: DATASET_UPDATED_AT,
        disclaimer: DISCLAIMER
      });
    }

    if (url.pathname === "/.well-known/glama.json" && request.method === "GET") {
      return Response.json(GLAMA_CONNECTOR_CLAIM);
    }

    if (url.pathname === "/mcp") {
      return mcpHandler(request, env, ctx);
    }

    return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  }
} satisfies ExportedHandler;
