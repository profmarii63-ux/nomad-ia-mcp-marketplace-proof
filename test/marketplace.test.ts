import test from "node:test";
import assert from "node:assert/strict";
import { MarketplaceClient, normalizeProject } from "../src/marketplace.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

test("normalizes common marketplace project shapes", () => {
  assert.deepEqual(normalizeProject({
    projectId: "p-1",
    name: "Build MCP adapter",
    category: "development",
    minBudget: 300,
    maxBudget: 500,
    skills: ["TypeScript", "MCP"]
  }), {
    id: "p-1",
    title: "Build MCP adapter",
    category: "development",
    budgetMin: 300,
    budgetMax: 500,
    skills: ["TypeScript", "MCP"]
  });
});

test("search builds filters and returns normalized projects", async () => {
  let requested = "";
  const client = new MarketplaceClient({
    baseUrl: "https://market.example/api",
    fetchImpl: async (input) => {
      requested = String(input);
      return jsonResponse({
        projects: [{ id: "p-2", title: "API integration", category: "development", budgetMin: 200 }]
      });
    }
  });

  const result = await client.searchProjects({
    query: "MCP",
    category: "development",
    budgetMin: 100,
    budgetMax: 600
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "p-2");
  const url = new URL(requested);
  assert.equal(url.searchParams.get("query"), "MCP");
  assert.equal(url.searchParams.get("category"), "development");
  assert.equal(url.searchParams.get("budget_min"), "100");
  assert.equal(url.searchParams.get("budget_max"), "600");
});

test("authorization header is only sent when an API key exists", async () => {
  let auth: string | null = null;
  const client = new MarketplaceClient({
    baseUrl: "https://market.example/api",
    apiKey: "secret-test-key",
    fetchImpl: async (_input, init) => {
      auth = new Headers(init?.headers).get("authorization");
      return jsonResponse({ id: "p-3", title: "Private project" });
    }
  });

  await client.getProject("p-3");
  assert.equal(auth, "Bearer secret-test-key");
});

test("categories fall back to project data when category endpoint is unavailable", async () => {
  const client = new MarketplaceClient({
    baseUrl: "https://market.example/api",
    fetchImpl: async (input) => {
      const url = String(input);
      if (url.endsWith("/categories")) return jsonResponse({ error: "missing" }, 404);
      return jsonResponse({
        projects: [
          { id: "1", title: "One", category: "automation" },
          { id: "2", title: "Two", category: "development" },
          { id: "3", title: "Three", category: "automation" }
        ]
      });
    }
  });

  assert.deepEqual(await client.listCategories(), ["automation", "development"]);
});

test("upstream HTTP errors fail clearly without leaking response bodies", async () => {
  const client = new MarketplaceClient({
    baseUrl: "https://market.example/api",
    fetchImpl: async () => new Response("sensitive upstream body", { status: 503 })
  });

  await assert.rejects(() => client.searchProjects(), /upstream_http_503/);
});
