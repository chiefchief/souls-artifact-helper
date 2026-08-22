const RATINGS_KEY = "artifact-ratings";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=UTF-8");
  for (const [name, value] of Object.entries(corsHeaders)) {
    headers.set(name, value);
  }

  return new Response(JSON.stringify(data), { ...init, headers });
}

function isRating(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function isAuthorized(request, env) {
  return request.headers.get("Authorization") === `Bearer ${env.ADMIN_TOKEN}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true });
    }

    if (url.pathname === "/ratings" && request.method === "GET") {
      const ratings = (await env.RATINGS.get(RATINGS_KEY, "json")) ?? {};
      return json({ ratings });
    }

    const ratingMatch = url.pathname.match(/^\/ratings\/([a-z]+-\d+)$/);
    if (ratingMatch && request.method === "PUT") {
      if (!isAuthorized(request, env)) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Request body must be valid JSON." }, { status: 400 });
      }

      if (!isRating(body?.pvp) || !isRating(body?.pve)) {
        return json({ error: "Both pvp and pve must be integers from 1 to 5." }, { status: 400 });
      }

      const ratings = (await env.RATINGS.get(RATINGS_KEY, "json")) ?? {};
      const artifactId = ratingMatch[1];
      const rating = { pvp: body.pvp, pve: body.pve };
      await env.RATINGS.put(RATINGS_KEY, JSON.stringify({ ...ratings, [artifactId]: rating }));

      return json({ artifactId, rating });
    }

    return json({ error: "Not found" }, { status: 404 });
  },
};
