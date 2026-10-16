// Cloudflare Worker: the visitor counter for vishnuvardhan.io.
//
// Where this runs: not on GitHub Pages and not in the visitor's browser, but on
// Cloudflare's servers. "npx wrangler deploy" uploads this file, and Cloudflare runs
// it every time someone calls https://visits.vishnuvardhan.io.
//
// What it stores: a key-value store (KV) named VISITS, which works like a Java
// Map<String, String> that Cloudflare keeps on disk. It holds two keys:
//   "total"  → "42"                                              (visitors so far)
//   "places" → {"US":{"total":30,"cities":{"Dallas":12}}, ...}    (where they came from)
// The store is separate from the site and from this code, so redeploying either
// one never resets the count. No IP address is ever stored.
//
// The two requests it answers:
//   GET  https://visits.vishnuvardhan.io  → read only, returns {"visits":42}
//   POST https://visits.vishnuvardhan.io  → counts one new visitor, returns {"visits":43}

// Response headers sent back with every answer. Together they act like the
// annotations on a Spring controller method.
const CORS = {
  // Browsers block a page from reading answers from a different address unless that
  // address allows it. The site (vishnuvardhan.io) and the counter
  // (visits.vishnuvardhan.io) are different addresses, so this line allows the site,
  // and only the site, to read the count.
  "Access-Control-Allow-Origin": "https://vishnuvardhan.io",
  // The request types the site is allowed to send.
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  // The answer is JSON, so the browser can call response.json() on it.
  "Content-Type": "application/json",
  // Tell browsers and caches never to keep a copy, so the number shown is always current.
  "Cache-Control": "no-store",
};

// Cloudflare calls fetch() once for every request that arrives, much like a Servlet's
// service() method. "request" is the incoming call. "env" holds the resources bound in
// wrangler.toml; env.VISITS is the KV store.
export default {
  async fetch(request, env) {
    // Before a POST from another address, the browser first sends an OPTIONS request
    // to ask "am I allowed?". Answer with the headers above and do no counting.
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // Read the current total. KV stores text, so convert it to a number. Before the
    // first visitor the key doesn't exist and get() returns null; "|| 0" turns that into 0.
    let count = Number(await env.VISITS.get("total")) || 0;

    // Only a POST counts a visitor. The page sends a POST once per new browser, and a
    // GET for returning browsers and for the owner's own browsers.
    if (request.method === "POST") {
      // Add this visitor and save the new total back to the store.
      count += 1;
      await env.VISITS.put("total", String(count));

      // Before this code runs, Cloudflare looks up the visitor's IP address in its
      // location table and puts the result in request.cf. Only the country (e.g. "US")
      // and the city (e.g. "Irving") are used. "?." and "|| 'Unknown'" cover requests
      // where Cloudflare has no answer.
      const country = request.cf?.country || "Unknown";
      const city = request.cf?.city || "Unknown";

      // Load the location totals, stored as one JSON string. On the first visit the
      // key doesn't exist, so start from an empty object {}.
      const places = JSON.parse((await env.VISITS.get("places")) || "{}");

      // Find this country's entry, creating {total:0, cities:{}} if it's the first
      // visitor from there. "||=" assigns only when the entry is missing, like
      // Java's Map.computeIfAbsent.
      const c = (places[country] ||= { total: 0, cities: {} });

      // Add one to the country's total.
      c.total += 1;

      // Add one to the city's count, starting from 0 if the city is new.
      c.cities[city] = (c.cities[city] || 0) + 1;

      // Save the updated location totals back as a JSON string.
      await env.VISITS.put("places", JSON.stringify(places));
    }

    // Send the total back as JSON, e.g. {"visits":43}. The homepage footer shows this
    // number as "43 visitors".
    return new Response(JSON.stringify({ visits: count }), { headers: CORS });
  },
};
