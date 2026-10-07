# Project-fit matrix

This proof is intentionally aligned with the requirements commonly requested for a freelance-marketplace MCP integration.

| Requested capability | Evidence in this repository |
| --- | --- |
| TypeScript MCP server | `src/server.ts` using `@modelcontextprotocol/server` v2 |
| `search_projects(query, category, budget_range)` | Implemented as `search_projects` |
| `get_project(id)` | Implemented as `get_project` |
| `list_categories` | Implemented as `list_categories` with safe fallback |
| Public listings without auth | Supported: API key is optional |
| Private endpoints with API key | Supported through optional bearer token |
| Standalone Node service | `src/stdio.ts` |
| Cloudflare-compatible deployment shape | `src/worker.ts` using Web Standards Streamable HTTP |
| README + setup instructions | `README.md` |
| Claude Desktop configuration example | Included in `README.md` |
| Nice-to-have bid intent stub | `submit_bid_intent` is implemented as draft-only, no side effect |
| Automated verification | `npm test` — 5/5 passing |

## What remains client-specific

Only the final mapping to the client's exact API response schema, endpoint paths and any private-auth conventions. The MCP tool surface, transport structure, error handling, tests and handoff pattern are already demonstrated here.

No claim is made that this repository is connected to any private marketplace API.
