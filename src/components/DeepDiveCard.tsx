import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { DeepDive } from '@/lib/responses';

interface Props {
  dive: DeepDive;
}

export function DeepDiveCard({ dive }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-xl border-l-[3px] border-l-arcane-400/70 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-arcane-300" />
        <h4 className="text-arcane-200 font-display text-base font-bold uppercase tracking-wider">
          {dive.title}
        </h4>
      </div>
      <div className="space-y-2.5">
        {dive.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-balance text-sm leading-relaxed text-jungle-100"
          >
            {p}
          </p>
        ))}
      </div>
      {dive.bullets && dive.bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {dive.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-jungle-100"
            >
              <span className="mt-0.5 text-arcane-400">◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
