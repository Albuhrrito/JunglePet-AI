import type { Region } from './types';

export interface AppSettings {
  riotApiKey: string;
  geminiApiKey: string;
  /** Cloudflare Worker URL (CORS pass-through). Required for live mode. */
  workerUrl: string;
  defaultRegion: Region;
  /** When true, the app uses curated mock data even if keys are configured. */
  demoMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  riotApiKey: '',
  geminiApiKey: '',
  workerUrl: '',
  defaultRegion: 'americas',
  demoMode: true,
};

const STORAGE_KEY = 'junglepet:settings:v1';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<AppSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage can fail in private mode; settings stay in memory only.
  }
}

export function hasLiveKeys(settings: AppSettings): boolean {
  if (settings.demoMode) return false;
  if (!settings.riotApiKey.trim()) return false;
  if (!settings.geminiApiKey.trim()) return false;
  if (!settings.workerUrl.trim()) return false;
  return true;
}

export interface KeyStatus {
  hasRiot: boolean;
  hasGemini: boolean;
  hasWorker: boolean;
}

export function describeKeyStatus(settings: AppSettings): KeyStatus {
  return {
    hasRiot: !!settings.riotApiKey.trim(),
    hasGemini: !!settings.geminiApiKey.trim(),
    hasWorker: !!settings.workerUrl.trim(),
  };
}
