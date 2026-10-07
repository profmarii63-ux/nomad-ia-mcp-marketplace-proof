# NOMAD IA — MCP Marketplace Integration Proof

A small, production-oriented proof showing how I build Model Context Protocol (MCP) + marketplace API integrations in TypeScript.

## What this demonstrates

- Current MCP TypeScript v2 server package (@modelcontextprotocol/server)
- MCP tools for project search, project lookup and category discovery
- Read-only bid-intent stub with no marketplace side effect
- Typed API adapter with normalization for common project payload shapes
- Request timeout and explicit upstream error handling
- Optional bearer-token support without hard-coded credentials
- Node.js stdio entry point
- Web-standard Streamable HTTP adapter suitable for Cloudflare Workers
- Automated tests using deterministic local fixtures
- No secrets, customer data, fake metrics or hidden dependencies

## Tools

| Tool | Purpose |
| --- | --- |
| search_projects | Search by text, category and budget range |
| get_project | Fetch one project by ID |
| list_categories | List categories with a safe fallback |
| submit_bid_intent | Draft-only stub; never submits in this proof |

## Run locally

    npm ci
    npm test
    npm run build

Set:

    MARKETPLACE_API_BASE_URL=https://example.com/api
    MARKETPLACE_API_KEY=optional

Then:

    npm start

## Claude Desktop-style command

After building, configure a local MCP server with:

    {
      "mcpServers": {
        "nomad-marketplace": {
          "command": "node",
          "args": ["/absolute/path/dist/src/stdio.js"],
          "env": {
            "MARKETPLACE_API_BASE_URL": "https://example.com/api"
          }
        }
      }
    }

## Cloudflare-compatible shape

src/worker.ts uses the MCP v2 Web Standards Streamable HTTP transport and exposes a stateless /mcp handler. Platform-specific deployment configuration is intentionally kept separate from core business logic.

## Evidence

Acceptance baseline:

1. TypeScript compiles in strict mode.
2. Tests cover normalization, filters, auth-header behavior, category fallback and upstream failure handling.
3. Secrets are injected through environment variables only.
4. Bid intent remains read-only.
5. Node and Web-standard transports share the same MCP tool implementation.

## Design choice

The API adapter is isolated from the MCP layer so a real marketplace schema can be mapped without rewriting tool behavior. That keeps delivery fast while making API-specific assumptions easy to test.

— NOMAD IA
