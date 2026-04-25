import type {
  AggregateStats,
  AnalysisResult,
  ChampSummary,
  Issue,
  Match,
  Player,
  Role,
} from './types';

const CS_TARGET: Record<Role, number> = {
  TOP: 6.5,
  JUNGLE: 5.0,
  MIDDLE: 6.5,
  BOTTOM: 7.0,
  UTILITY: 1.5,
};

const VISION_TARGET: Record<Role, number> = {
  TOP: 18,
  JUNGLE: 22,
  MIDDLE: 18,
  BOTTOM: 18,
  UTILITY: 35,
};

const ROLE_LABEL: Record<Role, string> = {
  TOP: 'Top Lane',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid Lane',
  BOTTOM: 'Bot Lane',
  UTILITY: 'Support',
};

export function formatRole(role: Role): string {
  return ROLE_LABEL[role];
}

export function aggregate(player: Player): AggregateStats {
  const matches = player.matches;
  const total = matches.length;
  const wins = matches.filter((m) => m.win).length;
  const losses = total - wins;

  const sumOf = (fn: (m: Match) => number) =>
    matches.reduce((acc, m) => acc + fn(m), 0);

  const totalKills = sumOf((m) => m.kills);
  const totalDeaths = sumOf((m) => m.deaths);
  const totalAssists = sumOf((m) => m.assists);
  const totalCS = sumOf((m) => m.cs);
  const totalVision = sumOf((m) => m.visionScore);
  const totalGold = sumOf((m) => m.goldEarned);
  const totalDamage = sumOf((m) => m.damageDealt);
  const totalDamageTaken = sumOf((m) => m.damageTaken);
  const totalDurationSec = sumOf((m) => m.gameDurationSec);

  const safeDeaths = Math.max(totalDeaths, 1);
  const totalMinutes = totalDurationSec / 60;

  const roleDistribution: Record<Role, number> = {
    TOP: 0,
    JUNGLE: 0,
    MIDDLE: 0,
    BOTTOM: 0,
    UTILITY: 0,
  };
  for (const m of matches) roleDistribution[m.role]++;
  const primaryRole = (Object.keys(roleDistribution) as Role[]).reduce(
    (a, b) => (roleDistribution[a] >= roleDistribution[b] ? a : b),
  );

  const champMap = new Map<
    string,
    { wins: number; games: number; kdaSum: number; key: string }
  >();
  for (const m of matches) {
    const existing = champMap.get(m.championName) ?? {
      wins: 0,
      games: 0,
      kdaSum: 0,
      key: m.championKey,
    };
    existing.games += 1;
    if (m.win) existing.wins += 1;
    existing.kdaSum += (m.kills + m.assists) / Math.max(m.deaths, 1);
    champMap.set(m.championName, existing);
  }
  const champPool: ChampSummary[] = Array.from(champMap.entries())
    .map(([name, v]) => ({
      championName: name,
      championKey: v.key,
      games: v.games,
      wins: v.wins,
      winRate: v.wins / v.games,
      avgKDA: v.kdaSum / v.games,
    }))
    .sort((a, b) => b.games - a.games);

  const recentForm = matches.slice(0, 10).map((m) => (m.win ? 'W' : 'L')) as (
    | 'W'
    | 'L'
  )[];

  // streaks: chronological order
  const chrono = [...matches].sort((a, b) => a.timestamp - b.timestamp);
  let curW = 0;
  let curL = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  for (const m of chrono) {
    if (m.win) {
      curW += 1;
      curL = 0;
      if (curW > longestWinStreak) longestWinStreak = curW;
    } else {
      curL += 1;
      curW = 0;
      if (curL > longestLossStreak) longestLossStreak = curL;
    }
  }

  return {
    totalGames: total,
    wins,
    losses,
    winRate: wins / total,
    avgKills: totalKills / total,
    avgDeaths: totalDeaths / total,
    avgAssists: totalAssists / total,
    avgKDA: (totalKills + totalAssists) / safeDeaths,
    avgCS: totalCS / total,
    avgCSPerMin: totalCS / totalMinutes,
    avgVisionScore: totalVision / total,
    avgVisionPerMin: totalVision / totalMinutes,
    avgGoldEarned: totalGold / total,
    avgDamageDealt: totalDamage / total,
    avgDamageTaken: totalDamageTaken / total,
    avgGameDurationSec: totalDurationSec / total,
    primaryRole,
    roleDistribution,
    champPool,
    recentForm,
    longestWinStreak,
    longestLossStreak,
  };
}

// --- Issue detectors ---------------------------------------------------------

function detectLowWinRate(s: AggregateStats): Issue | null {
  if (s.winRate >= 0.5) return null;
  const wrPct = (s.winRate * 100).toFixed(0);
  const severity =
    s.winRate < 0.4 ? 'critical' : s.winRate < 0.46 ? 'major' : 'minor';
  return {
    id: 'low_winrate',
    severity,
    category: 'consistency',
    icon: 'TrendingDown',
    title: 'Win rate is bleeding LP',
    diagnosis:
      'Below 50% means you lose LP over time. The fastest fix is usually narrowing the champ pool and fixing the highest-impact mechanical issue first.',
    evidence: `${s.wins}W / ${s.losses}L (${wrPct}%) across the last ${s.totalGames} games.`,
    recommendations: [
      'Pick the same champion 3 games in a row before swapping. Repetition compounds.',
      'After every loss, write one sentence: "what went wrong" and "what I will change next game".',
      'Stop queueing after 2 losses in a row. Brain fatigue is silently costing LP.',
    ],
    followUps: [
      { label: 'Why am I losing?', key: 'low_winrate' },
      { label: 'Mental reset tips', key: 'mental_reset' },
    ],
  };
}

function detectLosingStreak(s: AggregateStats): Issue | null {
  if (s.longestLossStreak < 3) return null;
  const severity = s.longestLossStreak >= 5 ? 'critical' : 'major';
  return {
    id: 'losing_streak',
    severity,
    category: 'mental',
    icon: 'Flame',
    title: `${s.longestLossStreak}-game loss streak detected`,
    diagnosis:
      'Loss streaks are more often a tilt-spiral than a skill issue. Each loss makes the next one more likely if you queue back instantly.',
    evidence: `Longest loss streak in this set: ${s.longestLossStreak} games. Recent form: ${s.recentForm.join(' ')}.`,
    recommendations: [
      'Hard rule: 2 losses → log out for 30 minutes. Walk, drink water, eat.',
      'Replay the last loss. Find one decision that lost you the game. Just one.',
      'Switch to a comfort pick for the next game. No experimenting on tilt.',
    ],
    followUps: [
      { label: 'Mental reset tips', key: 'mental_reset' },
      { label: 'How to climb', key: 'general_climb' },
    ],
  };
}

function detectLowCS(s: AggregateStats): Issue | null {
  if (s.primaryRole === 'UTILITY') return null;
  const target = CS_TARGET[s.primaryRole];
  if (s.avgCSPerMin >= target) return null;
  const gap = target - s.avgCSPerMin;
  const severity = gap > 1.5 ? 'critical' : gap > 0.6 ? 'major' : 'minor';
  return {
    id: 'low_cs',
    severity,
    category: 'farming',
    icon: 'Wheat',
    title: 'CS per minute below benchmark',
    diagnosis:
      'CS is gold, gold is items, items win duels. This is the cheapest stat to fix and it compounds across every game.',
    evidence: `${s.avgCSPerMin.toFixed(1)} CS/min as ${ROLE_LABEL[s.primaryRole]}. Benchmark for your bracket: ${target.toFixed(1)}+ CS/min.`,
    recommendations: [
      'Practice Tool drill: 100 CS by 10:00 with no items, no runes. Repeat 3x daily.',
      "Set a per-game target: just +0.5 CS/min over your average. Don't skip waves to gank.",
      'Last-hit only — no auto-attacks while pushing unless you mean to push.',
    ],
    followUps: [
      { label: 'CS deep dive', key: 'low_cs' },
      { label: 'How to climb', key: 'general_climb' },
    ],
  };
}

function detectHighDeaths(s: AggregateStats): Issue | null {
  if (s.avgDeaths < 6) return null;
  const severity =
    s.avgDeaths > 8 ? 'critical' : s.avgDeaths > 7 ? 'major' : 'minor';
  return {
    id: 'high_deaths',
    severity,
    category: 'survival',
    icon: 'Skull',
    title: 'Dying too often',
    diagnosis:
      'Each death gives the enemy ~300 gold and 20+ seconds of map control. Halving your deaths is worth more than doubling your kills.',
    evidence: `${s.avgDeaths.toFixed(1)} deaths/game over ${s.totalGames} games. Healthy range: under 5.`,
    recommendations: [
      'Look at your minimap every 3 seconds. Set a metronome in your head.',
      'Buy a control ward every back. Vision = survival.',
      'Hard rule: never extend past river without seeing all 5 enemies on map.',
    ],
    followUps: [
      { label: 'Why am I dying?', key: 'high_deaths' },
      { label: 'How to climb', key: 'general_climb' },
    ],
  };
}

function detectLowKDA(s: AggregateStats): Issue | null {
  if (s.avgKDA >= 2.5) return null;
  const severity =
    s.avgKDA < 1.5 ? 'critical' : s.avgKDA < 2.0 ? 'major' : 'minor';
  return {
    id: 'low_kda',
    severity,
    category: 'consistency',
    icon: 'Activity',
    title: 'KDA suggests fight selection issues',
    diagnosis:
      "Low KDA usually means you're taking fights you can't win. You don't need more aggression — you need better fight selection.",
    evidence: `Avg KDA ${s.avgKDA.toFixed(2)} (${s.avgKills.toFixed(1)} / ${s.avgDeaths.toFixed(1)} / ${s.avgAssists.toFixed(1)}).`,
    recommendations: [
      'Before every fight ask: "What do I gain if I win this?" If the answer is "nothing", walk away.',
      'Track your "first death" timing. If it\'s before 8 minutes, you\'re overcommitting in lane.',
      'Watch a coaching VOD of your top champ. Specifically: when do they back off?',
    ],
    followUps: [
      { label: 'Champ recommendations', key: 'champ_recommendation' },
      { label: 'How to climb', key: 'general_climb' },
    ],
  };
}

function detectLowVision(s: AggregateStats): Issue | null {
  const target = VISION_TARGET[s.primaryRole];
  if (s.avgVisionScore >= target) return null;
  const gap = target - s.avgVisionScore;
  const severity = gap > 10 ? 'critical' : gap > 5 ? 'major' : 'minor';
  return {
    id: 'low_vision',
    severity,
    category: 'vision',
    icon: 'Eye',
    title: 'Vision score is dragging you down',
    diagnosis:
      'Vision is the most undervalued climbing stat. Every ward placed = info advantage = better decisions = wins.',
    evidence: `Avg vision score ${s.avgVisionScore.toFixed(1)} as ${ROLE_LABEL[s.primaryRole]}. Target: ${target}+.`,
    recommendations: [
      'Buy a control ward every back. Non-negotiable, even as a non-support.',
      'Sweep with your oracle lens before every objective. Always.',
      "Use your trinket on cooldown. If it's up, you're losing free vision.",
    ],
    followUps: [
      { label: 'Vision deep dive', key: 'low_vision' },
      { label: 'How to climb', key: 'general_climb' },
    ],
  };
}

function detectWideChampPool(s: AggregateStats): Issue | null {
  const distinct = s.champPool.length;
  if (distinct < 6) return null;
  const severity = distinct >= 8 ? 'major' : 'minor';
  return {
    id: 'champ_pool_too_wide',
    severity,
    category: 'champion',
    icon: 'Layers',
    title: 'Champion pool is too wide',
    diagnosis:
      "Mastery scales with reps. Playing 8 different champs in 20 games means you're still learning each — not winning with any.",
    evidence: `${distinct} distinct champions across ${s.totalGames} games.`,
    recommendations: [
      'Pick 2 champions max for the next 30 games. One main, one backup for counter-picks.',
      `Your highest-WR champ here is ${s.champPool.slice().sort((a, b) => b.winRate - a.winRate)[0]?.championName ?? 'unknown'} — start there.`,
      "Resist the urge to one-trick a hot pick from streamers until you're Plat+.",
    ],
    followUps: [
      { label: 'Champ recommendations', key: 'champ_recommendation' },
      { label: 'How to climb', key: 'general_climb' },
    ],
  };
}

function detectStrugglingChamp(s: AggregateStats): Issue | null {
  const candidate = s.champPool.find((c) => c.games >= 4 && c.winRate < 0.4);
  if (!candidate) return null;
  const severity = candidate.winRate < 0.3 ? 'major' : 'minor';
  return {
    id: 'champ_pool_struggling',
    severity,
    category: 'champion',
    icon: 'AlertCircle',
    title: `${candidate.championName} is dragging your win rate`,
    diagnosis:
      'A high-volume champion with a sub-40% win rate is the single biggest LP leak in your account.',
    evidence: `${candidate.championName}: ${candidate.wins}W / ${candidate.games - candidate.wins}L (${(candidate.winRate * 100).toFixed(0)}%).`,
    recommendations: [
      `Bench ${candidate.championName} for 10 games. Period.`,
      'Watch one ranked VOD of a Master+ player on this champ before unbanning yourself.',
      'Or — just commit to your higher-WR pick instead. The math is the math.',
    ],
    followUps: [
      { label: 'Champ recommendations', key: 'champ_recommendation' },
    ],
  };
}

// --- Praise detectors --------------------------------------------------------

function praiseStrongChamp(s: AggregateStats): Issue | null {
  const star = s.champPool.find((c) => c.games >= 3 && c.winRate >= 0.65);
  if (!star) return null;
  return {
    id: 'praise_main_champ',
    severity: 'praise',
    category: 'champion',
    icon: 'Star',
    title: `${star.championName} is your weapon`,
    diagnosis:
      "You have a clear power-pick. Lean into it harder — most players don't even have one.",
    evidence: `${star.championName}: ${star.wins}W / ${star.games - star.wins}L (${(star.winRate * 100).toFixed(0)}%) — well above your overall.`,
    recommendations: [
      `When climbing matters most, first-pick ${star.championName}.`,
      "Study what's working: your build, your matchups, your power spike timings.",
      'Consider this your "panic button" champion when on tilt or after losses.',
    ],
    followUps: [
      { label: 'Champ recommendations', key: 'champ_recommendation' },
    ],
  };
}

function praiseHighKDA(s: AggregateStats): Issue | null {
  if (s.avgKDA < 4) return null;
  return {
    id: 'praise_kda',
    severity: 'praise',
    category: 'consistency',
    icon: 'Award',
    title: 'KDA is elite for your bracket',
    diagnosis:
      "You stay alive and contribute consistently. That's the foundation of carrying.",
    evidence: `Avg KDA ${s.avgKDA.toFixed(2)} — top 15% in your bracket.`,
    recommendations: [
      'Now translate it into win rate: more aggressive objective control.',
      "Look for the fight where you're ahead — initiate, don't wait.",
    ],
    followUps: [{ label: 'How to climb', key: 'general_climb' }],
  };
}

function praiseWinRate(s: AggregateStats): Issue | null {
  if (s.winRate < 0.55) return null;
  return {
    id: 'praise_winrate',
    severity: 'praise',
    category: 'consistency',
    icon: 'TrendingUp',
    title: "You're in promo territory",
    diagnosis:
      "Above 55% means you're actively climbing. The job now is sustainability — don't change what's working.",
    evidence: `${(s.winRate * 100).toFixed(0)}% win rate over ${s.totalGames} games.`,
    recommendations: [
      "Don't experiment. Same champ, same role, same playstyle.",
      'Cap your daily games at 5. Quality > volume on a hot streak.',
    ],
    followUps: [{ label: 'How to climb', key: 'general_climb' }],
  };
}

// --- Public API --------------------------------------------------------------

const SEVERITY_RANK: Record<Issue['severity'], number> = {
  critical: 0,
  major: 1,
  minor: 2,
  praise: 3,
};

function buildHeadline(
  player: Player,
  stats: AggregateStats,
  issues: Issue[],
  praise: Issue[],
): string {
  const name = player.riotId;
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const major = issues.filter((i) => i.severity === 'major').length;

  if (critical >= 2) {
    return `Hey ${name}, plenty of climbing fuel in this data. Let's go after the highest-impact fixes first.`;
  }
  if (critical === 1) {
    return `Solid foundations, ${name}. There's one big leak we should plug before anything else.`;
  }
  if (major >= 3) {
    return `Plenty to work with, ${name}. I'll walk you through the highest-impact items first — these are where your LP is leaking.`;
  }
  if (major >= 1) {
    return `Solid baseline, ${name}. There's a couple of high-impact levers we should pull first.`;
  }
  if (issues.length === 0 && praise.length > 0) {
    return `${name}, you're cooking. Let's keep the formula intact and ride this wave.`;
  }
  if (issues.length === 0) {
    return `Clean read on your last ${stats.totalGames} games, ${name}. Hard to find anything to fix — keep doing what you're doing.`;
  }
  return `Walked through your last ${stats.totalGames} games, ${name}. Just a few refinements and you're climbing.`;
}

function computeOverallScore(
  stats: AggregateStats,
  issues: Issue[],
  praise: Issue[],
): number {
  let score = 50;
  score += (stats.winRate - 0.5) * 100; // ±50 from win rate baseline

  for (const i of issues) {
    if (i.severity === 'critical') score -= 12;
    else if (i.severity === 'major') score -= 6;
    else if (i.severity === 'minor') score -= 3;
  }
  for (const _p of praise) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Deterministic rule-based analysis. Used as the offline fallback when the
 * AI coach is unavailable, and to compute the aggregate stats that the AI
 * coach uses as input (so the model never sees raw match JSON).
 */
export function analyzeFallback(player: Player): AnalysisResult {
  const stats = aggregate(player);

  const issueDetectors = [
    detectLowWinRate,
    detectLosingStreak,
    detectLowCS,
    detectHighDeaths,
    detectLowKDA,
    detectLowVision,
    detectWideChampPool,
    detectStrugglingChamp,
  ];
  const praiseDetectors = [praiseStrongChamp, praiseHighKDA, praiseWinRate];

  const issues = issueDetectors
    .map((d) => d(stats))
    .filter((x): x is Issue => x !== null)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const praise = praiseDetectors
    .map((d) => d(stats))
    .filter((x): x is Issue => x !== null);

  const headline = buildHeadline(player, stats, issues, praise);
  const overallScore = computeOverallScore(stats, issues, praise);

  return { player, stats, issues, praise, headline, overallScore };
}
