// Cloudflare Worker: visitor counter backed by KV. The count lives in KV, not in the
// site, so redeploying the site (GitHub Pages) or this worker never resets it.
// GET  /  → { "visits": 1234 }            (read only)
// POST /  → counts one new visitor, returns the new total
// Places are kept as totals per country and city (from Cloudflare's own lookup).
// No IP address is ever stored. See them in the Cloudflare dashboard:
// Storage & Databases → KV → VISITS → key "places".

const CORS = {
  "Access-Control-Allow-Origin": "https://vishnuvardhan.io",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    let count = Number(await env.VISITS.get("total")) || 0;

    if (request.method === "POST") {
      count += 1;
      await env.VISITS.put("total", String(count));

      const country = request.cf?.country || "Unknown";
      const city = request.cf?.city || "Unknown";
      const places = JSON.parse((await env.VISITS.get("places")) || "{}");
      const c = (places[country] ||= { total: 0, cities: {} });
      c.total += 1;
      c.cities[city] = (c.cities[city] || 0) + 1;
      await env.VISITS.put("places", JSON.stringify(places));
    }

    return new Response(JSON.stringify({ visits: count }), { headers: CORS });
  },
};
