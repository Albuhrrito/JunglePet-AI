import type { Match, Player, Region } from './types';

const NOW = 1761350400000; // ~April 24, 2026
const HOUR_MS = 3600 * 1000;

interface ChampDef {
  name: string;
  key: string;
}

const C = {
  leeSin: { name: 'Lee Sin', key: 'LeeSin' },
  kayn: { name: 'Kayn', key: 'Kayn' },
  hecarim: { name: 'Hecarim', key: 'Hecarim' },
  vi: { name: 'Vi', key: 'Vi' },
  graves: { name: 'Graves', key: 'Graves' },
  elise: { name: 'Elise', key: 'Elise' },
} as const satisfies Record<string, ChampDef>;

let _matchSerial = 5234567890;
function buildMatch(
  i: number,
  champ: ChampDef,
  win: boolean,
  k: number,
  d: number,
  a: number,
  cs: number,
  vision: number,
  durMin: number,
  damage: number,
  gold: number,
): Match {
  return {
    matchId: `NA1_${_matchSerial--}`,
    championName: champ.name,
    championKey: champ.key,
    role: 'JUNGLE',
    win,
    kills: k,
    deaths: d,
    assists: a,
    cs,
    visionScore: vision,
    goldEarned: gold,
    damageDealt: damage,
    damageTaken: Math.round(damage * 0.72),
    gameDurationSec: durMin * 60,
    gameMode: 'RANKED_SOLO_5x5',
    timestamp: NOW - i * 5 * HOUR_MS,
  };
}

// Curated 20-match history. Hand-tuned so the analyzer surfaces a meaningful
// mix of issues (low CS, low vision, mid win-rate, struggling Lee Sin) plus
// praise (Kayn games are excellent).
const ALBRUH_MATCHES: Match[] = [
  buildMatch(0, C.leeSin, false, 4, 9, 5, 132, 15, 28, 18420, 11200),
  buildMatch(1, C.kayn, true, 11, 4, 8, 165, 12, 31, 28140, 14820),
  buildMatch(2, C.hecarim, false, 2, 8, 3, 115, 11, 29, 14210, 10100),
  buildMatch(3, C.vi, false, 5, 7, 6, 138, 16, 33, 19500, 12100),
  buildMatch(4, C.kayn, true, 14, 3, 6, 178, 14, 28, 31200, 15600),
  buildMatch(5, C.leeSin, true, 8, 5, 9, 143, 18, 30, 22100, 12800),
  buildMatch(6, C.hecarim, false, 3, 9, 4, 122, 13, 32, 16800, 11400),
  buildMatch(7, C.leeSin, false, 6, 8, 5, 128, 14, 27, 17900, 11600),
  buildMatch(8, C.graves, true, 9, 4, 4, 168, 11, 26, 26400, 14200),
  buildMatch(9, C.elise, false, 4, 7, 6, 95, 12, 25, 12800, 9800),
  buildMatch(10, C.kayn, true, 12, 3, 7, 159, 16, 30, 27300, 14500),
  buildMatch(11, C.vi, true, 7, 4, 11, 134, 17, 29, 18900, 12600),
  buildMatch(12, C.leeSin, false, 5, 7, 4, 118, 13, 28, 16400, 10900),
  buildMatch(13, C.hecarim, true, 6, 3, 12, 145, 15, 31, 20100, 13200),
  buildMatch(14, C.leeSin, false, 3, 9, 6, 110, 12, 30, 14600, 10400),
  buildMatch(15, C.vi, false, 4, 8, 5, 121, 14, 28, 16100, 11200),
  buildMatch(16, C.kayn, true, 10, 2, 9, 172, 13, 27, 25800, 14400),
  buildMatch(17, C.hecarim, false, 2, 7, 8, 108, 11, 33, 13900, 10200),
  buildMatch(18, C.leeSin, true, 7, 4, 10, 138, 19, 29, 21300, 12700),
  buildMatch(19, C.graves, false, 5, 6, 4, 145, 10, 25, 18200, 11800),
];

const ALBRUH: Player = {
  riotId: 'Albruh',
  tag: 'VAL',
  region: 'americas',
  level: 287,
  iconId: 4368,
  rank: {
    tier: 'GOLD',
    division: 'II',
    lp: 47,
    wins: 64,
    losses: 71,
  },
  matches: ALBRUH_MATCHES,
};

const KEYED_PLAYERS: Record<string, Player> = {
  'albruh#val': ALBRUH,
};

/**
 * Returns a mock player for any input. The "albruh#val" handle returns the
 * curated profile; any other input gets the same data re-tagged with the
 * provided name so the demo always has rich content to display.
 */
export function getMockPlayer(
  riotId: string,
  tag: string,
  region: Region,
): Player {
  const key = `${riotId}#${tag}`.toLowerCase().trim();
  const exact = KEYED_PLAYERS[key];
  if (exact) {
    return { ...exact, region };
  }
  return {
    ...ALBRUH,
    riotId: riotId.trim() || 'Stranger',
    tag: tag.trim() || 'NA1',
    region,
  };
}

export const SAMPLE_HANDLES = ['Albruh#VAL'] as const;
