import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { z } from "zod";
import { DATASET_UPDATED_AT, getEvidencePack, RULES, searchRules } from "./rules";
import { paymentConfig } from "./config";
import { facilitatorConfig } from "./facilitator";
import { createPaidToolHandler } from "./paid-tool";
import { buildTourismEvidencePack, buildTourismPreflight } from "./tourism";
import {
  entryPackInputError,
  PRIVATE_OPERATOR_NOTICE,
  searchEntryCases,
  type EntryPackInput
} from "./entry-pack";
import { ENTRY_PACK_PURCHASE_TERMS } from "./product-terms";
import { commercialTermsFor } from "./commercial-terms";
import { ENTRY_PURCHASE_INPUT_SCHEMA, entryPurchaseTerms, prepareEntryPurchase, validateEntryPurchase } from "./entry-purchase";

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

const TOURISM_INPUT_SCHEMA = z.object({
  acceptsReservationOnPlatform: z.boolean().optional(),
  collectsTravelPayment: z.boolean().optional(),
  handlesCancellationOrRefund: z.boolean().optional(),
  actsAsContractingParty: z.boolean().optional()
});

function createServer(env: Env) {
  const config = paymentConfig(env);
  const server = new McpServer({
    name: "Japan RuleWatch",
    version: "0.1.0"
  });
  const resourceServer = new x402ResourceServer(
    new HTTPFacilitatorClient(facilitatorConfig(env, config.facilitatorUrl))
  );
  registerExactEvmScheme(resourceServer);
  let initialized: Promise<void> | undefined;
  const initialize = () => (initialized ??= resourceServer.initialize());

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
    "get_commercial_terms",
    {
      description:
        "Free: return the current business-only commercial terms profile for a supported paid product. A status other than ready means Mainnet purchase is unavailable.",
      inputSchema: { product_id: z.string().trim().min(1).max(100) }
    },
    async ({ product_id }) => {
      const terms = commercialTermsFor(product_id);
      return terms
        ? textResult(terms)
        : { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: "PRODUCT_NOT_FOUND" }) }] };
    }
  );

  server.registerTool(
    "search_entry_cases",
    {
      description:
        "Free: search the fixed Japan tourism entry-case catalog by region, activity, and language. Returns a model-case preview, key decision themes and what the paid preparation pack adds. It does not include source locations, contact routes, inquiry text or an action plan. Japan Rule is a private commercial service, not a government service.",
      inputSchema: {
        region_id: z.string().trim().min(1).max(100),
        activity: z.string().trim().min(1).max(100),
        language: z.string().trim().min(2).max(10)
      }
    },
    async (input) => textResult(searchEntryCases(input))
  );

  const paidEntryPack = createPaidToolHandler<EntryPackInput>({
    toolName: "get_entry_pack",
    resource: {
      url: "x402://get_entry_pack",
      description:
        "Get the fixed Iya soba entry-preparation pack from Japan Rule, a private commercial information service",
      purchaseTerms: ENTRY_PACK_PURCHASE_TERMS
    },
    env,
    config,
    resourceServer,
    initialize,
    validateNewPurchase: (input) => validateEntryPurchase(input, config.network === "eip155:8453"),
    execute: prepareEntryPurchase
  });

  server.registerTool(
    "get_entry_pack",
    {
      description:
        "Paid: return the fixed Iya soba entry-preparation pack with sources, contacts, consultation text, unknowns, and next actions. It gives no customer-specific legal verdict. Japan Rule is not a government service.",
      inputSchema: ENTRY_PURCHASE_INPUT_SCHEMA
    },
    async (input, extra) => {
      const error = entryPackInputError(input);
      if (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error,
                paymentRequired: false,
                operator_disclosure: PRIVATE_OPERATOR_NOTICE
              })
            }
          ]
        };
      }
      return paidEntryPack(input, extra);
    }
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

  server.registerTool(
    "get_tourism_preflight",
    {
      description:
        "Free: classify a Japan-bound hotel service flow into the supported A/B/C model, list missing facts, and flag manual review. It does not return primary-source evidence.",
      inputSchema: TOURISM_INPUT_SCHEMA
    },
    async (input) => textResult(buildTourismPreflight(input))
  );

  const paidEvidencePack = createPaidToolHandler({
    toolName: "get_tourism_evidence_pack",
    resource: {
      url: "x402://get_tourism_evidence_pack",
      description: "Get a Japan tourism primary-source and screen-check evidence pack"
    },
    env,
    config,
    resourceServer,
    initialize,
    execute: (input) => buildTourismEvidencePack(input)
  });

  server.registerTool(
    "get_tourism_evidence_pack",
    {
      description:
        "Paid: return official Japanese primary-source URLs, evidence locations, checked dates, source versions, general requirements, traveler-screen checks, and re-check triggers for a complete supported A/B/C flow. This is informational evidence, not a legal verdict.",
      inputSchema: TOURISM_INPUT_SCHEMA
    },
    async (input, extra) => {
      const pack = buildTourismEvidencePack(input);
      if (pack.status !== "ready") {
        return textResult({
          error: "INPUT_INCOMPLETE_OR_REVIEW_REQUIRED",
          preflight: buildTourismPreflight(input),
          paymentRequired: false
        });
      }
      if (config.network === "eip155:8453") {
        return textResult({ error: "PRODUCT_NOT_RELEASED_ON_MAINNET", paymentRequired: false });
      }
      return paidEvidencePack(input, extra);
    }
  );

  return server;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ status: "ok", version: "0.1.0" });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return Response.json({
        name: "Japan RuleWatch",
        version: "0.1.0",
        mcp: "/mcp",
        topic: "Japanese mail-order sales advertising and tourism information",
        tools: [
          "search_rules",
          "get_evidence_pack",
          "get_tourism_preflight",
          "get_tourism_evidence_pack",
          "get_commercial_terms",
          "search_entry_cases",
          "get_entry_pack"
        ],
        datasetUpdatedAt: DATASET_UPDATED_AT,
        disclaimer: DISCLAIMER,
        operator_disclosure: PRIVATE_OPERATOR_NOTICE
      });
    }

    if (url.pathname === "/.well-known/glama.json" && request.method === "GET") {
      return Response.json(GLAMA_CONNECTOR_CLAIM);
    }

    if (url.pathname === "/mcp") {
      return createMcpHandler(() => createServer(env), {
        route: "/mcp",
        legacy: "stateless"
      })(request, env, ctx);
    }

    return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  }
} satisfies ExportedHandler<Env>;
