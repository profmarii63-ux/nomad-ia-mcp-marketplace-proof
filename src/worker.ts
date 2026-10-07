import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import { createMarketplaceServer } from "./server.js";

export type Env = {
  MARKETPLACE_API_BASE_URL: string;
  MARKETPLACE_API_KEY?: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== "/mcp") {
      return new Response("Not Found", { status: 404 });
    }

    const server = createMarketplaceServer({
      baseUrl: env.MARKETPLACE_API_BASE_URL,
      ...(env.MARKETPLACE_API_KEY ? { apiKey: env.MARKETPLACE_API_KEY } : {})
    });

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });

    await server.connect(transport);
    return transport.handleRequest(request);
  }
};
