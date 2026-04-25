import { motion } from 'framer-motion';
import { Swords, Wheat, Eye, Activity, Clock, TrendingUp } from 'lucide-react';
import type { AggregateStats } from '@/lib/types';

interface StatCard {
  icon: typeof Swords;
  label: string;
  value: string;
  sub: string;
  tone: 'good' | 'mid' | 'bad' | 'neutral';
}

function bench(value: number, target: number): StatCard['tone'] {
  if (value >= target * 1.05) return 'good';
  if (value >= target * 0.9) return 'mid';
  return 'bad';
}

const TONE: Record<StatCard['tone'], string> = {
  good: 'text-jungle-300 border-jungle-400/40',
  mid: 'text-gold-300 border-gold-400/40',
  bad: 'text-ember-400 border-ember-500/40',
  neutral: 'text-jungle-200 border-jungle-700/60',
};

interface Props {
  stats: AggregateStats;
}

export function StatsDashboard({ stats }: Props) {
  const winRatePct = stats.winRate * 100;
  const avgDurationMin = stats.avgGameDurationSec / 60;

  const cards: StatCard[] = [
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: `${winRatePct.toFixed(0)}%`,
      sub: `${stats.wins}W ${stats.losses}L`,
      tone: winRatePct >= 55 ? 'good' : winRatePct >= 50 ? 'mid' : 'bad',
    },
    {
      icon: Activity,
      label: 'Avg KDA',
      value: stats.avgKDA.toFixed(2),
      sub: `${stats.avgKills.toFixed(1)} / ${stats.avgDeaths.toFixed(1)} / ${stats.avgAssists.toFixed(1)}`,
      tone: stats.avgKDA >= 3 ? 'good' : stats.avgKDA >= 2 ? 'mid' : 'bad',
    },
    {
      icon: Wheat,
      label: 'CS / min',
      value: stats.avgCSPerMin.toFixed(1),
      sub: `${stats.avgCS.toFixed(0)} avg total`,
      tone: bench(stats.avgCSPerMin, 5.5),
    },
    {
      icon: Eye,
      label: 'Vision',
      value: stats.avgVisionScore.toFixed(0),
      sub: `${stats.avgVisionPerMin.toFixed(2)} / min`,
      tone: bench(stats.avgVisionScore, 18),
    },
    {
      icon: Swords,
      label: 'Damage',
      value: `${(stats.avgDamageDealt / 1000).toFixed(1)}k`,
      sub: `${(stats.avgDamageTaken / 1000).toFixed(1)}k taken`,
      tone: 'neutral',
    },
    {
      icon: Clock,
      label: 'Game Time',
      value: `${avgDurationMin.toFixed(0)}:${Math.round(
        (avgDurationMin % 1) * 60,
      )
        .toString()
        .padStart(2, '0')}`,
      sub: `avg duration`,
      tone: 'neutral',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-jungle-400">
          Performance Snapshot
        </h3>
        <div className="flex items-center gap-1">
          {stats.recentForm.map((r, i) => (
            <div
              key={i}
              className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                r === 'W'
                  ? 'bg-jungle-500/30 text-jungle-200'
                  : 'text-ember-300 bg-ember-500/25'
              }`}
              title={`Game ${stats.recentForm.length - i}: ${r === 'W' ? 'Win' : 'Loss'}`}
            >
              {r}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`glass rounded-xl border p-4 ${TONE[card.tone]}`}
          >
            <div className="mb-2 flex items-center justify-between text-jungle-400">
              <span className="text-[11px] font-semibold uppercase tracking-widest">
                {card.label}
              </span>
              <card.icon className="h-3.5 w-3.5 opacity-70" />
            </div>
            <div className="font-display text-2xl font-black">{card.value}</div>
            <div className="mt-1 font-mono text-xs text-jungle-400">
              {card.sub}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
