import { onRequest } from "./functions/api/assistant.js";

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === "/api/assistant" || path === "/api/assistant/") {
      return onRequest({request, env});
    }
    if (path.startsWith("/api/") || path.startsWith("/functions/")) {
      return new Response("Not found", {status:404});
    }
    return env.ASSETS.fetch(request);
  }
};
