import type {
  GameMode,
  Match,
  Player,
  RankInfo,
  Region,
  Role,
  Tier,
  Division,
} from './types';
import type {
  RiotAccount,
  RiotLeagueEntry,
  RiotMatch,
  RiotMatchParticipant,
} from './riotApi';

const ROLE_MAP: Record<string, Role> = {
  TOP: 'TOP',
  JUNGLE: 'JUNGLE',
  MIDDLE: 'MIDDLE',
  BOTTOM: 'BOTTOM',
  UTILITY: 'UTILITY',
};

function mapRole(participant: RiotMatchParticipant): Role {
  const candidate = participant.teamPosition || participant.individualPosition;
  return ROLE_MAP[candidate] ?? 'MIDDLE';
}

function mapGameMode(queueId: number): GameMode {
  switch (queueId) {
    case 420:
      return 'RANKED_SOLO_5x5';
    case 440:
      return 'RANKED_FLEX_SR';
    case 450:
    case 1900:
      return 'ARAM';
    default:
      return 'NORMAL';
  }
}

const VALID_TIERS: Tier[] = [
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
];

const VALID_DIVISIONS: Division[] = ['I', 'II', 'III', 'IV'];

export function transformMatch(raw: RiotMatch, puuid: string): Match | null {
  const self = raw.info.participants.find((p) => p.puuid === puuid);
  if (!self) return null;
  const cs = self.totalMinionsKilled + self.neutralMinionsKilled;
  return {
    matchId: raw.metadata.matchId,
    championName: self.championName,
    championKey: self.championName.replace(/[^a-zA-Z0-9]/g, ''),
    role: mapRole(self),
    win: self.win,
    kills: self.kills,
    deaths: self.deaths,
    assists: self.assists,
    cs,
    visionScore: self.visionScore,
    goldEarned: self.goldEarned,
    damageDealt: self.totalDamageDealtToChampions,
    damageTaken: self.totalDamageTaken,
    gameDurationSec: raw.info.gameDuration,
    gameMode: mapGameMode(raw.info.queueId),
    timestamp: raw.info.gameStartTimestamp,
  };
}

export function transformRank(entries: RiotLeagueEntry[]): RankInfo | null {
  // Prefer solo queue, fall back to flex
  const solo = entries.find((e) => e.queueType === 'RANKED_SOLO_5x5');
  const flex = entries.find((e) => e.queueType === 'RANKED_FLEX_SR');
  const entry = solo ?? flex;
  if (!entry) return null;

  const tier = entry.tier.toUpperCase() as Tier;
  const division = entry.rank.toUpperCase() as Division;
  if (!VALID_TIERS.includes(tier)) return null;
  if (!VALID_DIVISIONS.includes(division)) return null;

  return {
    tier,
    division,
    lp: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
  };
}

export function buildPlayer(args: {
  account: RiotAccount;
  region: Region;
  matches: Match[];
  rank: RankInfo | null;
  level?: number;
  iconId?: number;
}): Player {
  return {
    riotId: args.account.gameName,
    tag: args.account.tagLine,
    region: args.region,
    level: args.level ?? 0,
    rank: args.rank,
    iconId: args.iconId ?? 0,
    matches: args.matches,
  };
}
