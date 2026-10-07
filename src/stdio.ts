import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createMarketplaceServer } from "./server.js";

const baseUrl = process.env.MARKETPLACE_API_BASE_URL;
if (!baseUrl) {
  console.error("MARKETPLACE_API_BASE_URL is required");
  process.exit(1);
}

serveStdio(
  () => createMarketplaceServer({
    baseUrl,
    ...(process.env.MARKETPLACE_API_KEY ? { apiKey: process.env.MARKETPLACE_API_KEY } : {})
  }),
  {
    onerror(error) {
      console.error(error instanceof Error ? error.message : String(error));
    }
  }
);
