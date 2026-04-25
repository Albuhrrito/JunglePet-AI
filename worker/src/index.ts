/**
 * JunglePet AI — Cloudflare Worker proxy.
 *
 * Stateless CORS pass-through. Holds no API keys. Forwards requests to
 * Riot or Gemini if (and only if) the destination is on the allow-list and
 * the request originates from an allowed page.
 */

const ALLOWED_HOSTS = new Set([
  // Riot routing regions
  'americas.api.riotgames.com',
  'europe.api.riotgames.com',
  'asia.api.riotgames.com',
  'sea.api.riotgames.com',
  // Riot platform regions
  'na1.api.riotgames.com',
  'br1.api.riotgames.com',
  'la1.api.riotgames.com',
  'la2.api.riotgames.com',
  'euw1.api.riotgames.com',
  'eun1.api.riotgames.com',
  'tr1.api.riotgames.com',
  'ru.api.riotgames.com',
  'kr.api.riotgames.com',
  'jp1.api.riotgames.com',
  'oc1.api.riotgames.com',
  'ph2.api.riotgames.com',
  'sg2.api.riotgames.com',
  'th2.api.riotgames.com',
  'tw2.api.riotgames.com',
  'vn2.api.riotgames.com',
  // Gemini
  'generativelanguage.googleapis.com',
]);

const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/0\.0\.0\.0(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.github\.io$/i,
  // Tauri webview origins
  /^https?:\/\/tauri\.localhost$/i,
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin / curl / Tauri (no origin header)
  return ALLOWED_ORIGIN_PATTERNS.some((rx) => rx.test(origin));
}

function corsHeaders(origin: string | null): Headers {
  const h = new Headers();
  if (origin && isAllowedOrigin(origin)) {
    h.set('access-control-allow-origin', origin);
    h.set('vary', 'origin');
  } else {
    h.set('access-control-allow-origin', '*');
  }
  h.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  h.set(
    'access-control-allow-headers',
    'content-type, x-target-url, x-riot-token, authorization',
  );
  h.set('access-control-max-age', '86400');
  return h;
}

function json(body: unknown, status: number, origin: string | null): Response {
  const headers = corsHeaders(origin);
  headers.set('content-type', 'application/json');
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(req: Request): Promise<Response> {
    const origin = req.headers.get('origin');

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(req.url);

    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        'JunglePet AI proxy is running. POST/GET /proxy with x-target-url.',
        { status: 200, headers: corsHeaders(origin) },
      );
    }

    if (url.pathname !== '/proxy') {
      return json({ error: 'not found' }, 404, origin);
    }

    if (!isAllowedOrigin(origin)) {
      return json({ error: 'origin not allowed', origin }, 403, origin);
    }

    const target = req.headers.get('x-target-url');
    if (!target) {
      return json({ error: 'x-target-url header required' }, 400, origin);
    }

    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return json({ error: 'invalid x-target-url' }, 400, origin);
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return json(
        { error: `destination host not allowed: ${parsed.hostname}` },
        403,
        origin,
      );
    }

    const fwd = new Headers();
    const riotToken = req.headers.get('x-riot-token');
    if (riotToken) fwd.set('X-Riot-Token', riotToken);
    const auth = req.headers.get('authorization');
    if (auth) fwd.set('authorization', auth);
    const ct = req.headers.get('content-type');
    if (ct) fwd.set('content-type', ct);

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

    let upstream: Response;
    try {
      upstream = await fetch(parsed.toString(), {
        method: req.method,
        headers: fwd,
        body: hasBody ? req.body : undefined,
      });
    } catch (err) {
      return json(
        { error: 'upstream fetch failed', detail: String(err) },
        502,
        origin,
      );
    }

    const respHeaders = new Headers(upstream.headers);
    const cors = corsHeaders(origin);
    for (const [k, v] of cors.entries()) respHeaders.set(k, v);
    // Strip headers Cloudflare may not allow re-emitting verbatim
    respHeaders.delete('content-encoding');
    respHeaders.delete('content-length');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  },
};
