export type Region = 'americas' | 'europe' | 'asia' | 'sea';

export type Role = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY';

export type Tier =
  | 'IRON'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'EMERALD'
  | 'DIAMOND'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'CHALLENGER';

export type Division = 'I' | 'II' | 'III' | 'IV';

export type GameMode = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'NORMAL' | 'ARAM';

export interface Match {
  matchId: string;
  championName: string;
  championKey: string;
  role: Role;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  visionScore: number;
  goldEarned: number;
  damageDealt: number;
  damageTaken: number;
  gameDurationSec: number;
  gameMode: GameMode;
  timestamp: number;
}

export interface RankInfo {
  tier: Tier;
  division: Division;
  lp: number;
  wins: number;
  losses: number;
}

export interface Player {
  riotId: string;
  tag: string;
  region: Region;
  level: number;
  rank: RankInfo | null;
  iconId: number;
  matches: Match[];
}

export interface ChampSummary {
  championName: string;
  championKey: string;
  games: number;
  wins: number;
  winRate: number;
  avgKDA: number;
}

export interface AggregateStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgCS: number;
  avgCSPerMin: number;
  avgVisionScore: number;
  avgVisionPerMin: number;
  avgGoldEarned: number;
  avgDamageDealt: number;
  avgDamageTaken: number;
  avgGameDurationSec: number;
  primaryRole: Role;
  roleDistribution: Record<Role, number>;
  champPool: ChampSummary[];
  recentForm: ('W' | 'L')[];
  longestWinStreak: number;
  longestLossStreak: number;
}

export type Severity = 'critical' | 'major' | 'minor' | 'praise';

export type Category =
  | 'farming'
  | 'survival'
  | 'vision'
  | 'consistency'
  | 'macro'
  | 'mental'
  | 'champion';

export type IssueId =
  | 'low_winrate'
  | 'losing_streak'
  | 'low_cs'
  | 'high_deaths'
  | 'low_kda'
  | 'low_vision'
  | 'champ_pool_too_wide'
  | 'champ_pool_struggling'
  | 'low_damage_carry'
  | 'long_games_loss'
  | 'tilt_pattern'
  | 'praise_winrate'
  | 'praise_kda'
  | 'praise_consistency'
  | 'praise_main_champ';

export interface FollowUp {
  label: string;
  key: IssueId | 'general_climb' | 'champ_recommendation' | 'mental_reset';
}

export interface Issue {
  id: IssueId;
  severity: Severity;
  category: Category;
  icon: string;
  title: string;
  diagnosis: string;
  evidence: string;
  recommendations: string[];
  followUps: FollowUp[];
}

export interface AnalysisResult {
  player: Player;
  stats: AggregateStats;
  issues: Issue[];
  praise: Issue[];
  headline: string;
  overallScore: number;
}
