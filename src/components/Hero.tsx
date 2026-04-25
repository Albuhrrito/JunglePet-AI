import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Brain, MessageCircle, AlertTriangle } from 'lucide-react';
import type { Region } from '@/lib/types';
import type { AppSettings } from '@/lib/secureStore';
import { hasLiveKeys } from '@/lib/secureStore';
import { MascotLogo } from './MascotLogo';
import { SearchPanel } from './SearchPanel';
import { ApiKeyGate } from './ApiKeyGate';

interface Props {
  onAnalyze: (riotId: string, tag: string, region: Region) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  errorMessage?: string | null;
}

const FEATURES = [
  {
    icon: Eye,
    title: 'Reads your match history',
    body: 'Pulls 20 ranked games and dissects every stat that matters.',
  },
  {
    icon: Brain,
    title: 'Spots your patterns',
    body: 'Surfaces the highest-impact issues — not generic tips.',
  },
  {
    icon: MessageCircle,
    title: 'Talks like a coach',
    body: 'Conversational feedback with concrete, drillable next steps.',
  },
];

export function Hero({
  onAnalyze,
  settings,
  onOpenSettings,
  errorMessage,
}: Props) {
  const live = hasLiveKeys(settings);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex w-full max-w-3xl flex-col items-center gap-6 text-center"
      >
        <div className="relative">
          <MascotLogo size={140} />
          <div className="absolute -bottom-2 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-gold-500/30 blur-xl" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-jungle-400">
            <span className="h-px w-8 bg-jungle-500/60" />
            {live ? 'Live · Riot API + Gemini' : 'League of Legends Coach'}
            <span className="h-px w-8 bg-jungle-500/60" />
          </div>
          <h1 className="gold-text font-display text-6xl font-black leading-none sm:text-7xl md:text-8xl">
            JunglePet AI
          </h1>
          <p className="mx-auto max-w-xl text-balance text-lg text-jungle-200 sm:text-xl">
            Your AI jungle companion for climbing the rift. Drop your Riot ID —
            get a real coaching read in seconds.
          </p>
        </div>

        <ApiKeyGate settings={settings} onOpenSettings={onOpenSettings} />

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass flex w-full max-w-xl items-center gap-2 rounded-xl border-l-[3px] border-l-ember-500 px-4 py-2.5"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-ember-400" />
              <div className="text-left text-sm text-jungle-100">
                {errorMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SearchPanel
          onAnalyze={onAnalyze}
          defaultRegion={settings.defaultRegion}
        />

        <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="glass group rounded-xl p-5 text-left transition hover:border-gold-500/40"
            >
              <feature.icon className="mb-3 h-6 w-6 text-gold-400 transition-transform group-hover:scale-110" />
              <div className="mb-1 font-semibold text-jungle-50">
                {feature.title}
              </div>
              <div className="text-sm text-jungle-300">{feature.body}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-2 max-w-md text-balance text-xs text-jungle-500">
          {live
            ? 'Live mode active. Search any real Riot ID.'
            : 'Demo mode uses curated sample data. Add API keys in settings for live analysis.'}
        </div>
      </motion.div>
    </div>
  );
}
