import { Shield } from 'lucide-react';
import type { RankInfo, Tier } from '@/lib/types';

const TIER_STYLES: Record<Tier, { bg: string; ring: string; text: string }> = {
  IRON: {
    bg: 'from-zinc-700 to-zinc-900',
    ring: 'ring-zinc-500/40',
    text: 'text-zinc-200',
  },
  BRONZE: {
    bg: 'from-amber-700 to-amber-900',
    ring: 'ring-amber-500/40',
    text: 'text-amber-100',
  },
  SILVER: {
    bg: 'from-slate-400 to-slate-600',
    ring: 'ring-slate-300/40',
    text: 'text-slate-50',
  },
  GOLD: {
    bg: 'from-gold-500 to-gold-700',
    ring: 'ring-gold-400/60',
    text: 'text-gold-50',
  },
  PLATINUM: {
    bg: 'from-teal-500 to-teal-700',
    ring: 'ring-teal-400/40',
    text: 'text-teal-50',
  },
  EMERALD: {
    bg: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-400/40',
    text: 'text-emerald-50',
  },
  DIAMOND: {
    bg: 'from-sky-500 to-sky-700',
    ring: 'ring-sky-400/40',
    text: 'text-sky-50',
  },
  MASTER: {
    bg: 'from-purple-500 to-purple-700',
    ring: 'ring-purple-400/50',
    text: 'text-purple-50',
  },
  GRANDMASTER: {
    bg: 'from-red-600 to-red-800',
    ring: 'ring-red-400/50',
    text: 'text-red-50',
  },
  CHALLENGER: {
    bg: 'from-yellow-300 to-yellow-500',
    ring: 'ring-yellow-200/60',
    text: 'text-yellow-950',
  },
};

interface Props {
  rank: RankInfo | null;
}

export function RankBadge({ rank }: Props) {
  if (!rank) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-jungle-800/60 px-3 py-1.5 text-sm text-jungle-400">
        <Shield className="h-4 w-4" />
        Unranked
      </div>
    );
  }

  const style = TIER_STYLES[rank.tier];
  const winRate = ((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(0);

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl bg-gradient-to-br px-4 py-2 ${style.bg} ring-1 ${style.ring} shadow-lg`}
    >
      <Shield className={`h-5 w-5 ${style.text}`} />
      <div className="flex flex-col leading-tight">
        <div
          className={`font-display text-sm font-bold uppercase tracking-wider ${style.text}`}
        >
          {rank.tier} {rank.division}
        </div>
        <div className={`font-mono text-xs ${style.text} opacity-90`}>
          {rank.lp} LP · {winRate}% WR
        </div>
      </div>
    </div>
  );
}
