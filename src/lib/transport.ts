/**
 * Thrown when the network call structurally cannot proceed (e.g. no proxy
 * URL configured). Distinct from upstream API errors thrown by callers.
 */
export class TransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransportError';
  }
}

export interface RiotTransportOpts {
  workerUrl: string;
  riotApiKey: string;
}

function ensureProxy(workerUrl: string): string {
  if (!workerUrl.trim()) {
    throw new TransportError(
      'No Cloudflare Worker URL configured. Add it in Settings — see README for the 5-min wrangler walkthrough.',
    );
  }
  return workerUrl.replace(/\/+$/, '') + '/proxy';
}

/**
 * Fetches a Riot API URL through the Cloudflare Worker (CORS pass-through).
 * The worker forwards the call with the provided Riot key in the
 * `X-Riot-Token` header.
 */
export async function riotFetch(
  targetUrl: string,
  opts: RiotTransportOpts,
): Promise<Response> {
  return fetch(ensureProxy(opts.workerUrl), {
    method: 'GET',
    headers: {
      'x-target-url': targetUrl,
      'x-riot-token': opts.riotApiKey,
    },
  });
}

/**
 * Fetches an arbitrary URL through the worker. Used for Gemini calls where
 * the API key is embedded in the URL itself.
 */
export async function genericFetch(
  targetUrl: string,
  workerUrl: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('x-target-url', targetUrl);
  return fetch(ensureProxy(workerUrl), {
    method: init?.method ?? 'GET',
    headers,
    body: init?.body,
  });
}
