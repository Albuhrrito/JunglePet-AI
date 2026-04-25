import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import type { Region } from '@/lib/types';
import { cn } from '@/lib/cn';

interface Props {
  onAnalyze: (riotId: string, tag: string, region: Region) => void;
  className?: string;
  defaultRegion?: Region;
}

const REGION_LABELS: Record<Region, string> = {
  americas: 'NA',
  europe: 'EU',
  asia: 'KR',
  sea: 'SEA',
};

export function SearchPanel({
  onAnalyze,
  className,
  defaultRegion = 'americas',
}: Props) {
  const [riotId, setRiotId] = useState('');
  const [tag, setTag] = useState('');
  const [region, setRegion] = useState<Region>(defaultRegion);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotId.trim() || !tag.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onAnalyze(riotId.trim(), tag.trim(), region);
  };

  const handleDemo = () => {
    setRiotId('Albruh');
    setTag('VAL');
    setRegion('americas');
    setTimeout(() => onAnalyze('Albruh', 'VAL', 'americas'), 80);
  };

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('w-full max-w-xl', className)}
    >
      <form
        onSubmit={handleSubmit}
        className="glass flex items-center gap-1 rounded-2xl p-2 shadow-2xl shadow-jungle-950/60"
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-jungle-400" />
        <input
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          placeholder="Riot ID"
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-jungle-50 outline-none placeholder:text-jungle-500"
          maxLength={32}
        />
        <span className="text-xl text-jungle-500">#</span>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value.toUpperCase())}
          placeholder="TAG"
          className="w-20 bg-transparent px-1 py-3 uppercase tracking-wider text-jungle-50 outline-none placeholder:text-jungle-500"
          maxLength={5}
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          className="cursor-pointer rounded-lg border border-jungle-700/50 bg-jungle-800/60 px-2 py-2 text-sm text-jungle-100 outline-none transition hover:bg-jungle-700/60"
        >
          {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
            <option key={r} value={r} className="bg-jungle-900">
              {REGION_LABELS[r]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="group relative ml-1 overflow-hidden rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-jungle-950 transition active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Analyze
          </span>
          <span className="shimmer absolute inset-0 animate-shimmer opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </form>

      <div className="mt-3 flex items-center justify-center gap-3 text-sm">
        <span className="text-jungle-400">No account? Try</span>
        <button
          onClick={handleDemo}
          className="group inline-flex items-center gap-1.5 font-semibold text-gold-400 transition hover:text-gold-300"
        >
          <span className="border-b border-dashed border-gold-400/40 group-hover:border-gold-300/80">
            Albruh#VAL
          </span>
          <span className="text-jungle-500 transition group-hover:text-jungle-300">
            →
          </span>
        </button>
      </div>
    </motion.div>
  );
}
