import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { formatRole } from '@/lib/analyzer';
import { MascotLogo } from './MascotLogo';
import { RankBadge } from './RankBadge';
import { ScoreCircle } from './ScoreCircle';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export function PlayerHeader({ result, onReset }: Props) {
  const { player, stats, overallScore } = result;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong flex flex-wrap items-center gap-4 rounded-2xl px-5 py-4"
    >
      <button
        onClick={onReset}
        className="group flex items-center gap-2 text-sm text-jungle-400 transition hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">Analyze another</span>
      </button>

      <div className="hidden h-8 w-px bg-jungle-700/60 sm:block" />

      <div className="flex items-center gap-3">
        <MascotLogo size={44} animate={false} />
        <div className="leading-tight">
          <div className="gold-text font-display text-lg font-bold">
            {player.riotId}
            <span className="font-normal text-jungle-500">#{player.tag}</span>
          </div>
          <div className="text-xs text-jungle-400">
            Lv. {player.level} · {formatRole(stats.primaryRole)} ·{' '}
            {stats.totalGames} games analyzed
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <RankBadge rank={player.rank} />
        <div className="hidden sm:flex">
          <ScoreCircle score={overallScore} />
        </div>
      </div>
    </motion.header>
  );
}
