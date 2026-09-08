// Cloudflare Worker: visit counter backed by KV.
// GET  /            → { "visits": 1234 }   (read only)
// POST /            → increments, then returns the new count
// Bind a KV namespace called VISITS to this worker (see wrangler.toml).

const CORS = {
  "Access-Control-Allow-Origin": "https://vishnuvardhan.io",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const key = "total";
    let count = Number(await env.VISITS.get(key)) || 0;

    if (request.method === "POST") {
      count += 1;
      await env.VISITS.put(key, String(count));
    }

    return new Response(JSON.stringify({ visits: count }), { headers: CORS });
  },
};
