import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { type AppSettings, describeKeyStatus } from '@/lib/secureStore';
import type { Region } from '@/lib/types';
import { cn } from '@/lib/cn';

const REGION_LABELS: Record<Region, string> = {
  americas: 'Americas (NA, BR, LAN, LAS)',
  europe: 'Europe (EUW, EUNE, TR, RU)',
  asia: 'Asia (KR, JP)',
  sea: 'SEA (OCE, PH, SG, TH, TW, VN)',
};

interface Props {
  open: boolean;
  settings: AppSettings;
  onSave: (next: AppSettings) => void;
  onClose: () => void;
}

interface FieldProps {
  label: string;
  hint: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  obscure?: boolean;
}

function SecretField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  obscure = true,
}: FieldProps) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-jungle-400">
        {label}
      </label>
      <div className="glass flex items-center gap-2 rounded-lg px-3 py-2 transition focus-within:border-gold-500/60">
        <input
          type={obscure && !revealed ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent font-mono text-sm text-jungle-50 outline-none placeholder:text-jungle-600"
        />
        {obscure && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-jungle-500 transition hover:text-jungle-200"
            aria-label={revealed ? 'Hide value' : 'Show value'}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <div className="text-xs leading-snug text-jungle-500">{hint}</div>
    </div>
  );
}

type TestState = 'idle' | 'testing' | 'ok' | 'error';

interface TestResult {
  riot: TestState;
  gemini: TestState;
}

async function pingGemini(apiKey: string): Promise<TestState> {
  if (!apiKey.trim()) return 'idle';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    );
    return res.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

async function pingRiot(apiKey: string, workerUrl: string): Promise<TestState> {
  if (!apiKey.trim() || !workerUrl.trim()) return 'idle';
  // Use a known account (Faker#KR1) so a 200 OR 404 means the key + proxy
  // are wired correctly. 401/403 surface as 'error'.
  const target =
    'https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Hide%20on%20bush/KR1';
  try {
    const res = await fetch(workerUrl.replace(/\/+$/, '') + '/proxy', {
      headers: {
        'x-target-url': target,
        'x-riot-token': apiKey,
      },
    });
    return res.ok || res.status === 404 ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

export function SettingsPanel({ open, settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [test, setTest] = useState<TestResult>({
    riot: 'idle',
    gemini: 'idle',
  });

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setTest({ riot: 'idle', gemini: 'idle' });
    }
  }, [open, settings]);

  const status = describeKeyStatus(draft);

  const handleTest = async () => {
    setTest({ riot: 'testing', gemini: 'testing' });
    const [riot, gemini] = await Promise.all([
      pingRiot(draft.riotApiKey, draft.workerUrl),
      pingGemini(draft.geminiApiKey),
    ]);
    setTest({ riot, gemini });
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const TestBadge = ({ state }: { state: TestState }) => {
    if (state === 'idle') return null;
    if (state === 'testing')
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-jungle-400">
          <Loader2 className="h-3 w-3 animate-spin" /> testing
        </span>
      );
    if (state === 'ok')
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-jungle-300">
          <Check className="h-3 w-3" /> ok
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ember-400">
        <AlertTriangle className="h-3 w-3" /> failed
      </span>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-jungle-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-strong pointer-events-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl shadow-jungle-950/60">
              <div className="flex items-center justify-between border-b border-jungle-700/50 bg-jungle-900/50 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <h2 className="gold-text font-display text-base font-bold">
                    Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-jungle-400 transition hover:text-jungle-100"
                  aria-label="Close settings"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="scrollbar-jungle space-y-5 overflow-y-auto p-5">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-jungle-700/40 bg-jungle-900/40 p-3">
                  <div>
                    <div className="text-sm font-semibold text-jungle-50">
                      Demo mode
                    </div>
                    <div className="text-xs text-jungle-400">
                      {draft.demoMode
                        ? 'Using curated sample data (Albruh#VAL).'
                        : 'Using your real API keys.'}
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={draft.demoMode}
                    onClick={() =>
                      setDraft((d) => ({ ...d, demoMode: !d.demoMode }))
                    }
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition',
                      draft.demoMode ? 'bg-gold-500' : 'bg-jungle-700',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-jungle-50 transition-transform',
                        draft.demoMode ? 'translate-x-5' : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>

                <SecretField
                  label="Riot API Key"
                  value={draft.riotApiKey}
                  onChange={(v) => setDraft((d) => ({ ...d, riotApiKey: v }))}
                  placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  hint={
                    <span>
                      Dev keys expire every 24h.{' '}
                      <a
                        href="https://developer.riotgames.com"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-0.5 text-gold-400 hover:text-gold-300"
                      >
                        Get one
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </span>
                  }
                />

                <SecretField
                  label="Gemini API Key"
                  value={draft.geminiApiKey}
                  onChange={(v) => setDraft((d) => ({ ...d, geminiApiKey: v }))}
                  placeholder="AIzaSy..."
                  hint={
                    <span>
                      Free tier: 15 RPM, 1M tokens/day.{' '}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-0.5 text-gold-400 hover:text-gold-300"
                      >
                        Get one
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </span>
                  }
                />

                <SecretField
                  label="Cloudflare Worker URL"
                  obscure={false}
                  value={draft.workerUrl}
                  onChange={(v) => setDraft((d) => ({ ...d, workerUrl: v }))}
                  placeholder="https://junglepet-proxy.your-account.workers.dev"
                  hint={
                    <span>
                      Required for live mode (CORS pass-through). See{' '}
                      <code className="text-gold-400">worker/README.md</code>{' '}
                      for the 5-min wrangler deploy.
                    </span>
                  }
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-jungle-400">
                    Default Region
                  </label>
                  <select
                    value={draft.defaultRegion}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        defaultRegion: e.target.value as Region,
                      }))
                    }
                    className="glass w-full rounded-lg px-3 py-2 text-sm text-jungle-50 outline-none focus:border-gold-500/60"
                  >
                    {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
                      <option key={r} value={r} className="bg-jungle-900">
                        {REGION_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-jungle-700/40 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-jungle-400">
                      Connection Status
                    </h3>
                    <button
                      onClick={handleTest}
                      disabled={
                        test.riot === 'testing' ||
                        (!draft.riotApiKey && !draft.geminiApiKey)
                      }
                      className="rounded-md border border-jungle-700/50 bg-jungle-800/60 px-2.5 py-1 text-xs text-jungle-200 transition hover:bg-jungle-700/80 disabled:opacity-40 disabled:hover:bg-jungle-800/60"
                    >
                      Test
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="text-jungle-300">Riot API</span>
                      <span className="flex items-center gap-2">
                        {status.hasRiot ? (
                          <span className="text-jungle-400">key set</span>
                        ) : (
                          <span className="text-jungle-600">no key</span>
                        )}
                        <TestBadge state={test.riot} />
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-jungle-300">Gemini</span>
                      <span className="flex items-center gap-2">
                        {status.hasGemini ? (
                          <span className="text-jungle-400">key set</span>
                        ) : (
                          <span className="text-jungle-600">no key</span>
                        )}
                        <TestBadge state={test.gemini} />
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-jungle-300">Worker</span>
                      <span className="text-jungle-400">
                        {status.hasWorker ? 'configured' : 'not set'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-jungle-700/50 bg-jungle-900/40 px-5 py-3">
                <button
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-sm text-jungle-300 transition hover:bg-jungle-800/50 hover:text-jungle-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-gold-gradient px-4 py-2 text-sm font-bold text-jungle-950 transition hover:brightness-110 active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
