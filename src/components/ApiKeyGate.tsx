import { motion } from 'framer-motion';
import { KeyRound, ArrowRight } from 'lucide-react';
import {
  type AppSettings,
  describeKeyStatus,
  hasLiveKeys,
} from '@/lib/secureStore';

interface Props {
  settings: AppSettings;
  onOpenSettings: () => void;
}

export function ApiKeyGate({ settings, onOpenSettings }: Props) {
  if (hasLiveKeys(settings) || settings.demoMode) return null;

  const status = describeKeyStatus(settings);
  const missing: string[] = [];
  if (!status.hasRiot) missing.push('Riot');
  if (!status.hasGemini) missing.push('Gemini');
  if (!status.hasWorker) missing.push('Worker URL');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass flex w-full max-w-xl items-center gap-3 rounded-xl border-l-[3px] border-l-gold-500/80 px-4 py-3"
    >
      <KeyRound className="h-5 w-5 shrink-0 text-gold-400" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-jungle-50">
          Live mode is unconfigured
        </div>
        <div className="text-xs text-jungle-400">
          Missing: {missing.join(', ')}. Add your keys to analyze real accounts.
        </div>
      </div>
      <button
        onClick={onOpenSettings}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-jungle-950 transition hover:brightness-110 active:scale-95"
      >
        Configure
        <ArrowRight className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
