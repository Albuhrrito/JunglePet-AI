import type { Region } from './types';
import { riotFetch, TransportError } from './transport';

export type Platform =
  | 'na1'
  | 'br1'
  | 'la1'
  | 'la2'
  | 'euw1'
  | 'eun1'
  | 'tr1'
  | 'ru'
  | 'kr'
  | 'jp1'
  | 'oc1'
  | 'ph2'
  | 'sg2'
  | 'th2'
  | 'tw2'
  | 'vn2';

const PLATFORM_DEFAULTS: Record<Region, Platform> = {
  americas: 'na1',
  europe: 'euw1',
  asia: 'kr',
  sea: 'oc1',
};

export class RiotApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(`Riot API ${status}: ${detail}`);
    this.name = 'RiotApiError';
  }
}

// --- Raw response shapes (only the fields we use) ---------------------------

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotLeagueEntry {
  queueType: string;
  tier: string;
  rank: string; // I/II/III/IV
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface RiotMatchParticipant {
  puuid: string;
  championName: string;
  championId: number;
  teamPosition: string; // TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY
  individualPosition: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  summonerLevel?: number;
  profileIcon?: number;
}

export interface RiotMatch {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameDuration: number;
    queueId: number;
    gameStartTimestamp: number;
    participants: RiotMatchParticipant[];
  };
}

// --- Client -----------------------------------------------------------------

interface ClientOpts {
  workerUrl: string;
  apiKey: string;
}

export class RiotClient {
  constructor(private opts: ClientOpts) {}

  static defaultPlatformFor(region: Region): Platform {
    return PLATFORM_DEFAULTS[region];
  }

  private async get<T>(url: string): Promise<T> {
    const res = await riotFetch(url, {
      workerUrl: this.opts.workerUrl,
      riotApiKey: this.opts.apiKey,
    });
    if (res.status === 429) {
      const retry = Number(res.headers.get('retry-after') ?? '5');
      throw new RiotApiError(429, `Rate limited. Wait ${retry}s and retry.`);
    }
    if (res.status === 401 || res.status === 403) {
      throw new RiotApiError(
        res.status,
        'API key invalid or expired. Dev keys rotate every 24h — regenerate at developer.riotgames.com.',
      );
    }
    if (res.status === 404) {
      throw new RiotApiError(404, 'Not found.');
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new RiotApiError(res.status, text || res.statusText);
    }
    return (await res.json()) as T;
  }

  async getAccount(
    name: string,
    tag: string,
    region: Region,
  ): Promise<RiotAccount> {
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    try {
      return await this.get<RiotAccount>(url);
    } catch (e) {
      if (e instanceof RiotApiError && e.status === 404) {
        throw new RiotApiError(
          404,
          `No account found for ${name}#${tag} on ${region}. Check the spelling and region.`,
        );
      }
      throw e;
    }
  }

  async getRankedEntries(
    puuid: string,
    platform: Platform,
  ): Promise<RiotLeagueEntry[]> {
    const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
    try {
      return await this.get<RiotLeagueEntry[]>(url);
    } catch (e) {
      // Rank lookup is best-effort: missing rank shouldn't kill the analysis.
      if (e instanceof RiotApiError && e.status === 404) return [];
      throw e;
    }
  }

  async getMatchIds(
    puuid: string,
    region: Region,
    count = 20,
  ): Promise<string[]> {
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${count}&type=ranked`;
    try {
      return await this.get<string[]>(url);
    } catch (e) {
      if (e instanceof RiotApiError && e.status === 404) {
        // Fall back to non-ranked if the player has no ranked games.
        const fallback = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${count}`;
        return this.get<string[]>(fallback);
      }
      throw e;
    }
  }

  async getMatch(matchId: string, region: Region): Promise<RiotMatch> {
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
    return this.get<RiotMatch>(url);
  }

  /**
   * Convenience: hit the cheapest endpoint to validate the API key works.
   * Used by the settings panel "Test connection" flow.
   */
  async ping(): Promise<boolean> {
    try {
      await this.getAccount('Hide on bush', 'KR1', 'asia');
      return true;
    } catch (e) {
      if (e instanceof TransportError) throw e;
      if (e instanceof RiotApiError && e.status === 404) return true;
      return false;
    }
  }
}
