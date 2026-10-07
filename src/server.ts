import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { MarketplaceClient } from "./marketplace.js";

export type ServerOptions = {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

export function createMarketplaceServer(options: ServerOptions): McpServer {
  const client = new MarketplaceClient(options);
  const server = new McpServer(
    { name: "nomad-ia-marketplace-proof", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "search_projects",
    {
      title: "Search marketplace projects",
      description: "Search public project listings by text, category and budget range.",
      inputSchema: z.object({
        query: z.string().trim().min(1).optional(),
        category: z.string().trim().min(1).optional(),
        budget_min: z.number().nonnegative().optional(),
        budget_max: z.number().nonnegative().optional()
      })
    },
    async ({ query, category, budget_min, budget_max }) => {
      const projects = await client.searchProjects({
        ...(query ? { query } : {}),
        ...(category ? { category } : {}),
        ...(budget_min !== undefined ? { budgetMin: budget_min } : {}),
        ...(budget_max !== undefined ? { budgetMax: budget_max } : {})
      });
      return textResult({ count: projects.length, projects });
    }
  );

  server.registerTool(
    "get_project",
    {
      title: "Get project",
      description: "Return one project by marketplace project id.",
      inputSchema: z.object({ id: z.string().trim().min(1) })
    },
    async ({ id }) => textResult(await client.getProject(id))
  );

  server.registerTool(
    "list_categories",
    {
      title: "List categories",
      description: "Return available project categories.",
      inputSchema: z.object({})
    },
    async () => textResult(await client.listCategories())
  );

  server.registerTool(
    "submit_bid_intent",
    {
      title: "Prepare bid intent",
      description: "Read-only v1 stub. Prepares a bid intent without submitting or changing marketplace state.",
      inputSchema: z.object({
        project_id: z.string().trim().min(1),
        amount: z.number().positive(),
        note: z.string().trim().min(1).max(1000)
      })
    },
    async ({ project_id, amount, note }) => textResult({
      status: "draft_only",
      submitted: false,
      project_id,
      amount,
      note
    })
  );

  return server;
}
