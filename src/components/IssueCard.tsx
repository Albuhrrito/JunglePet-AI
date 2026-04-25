import { motion } from 'framer-motion';
import type { Issue, FollowUp } from '@/lib/types';
import { DynamicIcon } from './Icon';
import { cn } from '@/lib/cn';

const SEVERITY_CHIP: Record<
  Issue['severity'],
  { label: string; classes: string }
> = {
  critical: {
    label: 'Critical',
    classes: 'bg-ember-500/15 text-ember-400 border-ember-500/40',
  },
  major: {
    label: 'Major',
    classes: 'bg-gold-500/15 text-gold-300 border-gold-500/40',
  },
  minor: {
    label: 'Minor',
    classes: 'bg-arcane-500/15 text-arcane-300 border-arcane-500/40',
  },
  praise: {
    label: 'Strength',
    classes: 'bg-jungle-500/20 text-jungle-300 border-jungle-400/40',
  },
};

const SEVERITY_BORDER: Record<Issue['severity'], string> = {
  critical:
    'before:bg-gradient-to-b before:from-ember-500/80 before:to-ember-600/30',
  major:
    'before:bg-gradient-to-b before:from-gold-400/90 before:to-gold-600/30',
  minor:
    'before:bg-gradient-to-b before:from-arcane-400/80 before:to-arcane-600/30',
  praise:
    'before:bg-gradient-to-b before:from-jungle-300/80 before:to-jungle-500/30',
};

interface Props {
  issue: Issue;
  index: number;
  onFollowUp: (followUp: FollowUp) => void;
}

export function IssueCard({ issue, index, onFollowUp }: Props) {
  const chip = SEVERITY_CHIP[issue.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn(
        'glass relative overflow-hidden rounded-xl py-4 pl-5 pr-5',
        'before:absolute before:bottom-3 before:left-0 before:top-3 before:w-1 before:rounded-r-full before:content-[""]',
        SEVERITY_BORDER[issue.severity],
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
            chip.classes,
          )}
        >
          <DynamicIcon name={issue.icon} size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-jungle-500">
              #{index + 1}
            </span>
            <span
              className={cn(
                'rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                chip.classes,
              )}
            >
              {chip.label}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold leading-tight text-jungle-50">
            {issue.title}
          </h3>
          <p className="mt-1.5 text-balance text-sm text-jungle-200">
            {issue.diagnosis}
          </p>
          <div className="mt-2 inline-block rounded border border-jungle-800/50 bg-jungle-950/40 px-2 py-1 font-mono text-xs text-gold-400/90">
            {issue.evidence}
          </div>
          <ul className="mt-3 space-y-1.5">
            {issue.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-jungle-100"
              >
                <span className="mt-0.5 text-gold-500">▸</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          {issue.followUps.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {issue.followUps.map((fu) => (
                <button
                  key={fu.key}
                  onClick={() => onFollowUp(fu)}
                  className="rounded-full border border-jungle-700/60 bg-jungle-800/60 px-3 py-1.5 text-xs text-jungle-200 transition hover:border-gold-500/40 hover:bg-jungle-700/80 hover:text-gold-300"
                >
                  {fu.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
