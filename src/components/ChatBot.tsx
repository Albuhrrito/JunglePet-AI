import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { AnalysisResult, FollowUp, Issue } from '@/lib/types';
import { DEEP_DIVES, type DeepDive } from '@/lib/responses';
import type { AiCoach } from '@/lib/aiCoach';
import { MascotLogo } from './MascotLogo';
import { IssueCard } from './IssueCard';
import { DeepDiveCard } from './DeepDiveCard';

interface Props {
  result: AnalysisResult;
  coach?: AiCoach | null;
}

interface ChatItem {
  id: string;
  kind: 'user-text' | 'ai-text' | 'dive';
  payload: string | DeepDive;
}

const QUICK_REPLIES: FollowUp[] = [
  { label: 'How do I climb?', key: 'general_climb' },
  { label: 'Champion advice', key: 'champ_recommendation' },
  { label: 'Mental reset tips', key: 'mental_reset' },
];

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gold-400"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-end gap-3"
    >
      <div className="glass mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <MascotLogo size={28} animate={false} />
      </div>
      <div className="glass max-w-[88%] whitespace-pre-line rounded-2xl rounded-bl-sm px-4 py-3">
        <p className="text-balance text-sm leading-relaxed text-jungle-100">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-end gap-3"
    >
      <div className="glass mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-gold-500/40">
        <MascotLogo size={28} animate={false} />
      </div>
      <div className="glass max-w-[88%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-gold-500/30 px-4 py-3">
        <p className="text-sm leading-relaxed text-jungle-100">
          {text}
          <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-gold-400 align-middle" />
        </p>
      </div>
    </motion.div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gold-gradient px-4 py-2.5 text-jungle-950 shadow-lg shadow-gold-500/20">
        <p className="text-sm font-semibold">{text}</p>
      </div>
    </motion.div>
  );
}

export function ChatBot({ result, coach }: Props) {
  const allItems = useMemo(
    () => [...result.issues, ...result.praise],
    [result],
  );
  const [revealed, setRevealed] = useState(0);
  const [showTyping, setShowTyping] = useState(true);
  const [followUps, setFollowUps] = useState<ChatItem[]>([]);
  const [pendingDive, setPendingDive] = useState<DeepDive | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sequential reveal of issue cards
  useEffect(() => {
    if (revealed >= allItems.length) {
      setShowTyping(false);
      return;
    }
    setShowTyping(true);
    const t = setTimeout(
      () => {
        setRevealed((r) => r + 1);
        setShowTyping(false);
      },
      revealed === 0 ? 1100 : 650,
    );
    return () => clearTimeout(t);
  }, [revealed, allItems.length]);

  // Show pending deep dive after a typing delay (static fallback path)
  useEffect(() => {
    if (!pendingDive) return;
    const t = setTimeout(() => {
      setFollowUps((prev) => [
        ...prev,
        { id: `dive-${Date.now()}`, kind: 'dive', payload: pendingDive },
      ]);
      setPendingDive(null);
    }, 850);
    return () => clearTimeout(t);
  }, [pendingDive]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [revealed, followUps.length, showTyping, pendingDive, streamingText]);

  const busy = !!pendingDive || isStreaming;

  const handleFollowUp = async (fu: FollowUp) => {
    if (busy) return;
    setFollowUps((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, kind: 'user-text', payload: fu.label },
    ]);

    if (!coach) {
      const dive = DEEP_DIVES[fu.key];
      if (dive) setPendingDive(dive);
      return;
    }

    setIsStreaming(true);
    setStreamingText('');
    let accumulated = '';
    try {
      for await (const chunk of coach.followUp(fu.label, {
        player: result.player,
        stats: result.stats,
        previousIssues: result.issues,
      })) {
        accumulated += chunk;
        setStreamingText(accumulated);
      }
      const finalText = accumulated.trim();
      if (finalText) {
        setFollowUps((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, kind: 'ai-text', payload: finalText },
        ]);
      } else {
        const dive = DEEP_DIVES[fu.key];
        if (dive) setPendingDive(dive);
      }
    } catch (err) {
      console.warn('AI follow-up failed, falling back', err);
      const dive = DEEP_DIVES[fu.key];
      if (dive) setPendingDive(dive);
      else {
        setFollowUps((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            kind: 'ai-text',
            payload:
              'AI is offline at the moment — try again in a few seconds, or check your Gemini key in settings.',
          },
        ]);
      }
    } finally {
      setStreamingText('');
      setIsStreaming(false);
    }
  };

  const handleIssueFollowUp = (fu: FollowUp) => {
    void handleFollowUp(fu);
  };

  const allRevealed = revealed >= allItems.length && !showTyping;
  const visibleIssues = allItems.slice(0, revealed);
  const liveLabel = coach ? 'Live · Gemini' : 'Demo';

  return (
    <div className="glass-strong flex flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 border-b border-jungle-700/50 bg-jungle-900/40 px-5 py-3.5">
        <div className="relative">
          <MascotLogo size={32} animate={false} />
          <span className="absolute -bottom-0 -right-0 h-2.5 w-2.5 animate-pulse rounded-full bg-jungle-300 ring-2 ring-jungle-900" />
        </div>
        <div className="flex-1">
          <div className="font-display text-sm font-bold text-jungle-50">
            JunglePet
          </div>
          <div className="font-mono text-[11px] text-jungle-400">
            {coach
              ? 'online · streaming responses'
              : 'online · analyzing your gameplay'}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gold-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-semibold">{liveLabel}</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-jungle max-h-[70vh] flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        <BotBubble text={result.headline} />

        {visibleIssues.map((issue: Issue, i) => (
          <IssueCard
            key={issue.id + i}
            issue={issue}
            index={i}
            onFollowUp={handleIssueFollowUp}
          />
        ))}

        <AnimatePresence>
          {showTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>

        {allRevealed && followUps.length === 0 && (
          <BotBubble text="That's the read. Want to dig into anything?" />
        )}

        {followUps.map((item) => {
          if (item.kind === 'user-text') {
            return <UserBubble key={item.id} text={item.payload as string} />;
          }
          if (item.kind === 'ai-text') {
            return <BotBubble key={item.id} text={item.payload as string} />;
          }
          if (item.kind === 'dive') {
            return (
              <DeepDiveCard key={item.id} dive={item.payload as DeepDive} />
            );
          }
          return null;
        })}

        {pendingDive && <TypingIndicator />}

        {isStreaming && streamingText && (
          <StreamingBubble text={streamingText} />
        )}
        {isStreaming && !streamingText && <TypingIndicator />}
      </div>

      {allRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 border-t border-jungle-700/50 bg-jungle-950/40 px-4 py-3"
        >
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr.key}
              onClick={() => void handleFollowUp(qr)}
              disabled={busy}
              className="rounded-full border border-jungle-700/60 bg-jungle-800/60 px-3 py-2 text-xs text-jungle-200 transition hover:border-gold-500/40 hover:bg-jungle-700/80 hover:text-gold-300 disabled:opacity-50"
            >
              {qr.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
