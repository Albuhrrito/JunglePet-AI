import { motion } from 'framer-motion';

interface Props {
  score: number;
  size?: number;
}

export function ScoreCircle({ score, size = 72 }: Props) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#7eb494' : score >= 50 ? '#f0c465' : '#e85f3a';
  const label =
    score >= 80
      ? 'Cooking'
      : score >= 65
        ? 'Steady'
        : score >= 45
          ? 'Mixed'
          : score >= 30
            ? 'Tough'
            : 'Rough';

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-black" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-jungle-400">
          Climb Score
        </div>
        <div className="font-display text-base font-bold" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
}
