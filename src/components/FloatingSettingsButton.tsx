import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import type { AppSettings } from '@/lib/secureStore';
import { hasLiveKeys } from '@/lib/secureStore';

interface Props {
  settings: AppSettings;
  onClick: () => void;
}

export function FloatingSettingsButton({ settings, onClick }: Props) {
  const live = hasLiveKeys(settings);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      onClick={onClick}
      className="glass-strong group fixed right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full text-jungle-300 transition hover:text-gold-300"
      aria-label="Open settings"
    >
      <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
      <span
        className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-jungle-950 ${
          live
            ? 'bg-jungle-300'
            : settings.demoMode
              ? 'bg-gold-400'
              : 'bg-ember-500'
        }`}
        title={
          live ? 'Live mode' : settings.demoMode ? 'Demo mode' : 'Unconfigured'
        }
      />
    </motion.button>
  );
}
