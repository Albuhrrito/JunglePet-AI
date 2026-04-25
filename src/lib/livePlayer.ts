import type { Match, Player, Region } from './types';
import { RiotClient, type RiotMatch } from './riotApi';
import { transformMatch, transformRank, buildPlayer } from './transform';

const MATCH_CACHE_PREFIX = 'junglepet:match:v1:';

function readMatchCache(matchId: string): RiotMatch | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MATCH_CACHE_PREFIX + matchId);
    return raw ? (JSON.parse(raw) as RiotMatch) : null;
  } catch {
    return null;
  }
}

function writeMatchCache(matchId: string, raw: RiotMatch): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MATCH_CACHE_PREFIX + matchId, JSON.stringify(raw));
  } catch {
    // ignore quota errors
  }
}

/** Concurrency-limited promise.all */
async function pool<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        out[i] = await task(items[i]);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

export interface LiveFetchOpts {
  workerUrl: string;
  apiKey: string;
  /** How many recent matches to pull (max 20 for dev keys). */
  count?: number;
}

export async function fetchLivePlayer(
  name: string,
  tag: string,
  region: Region,
  opts: LiveFetchOpts,
): Promise<Player> {
  const client = new RiotClient({
    workerUrl: opts.workerUrl,
    apiKey: opts.apiKey,
  });

  const account = await client.getAccount(name, tag, region);
  const platform = RiotClient.defaultPlatformFor(region);
  const count = Math.min(opts.count ?? 20, 20);

  const [matchIds, rankEntries] = await Promise.all([
    client.getMatchIds(account.puuid, region, count),
    client.getRankedEntries(account.puuid, platform).catch(() => []),
  ]);

  // 8 in flight is safe under the dev key's 20 req/s ceiling once worker
  // round-trip time is factored in.
  const rawMatches = await pool(matchIds.slice(0, count), 8, async (id) => {
    const cached = readMatchCache(id);
    if (cached) return cached;
    const fresh = await client.getMatch(id, region);
    writeMatchCache(id, fresh);
    return fresh;
  });

  const matches: Match[] = rawMatches
    .map((m) => transformMatch(m, account.puuid))
    .filter((m): m is Match => m !== null);

  return buildPlayer({
    account,
    region,
    matches,
    rank: transformRank(rankEntries),
  });
}
