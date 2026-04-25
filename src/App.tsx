import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult, Region } from '@/lib/types';
import { getMockPlayer } from '@/lib/mockData';
import { aggregate, analyzeFallback } from '@/lib/analyzer';
import { fetchLivePlayer } from '@/lib/livePlayer';
import { TransportError } from '@/lib/transport';
import { RiotApiError } from '@/lib/riotApi';
import { GeminiCoach, type AiCoach } from '@/lib/aiCoach';
import {
  hasLiveKeys,
  loadSettings,
  saveSettings,
  type AppSettings,
} from '@/lib/secureStore';

import { BackgroundFX } from '@/components/BackgroundFX';
import { Hero } from '@/components/Hero';
import { LoadingState } from '@/components/LoadingState';
import { PlayerHeader } from '@/components/PlayerHeader';
import { ChatBot } from '@/components/ChatBot';
import { StatsDashboard } from '@/components/StatsDashboard';
import { MatchHistoryGrid } from '@/components/MatchHistoryGrid';
import { SettingsPanel } from '@/components/SettingsPanel';
import { FloatingSettingsButton } from '@/components/FloatingSettingsButton';

type Stage = 'landing' | 'loading' | 'analyzed';

export default function App() {
  const [stage, setStage] = useState<Stage>('landing');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const coach: AiCoach | null = useMemo(() => {
    if (!hasLiveKeys(settings)) return null;
    return new GeminiCoach({
      apiKey: settings.geminiApiKey,
      workerUrl: settings.workerUrl,
    });
  }, [settings]);

  const handleAnalyze = useCallback(
    async (riotId: string, tag: string, region: Region) => {
      setErrorMessage(null);
      setStage('loading');

      const useLive = hasLiveKeys(settings);

      try {
        const player = useLive
          ? await fetchLivePlayer(riotId, tag, region, {
              workerUrl: settings.workerUrl,
              apiKey: settings.riotApiKey,
            })
          : await new Promise<ReturnType<typeof getMockPlayer>>((resolve) =>
              window.setTimeout(
                () => resolve(getMockPlayer(riotId, tag, region)),
                2200,
              ),
            );

        let analysis: AnalysisResult;
        if (coach) {
          try {
            analysis = await coach.analyze(player, aggregate(player));
          } catch (aiErr) {
            console.warn('AI analyze failed, using rule-based fallback', aiErr);
            analysis = analyzeFallback(player);
          }
        } else {
          analysis = analyzeFallback(player);
        }

        setResult(analysis);
        setStage('analyzed');
      } catch (err) {
        const msg =
          err instanceof RiotApiError
            ? err.detail
            : err instanceof TransportError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Something went wrong. Try again.';
        setErrorMessage(msg);
        setStage('landing');
      }
    },
    [settings, coach],
  );

  const handleReset = useCallback(() => {
    setStage('landing');
    setErrorMessage(null);
    setTimeout(() => setResult(null), 500);
  }, []);

  return (
    <div className="min-h-screen text-jungle-50 antialiased">
      <BackgroundFX />

      <FloatingSettingsButton
        settings={settings}
        onClick={() => setSettingsOpen(true)}
      />

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />

      <AnimatePresence mode="wait">
        {stage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Hero
              onAnalyze={handleAnalyze}
              settings={settings}
              onOpenSettings={() => setSettingsOpen(true)}
              errorMessage={errorMessage}
            />
          </motion.div>
        )}

        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingState />
          </motion.div>
        )}

        {stage === 'analyzed' && result && (
          <motion.div
            key="analyzed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-7xl space-y-6 px-4 py-6"
          >
            <PlayerHeader result={result} onReset={handleReset} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="order-1 lg:col-span-3">
                <ChatBot result={result} coach={coach} />
              </div>

              <div className="order-2 space-y-6 lg:col-span-2">
                <StatsDashboard stats={result.stats} />
                <MatchHistoryGrid matches={result.player.matches} />
              </div>
            </div>

            <footer className="py-4 text-center text-xs text-jungle-600">
              JunglePet AI · {settings.demoMode ? 'Demo mode' : 'Live mode'} ·
              Not affiliated with Riot Games · Built with{' '}
              <span className="text-jungle-500">{'<'}</span>
              <span className="text-gold-500">paws</span>
              <span className="text-jungle-500">{'/>'}</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
