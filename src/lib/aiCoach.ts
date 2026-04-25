import type {
  AggregateStats,
  AnalysisResult,
  Category,
  Issue,
  IssueId,
  Player,
  Severity,
} from './types';
import { genericFetch } from './transport';

export class AiCoachError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiCoachError';
  }
}

export interface AiCoach {
  analyze(player: Player, stats: AggregateStats): Promise<AnalysisResult>;
  followUp(
    question: string,
    ctx: { player: Player; stats: AggregateStats; previousIssues: Issue[] },
  ): AsyncIterable<string>;
}

export interface GeminiOpts {
  apiKey: string;
  workerUrl: string;
  model?: string;
}

// --- Prompt building --------------------------------------------------------

const SYSTEM_ANALYSIS = `You are JunglePet, a direct, encouraging League of Legends coach. You analyze player stats and produce specific, actionable feedback.

Your voice:
- Conversational and warm, but direct. No platitudes.
- Punchy sentences. Cite specific numbers from the stats.
- Recommendations must be concrete and immediately drillable, not abstract.

Role benchmarks for Gold-Plat tier:
- TOP/MID: 6.5+ CS/min, 18+ vision, 2.5+ KDA
- JUNGLE: 5.0+ CS/min, 22+ vision, smart pathing
- BOTTOM: 7.0+ CS/min, 18+ vision, 25k+ damage
- UTILITY: 35+ vision, 10+ assists/game

Common climbing issues:
- Wide champion pool (>5 different champs in 20 games)
- Death frequency (>6 deaths/game points to vision/positioning issues)
- Mid-50% win rate stuck on a struggling champion
- Loss streaks > 3 = tilt spiral, not skill drop

Output rules:
- 4-6 issues prioritized by impact (critical first, then major, then minor).
- 1-2 praise items ONLY if measurably above the player's baseline. Do not invent compliments.
- Pick "icon" from this exact set: Wheat, Skull, Eye, Activity, Layers, AlertCircle, Star, Award, TrendingUp, TrendingDown, Flame
- Pick "category" from: farming, survival, vision, consistency, macro, mental, champion
- Pick "severity" from: critical, major, minor (for issues) or praise (for strengths only)
- Pick "id" from a stable list: low_winrate, losing_streak, low_cs, high_deaths, low_kda, low_vision, champ_pool_too_wide, champ_pool_struggling, low_damage_carry, long_games_loss, tilt_pattern, praise_winrate, praise_kda, praise_consistency, praise_main_champ
- "evidence" must reference at least one specific number from the input.
- "recommendations" array: 2-3 punchy actionable items per issue.
- "headline" is one warm, direct sentence to open the conversation.
- "overallScore" is 0-100, with critical issues subtracting more than minors.`;

const SYSTEM_FOLLOWUP = `You are JunglePet, the LoL coach. The user has already seen their analysis and is asking a follow-up question. Reply in 2-3 short paragraphs followed by 3-4 bullet points of concrete actions. Keep voice warm, direct, specific. Reference the player's actual stats when relevant. Plain text only — no markdown headers, no JSON.`;

function rankString(player: Player): string {
  const r = player.rank;
  if (!r) return 'Unranked';
  return `${r.tier} ${r.division} (${r.lp} LP)`;
}

function buildAnalyzeUserPrompt(player: Player, stats: AggregateStats): string {
  const champLines = stats.champPool
    .map(
      (c) =>
        `  - ${c.championName}: ${c.games} games, ${(c.winRate * 100).toFixed(0)}% WR, ${c.avgKDA.toFixed(2)} avg KDA`,
    )
    .join('\n');
  return `Player: ${player.riotId}#${player.tag}
Rank: ${rankString(player)}
Region: ${player.region}
Primary role: ${stats.primaryRole}

Last ${stats.totalGames} games:
- Win rate: ${(stats.winRate * 100).toFixed(0)}% (${stats.wins}W / ${stats.losses}L)
- Avg KDA: ${stats.avgKDA.toFixed(2)} (${stats.avgKills.toFixed(1)} / ${stats.avgDeaths.toFixed(1)} / ${stats.avgAssists.toFixed(1)})
- Avg CS/min: ${stats.avgCSPerMin.toFixed(2)}
- Avg vision score: ${stats.avgVisionScore.toFixed(1)}
- Avg damage dealt: ${stats.avgDamageDealt.toFixed(0)}
- Avg gold earned: ${stats.avgGoldEarned.toFixed(0)}
- Avg game duration: ${(stats.avgGameDurationSec / 60).toFixed(1)} min
- Recent form (newest first): ${stats.recentForm.join(' ')}
- Longest win streak: ${stats.longestWinStreak}
- Longest loss streak: ${stats.longestLossStreak}

Champion pool (${stats.champPool.length} distinct):
${champLines}

Generate the analysis as JSON matching the response schema.`;
}

function buildFollowUpPrompt(
  question: string,
  ctx: { player: Player; stats: AggregateStats; previousIssues: Issue[] },
): string {
  const topIssues = ctx.previousIssues
    .slice(0, 3)
    .map((i) => `- ${i.title} (${i.severity}): ${i.evidence}`)
    .join('\n');
  return `Player: ${ctx.player.riotId}#${ctx.player.tag} (${rankString(ctx.player)}, ${ctx.stats.primaryRole})
Win rate: ${(ctx.stats.winRate * 100).toFixed(0)}%, Avg KDA: ${ctx.stats.avgKDA.toFixed(2)}, CS/min: ${ctx.stats.avgCSPerMin.toFixed(2)}, Vision: ${ctx.stats.avgVisionScore.toFixed(0)}
Top issues from analysis:
${topIssues || '(none)'}

User question: ${question}

Answer.`;
}

// --- Response schema (Gemini structured output) -----------------------------

const ISSUE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    severity: {
      type: 'string',
      enum: ['critical', 'major', 'minor', 'praise'],
    },
    category: {
      type: 'string',
      enum: [
        'farming',
        'survival',
        'vision',
        'consistency',
        'macro',
        'mental',
        'champion',
      ],
    },
    icon: { type: 'string' },
    title: { type: 'string' },
    diagnosis: { type: 'string' },
    evidence: { type: 'string' },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'id',
    'severity',
    'category',
    'icon',
    'title',
    'diagnosis',
    'evidence',
    'recommendations',
  ],
};

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    overallScore: { type: 'integer' },
    issues: { type: 'array', items: ISSUE_SCHEMA },
    praise: { type: 'array', items: ISSUE_SCHEMA },
  },
  required: ['headline', 'overallScore', 'issues', 'praise'],
};

// --- Helpers ----------------------------------------------------------------

const VALID_SEVERITIES: Severity[] = ['critical', 'major', 'minor', 'praise'];
const VALID_CATEGORIES: Category[] = [
  'farming',
  'survival',
  'vision',
  'consistency',
  'macro',
  'mental',
  'champion',
];
const VALID_ICONS = new Set([
  'Wheat',
  'Skull',
  'Eye',
  'Activity',
  'Layers',
  'AlertCircle',
  'Star',
  'Award',
  'TrendingUp',
  'TrendingDown',
  'Flame',
]);

const FOLLOW_UP_BANK: Record<string, Issue['followUps']> = {
  default: [
    { label: 'How do I climb?', key: 'general_climb' },
    { label: 'Champion advice', key: 'champ_recommendation' },
  ],
  farming: [
    { label: 'CS deep dive', key: 'low_cs' },
    { label: 'How do I climb?', key: 'general_climb' },
  ],
  survival: [
    { label: 'Why am I dying?', key: 'high_deaths' },
    { label: 'Mental reset tips', key: 'mental_reset' },
  ],
  vision: [
    { label: 'Vision deep dive', key: 'low_vision' },
    { label: 'How do I climb?', key: 'general_climb' },
  ],
  champion: [
    { label: 'Champion advice', key: 'champ_recommendation' },
    { label: 'How do I climb?', key: 'general_climb' },
  ],
  mental: [
    { label: 'Mental reset tips', key: 'mental_reset' },
    { label: 'How do I climb?', key: 'general_climb' },
  ],
  consistency: [{ label: 'How do I climb?', key: 'general_climb' }],
  macro: [{ label: 'How do I climb?', key: 'general_climb' }],
};

interface RawIssue {
  id?: string;
  severity?: string;
  category?: string;
  icon?: string;
  title?: string;
  diagnosis?: string;
  evidence?: string;
  recommendations?: string[];
}

function sanitizeIssue(raw: RawIssue): Issue | null {
  if (!raw.title || !raw.diagnosis || !raw.evidence) return null;
  const severity = (
    VALID_SEVERITIES.includes(raw.severity as Severity) ? raw.severity : 'minor'
  ) as Severity;
  const category = (
    VALID_CATEGORIES.includes(raw.category as Category)
      ? raw.category
      : 'consistency'
  ) as Category;
  const icon = VALID_ICONS.has(raw.icon ?? '')
    ? (raw.icon as string)
    : 'AlertCircle';
  const recs = Array.isArray(raw.recommendations)
    ? raw.recommendations.filter((r) => typeof r === 'string').slice(0, 4)
    : [];
  if (recs.length === 0) return null;
  return {
    id: (raw.id as IssueId) || ('low_winrate' as IssueId),
    severity,
    category,
    icon,
    title: raw.title,
    diagnosis: raw.diagnosis,
    evidence: raw.evidence,
    recommendations: recs,
    followUps: FOLLOW_UP_BANK[category] ?? FOLLOW_UP_BANK.default,
  };
}

interface RawAnalysis {
  headline?: string;
  overallScore?: number;
  issues?: RawIssue[];
  praise?: RawIssue[];
}

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  major: 1,
  minor: 2,
  praise: 3,
};

function mapToAnalysisResult(
  raw: RawAnalysis,
  player: Player,
  stats: AggregateStats,
): AnalysisResult {
  const issues = (raw.issues ?? [])
    .map(sanitizeIssue)
    .filter((x): x is Issue => x !== null)
    .filter((x) => x.severity !== 'praise')
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const praise = (raw.praise ?? [])
    .map((p) => sanitizeIssue({ ...p, severity: 'praise' }))
    .filter((x): x is Issue => x !== null);

  const overallScore = Math.max(
    0,
    Math.min(100, Math.round(raw.overallScore ?? 50)),
  );
  const headline =
    typeof raw.headline === 'string' && raw.headline.trim()
      ? raw.headline
      : `Walked through your last ${stats.totalGames} games, ${player.riotId}.`;

  return { player, stats, issues, praise, headline, overallScore };
}

// --- Gemini implementation --------------------------------------------------

export class GeminiCoach implements AiCoach {
  private model: string;

  constructor(private opts: GeminiOpts) {
    this.model = opts.model ?? 'gemini-2.0-flash';
  }

  async analyze(
    player: Player,
    stats: AggregateStats,
  ): Promise<AnalysisResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.opts.apiKey)}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: buildAnalyzeUserPrompt(player, stats) }],
        },
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_ANALYSIS }],
      },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.6,
      },
    };

    const res = await genericFetch(url, this.opts.workerUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new AiCoachError(
        `Gemini ${res.status}: ${errText.slice(0, 200) || res.statusText}`,
      );
    }
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new AiCoachError('Gemini returned an empty response.');
    }
    let parsed: RawAnalysis;
    try {
      parsed = JSON.parse(text) as RawAnalysis;
    } catch {
      throw new AiCoachError('Gemini returned malformed JSON.');
    }
    return mapToAnalysisResult(parsed, player, stats);
  }

  async *followUp(
    question: string,
    ctx: { player: Player; stats: AggregateStats; previousIssues: Issue[] },
  ): AsyncIterable<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(this.opts.apiKey)}`;
    const body = {
      contents: [
        { role: 'user', parts: [{ text: buildFollowUpPrompt(question, ctx) }] },
      ],
      systemInstruction: { parts: [{ text: SYSTEM_FOLLOWUP }] },
      generationConfig: { temperature: 0.7 },
    };
    const res = await genericFetch(url, this.opts.workerUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new AiCoachError(
        `Gemini ${res.status}: ${errText.slice(0, 200) || res.statusText}`,
      );
    }
    const reader = res.body?.getReader();
    if (!reader) throw new AiCoachError('No streaming body from Gemini.');
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;
          try {
            const parsed = JSON.parse(payload) as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
              }>;
            };
            const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunk) yield chunk;
          } catch {
            // SSE may have keep-alive lines or partials; ignore parse errors.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
