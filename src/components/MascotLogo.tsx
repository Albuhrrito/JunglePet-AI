import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Props {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function MascotLogo({ size = 80, animate = true, className }: Props) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn('drop-shadow-[0_0_24px_rgba(240,196,101,0.35)]', className)}
      animate={animate ? { y: [0, -8, 0], rotate: [-1, 1, -1] } : undefined}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <defs>
        <radialGradient id="petHead" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#5b8e7d" />
          <stop offset="0.6" stopColor="#2d5044" />
          <stop offset="1" stopColor="#122421" />
        </radialGradient>
        <linearGradient id="petLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7eb494" />
          <stop offset="1" stopColor="#3e6b5b" />
        </linearGradient>
        <radialGradient id="petEye" cx="35%" cy="35%" r="65%">
          <stop offset="0" stopColor="#f5dfa3" />
          <stop offset="0.55" stopColor="#f0c465" />
          <stop offset="1" stopColor="#7a5a1f" />
        </radialGradient>
        <radialGradient id="petCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ff8a5b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff8a5b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer ears (leaves) */}
      <path d="M48 72 L40 24 L82 56 Z" fill="url(#petLeaf)" />
      <path d="M152 72 L160 24 L118 56 Z" fill="url(#petLeaf)" />
      {/* Leaf veins */}
      <path
        d="M48 72 L52 38"
        stroke="#0a1614"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M152 72 L148 38"
        stroke="#0a1614"
        strokeWidth="1.5"
        opacity="0.4"
      />

      {/* Inner ears */}
      <path d="M58 64 L52 36 L74 56 Z" fill="#0a1614" opacity="0.35" />
      <path d="M142 64 L148 36 L126 56 Z" fill="#0a1614" opacity="0.35" />

      {/* Head */}
      <circle cx="100" cy="108" r="58" fill="url(#petHead)" />

      {/* Head highlight */}
      <ellipse cx="80" cy="86" rx="22" ry="14" fill="white" opacity="0.1" />

      {/* Cheeks */}
      <ellipse cx="62" cy="124" rx="9" ry="6" fill="url(#petCheek)" />
      <ellipse cx="138" cy="124" rx="9" ry="6" fill="url(#petCheek)" />

      {/* Eyes */}
      <g>
        <circle cx="80" cy="104" r="12" fill="url(#petEye)" />
        <circle cx="120" cy="104" r="12" fill="url(#petEye)" />
        <ellipse cx="80" cy="104" rx="3.2" ry="7.5" fill="#0a1614" />
        <ellipse cx="120" cy="104" rx="3.2" ry="7.5" fill="#0a1614" />
        <circle cx="78" cy="100.5" r="2.8" fill="white" />
        <circle cx="118" cy="100.5" r="2.8" fill="white" />
        <circle cx="83" cy="106" r="1.2" fill="white" opacity="0.7" />
        <circle cx="123" cy="106" r="1.2" fill="white" opacity="0.7" />
      </g>

      {/* Nose */}
      <path d="M100 122 L94 130 L106 130 Z" fill="#0a1614" />

      {/* Mouth */}
      <path
        d="M86 138 Q100 148 114 138"
        stroke="#0a1614"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Tiny fang */}
      <path d="M96 142 L98 146 L100 142 Z" fill="white" opacity="0.85" />
    </motion.svg>
  );
}
