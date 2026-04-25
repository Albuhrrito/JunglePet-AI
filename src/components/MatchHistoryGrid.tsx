import { motion } from 'framer-motion';
import type { Match } from '@/lib/types';

interface Props {
  matches: Match[];
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = diff / (1000 * 60 * 60);
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function MatchHistoryGrid({ matches }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm uppercase tracking-[0.2em] text-jungle-400">
        Recent Matches
      </h3>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
        {matches.slice(0, 12).map((m, i) => {
          const kda = (m.kills + m.assists) / Math.max(m.deaths, 1);
          return (
            <motion.div
              key={m.matchId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`group relative cursor-default rounded-lg border-l-[3px] p-3 backdrop-blur-md transition hover:scale-[1.02] ${
                m.win
                  ? 'border-jungle-400/80 bg-jungle-700/20 hover:bg-jungle-700/30'
                  : 'border-ember-500/80 bg-ember-600/10 hover:bg-ember-600/15'
              }`}
            >
              <div className="mb-1.5 flex items-start justify-between">
                <span className="truncate pr-2 text-sm font-semibold text-jungle-100">
                  {m.championName}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    m.win
                      ? 'bg-jungle-500/30 text-jungle-200'
                      : 'text-ember-300 bg-ember-500/30'
                  }`}
                >
                  {m.win ? 'Win' : 'Loss'}
                </span>
              </div>
              <div className="font-mono text-xs text-jungle-200">
                <span className="text-jungle-100">{m.kills}</span>
                <span className="text-jungle-500"> / </span>
                <span
                  className={
                    m.deaths >= 8 ? 'text-ember-400' : 'text-jungle-100'
                  }
                >
                  {m.deaths}
                </span>
                <span className="text-jungle-500"> / </span>
                <span className="text-jungle-100">{m.assists}</span>
                <span className="ml-2 text-jungle-500">·</span>
                <span className="ml-1 text-gold-400">{kda.toFixed(1)} KDA</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-jungle-400">
                <span>
                  {m.cs} CS · {m.visionScore} vis
                </span>
                <span className="text-jungle-500">
                  {formatDuration(m.gameDurationSec)}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-jungle-600">
                {timeAgo(m.timestamp)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
