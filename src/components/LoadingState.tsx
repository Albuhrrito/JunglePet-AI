import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotLogo } from './MascotLogo';

const STEPS = [
  'Fetching match history…',
  'Crunching the numbers…',
  'Sniffing out your patterns…',
  'Drafting your game plan…',
];

export function LoadingState() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 -m-8 rounded-full border-2 border-dashed border-gold-500/30"
        />
        <MascotLogo size={120} />
      </div>

      <div className="min-h-[60px] space-y-2 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="font-display text-2xl text-gold-400"
          >
            {STEPS[stepIdx]}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= stepIdx ? 'w-8 bg-gold-400' : 'w-4 bg-jungle-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
