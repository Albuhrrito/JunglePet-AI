export interface DeepDive {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

/**
 * Pre-authored deep-dive responses for chatbot follow-ups.
 * Keyed by IssueId | 'general_climb' | 'champ_recommendation' | 'mental_reset'.
 */
export const DEEP_DIVES: Record<string, DeepDive> = {
  low_cs: {
    title: 'How to fix your farming',
    paragraphs: [
      "CS is the cheapest, most controllable skill in League. Pros separate themselves from amateurs not through mechanics but through farm consistency. The hardest part of last-hitting isn't reaction time — it's restraint.",
      "Most players over-push because attacking minions feels productive. It's not. Pushing without a plan throws away your wave control and lets the enemy roam free.",
    ],
    bullets: [
      'Practice Tool: 100 CS by 10:00, no items, no runes — repeat daily until consistent.',
      'Watch your minion pathing for 30 seconds before deciding to push, freeze, or slow-push.',
      'Auto-attack jungle camps closest to spawn before recalling. Never waste a respawn.',
      'On wave 8 (~4 minutes in), you should have 50+ CS. Track this every game.',
    ],
  },

  low_vision: {
    title: 'Vision wins games',
    paragraphs: [
      "Vision is information, and information is decisions. The best players in the world don't outmechanic everyone — they outdecide everyone. That comes from knowing where the enemy is.",
      "Vision score isn't a support stat. Top laners and junglers who carry consistently average 20+ vision per game. It's a climbing multiplier.",
    ],
    bullets: [
      'Buy a control ward every back. Non-negotiable. ~75g for ~3 minutes of certainty.',
      'Sweep with oracle lens before every objective (drake, herald, baron). Always.',
      'Place wards 30 seconds before objective spawns, not after fights start.',
      "Use yellow trinket on cooldown. If it's up, you're losing free vision.",
    ],
  },

  low_winrate: {
    title: 'Why your win rate is stuck',
    paragraphs: [
      "Win rate is a lagging indicator — don't chase the percentage, chase the inputs. Your win rate is a symptom of one of three things:",
      "(1) Playing too many champions — mastery deficit. (2) Playing a champion that doesn't fit your playstyle. (3) Queueing on tilt after losses.",
      'Identify which one is yours, fix that, and the percentage moves on its own.',
    ],
    bullets: [
      'Cap daily games at 5. Marathon sessions destroy win rate, not improve it.',
      'After a loss, watch the minimap of your replay for 60 seconds. Where did you lose vision?',
      'Track wins by champion. If one is below 40% over 4+ games, bench it for two weeks.',
    ],
  },

  high_deaths: {
    title: 'Why you keep dying',
    paragraphs: [
      "You're not dying because you're bad — you're dying because you're playing without information. The minimap is your radar. Pros check it every 2-3 seconds. Amateurs check it once every 30 seconds, then wonder where the jungler came from.",
      'The fix is mechanical, not strategic: train the habit of glancing at the minimap between every CS, every spell cast, every time you reposition.',
    ],
    bullets: [
      'Set a metronome in your head: every 3 seconds, eyes flick to minimap.',
      'Hard rule: never extend past river without seeing all 5 enemies on map within last 10 seconds.',
      'After dying, ask: "what was the last time I saw the killer?" If >15 seconds, you got out-vision\'d.',
      'Buy Stopwatch on assassins/squishies. The 2.5s of stasis saves entire games.',
    ],
  },

  losing_streak: {
    title: 'Breaking the spiral',
    paragraphs: [
      "Loss streaks are 80% mental, 20% skill. Your reflexes don't degrade in 2 games — your decision-making does. Frustration narrows perception. You start auto-piloting. You start playing for revenge instead of the win condition.",
      "The single best climbing habit: hard-stop after 2 losses in a row. Walk away for 30 minutes. Most of your worst games happen in the third loss after you should've stopped.",
    ],
    bullets: [
      'Two losses → log out. No exceptions. Set a phone timer.',
      'During the break: walk, drink water, no screens.',
      'When you return, queue your safest champion only. No experimenting.',
      "If you're still tilted after the break, you're done for the day.",
    ],
  },

  champ_pool_too_wide: {
    title: 'Narrowing your champion pool',
    paragraphs: [
      'Tier list pickers cap out at Platinum. Mastery players climb past Diamond. The math is simple: 50 games on one champ teaches you more than 50 games spread across 10 champs.',
      "Pick your top 2 champions by playstyle fit, not by who's strong this patch. The patch will rotate. Your fundamentals won't.",
    ],
    bullets: [
      'Pick 2 champions for the next 30 games. Same role.',
      'Main = your most-played pick. Backup = covers your worst matchup.',
      'Resist hot-streamer picks. Watching is not the same as playing.',
      'Hit Mastery 7 on your main before considering a third pick.',
    ],
  },

  champ_pool_struggling: {
    title: 'Cutting your losing champion',
    paragraphs: [
      "A high-volume champion with a sub-40% win rate is the single biggest LP leak in your account. Every game you queue it, you're statistically donating LP.",
      "There's no shame in dropping a champion. Pros bench picks every patch when the data says so. Be a pro about it.",
    ],
    bullets: [
      'Bench the struggling champ for 10 games. Period.',
      'Watch one Master+ ranked VOD on this champion before queueing it again.',
      "If after 10 games on other picks you're winning more, you have your answer.",
    ],
  },

  general_climb: {
    title: 'How to actually climb',
    paragraphs: [
      "Climbing isn't about winning more — it's about losing less. Specifically: lose less LP per loss by minimizing tilt damage and avoidable losses.",
      'The math: 5 wins + 0 losses = +100 LP. 5 wins + 5 losses (because you tilted between losses) = ~+25 LP. Same skill, very different climb. The difference is discipline, not talent.',
    ],
    bullets: [
      'Cap sessions at 5 games per day. Stop on a win.',
      'Master 2 champions before considering a third.',
      'Buy a control ward every single back. Non-negotiable.',
      'Watch ONE replay of your last loss per session. Find one decision that changed the game.',
      'Fix one thing per week. Not five. One.',
    ],
  },

  champ_recommendation: {
    title: 'Picking the right champion',
    paragraphs: [
      "The best champion for you isn't the highest win rate on the tier list — it's the one that fits how you naturally play.",
      'If you like teamfighting and engaging: tanks and engage supports. If you like outplaying: assassins and skirmishers. If you like farming safely: scaling carries. Pick what feels good to play, not what feels good to watch.',
    ],
    bullets: [
      'Lean into your highest-WR pick from your recent history. The data has spoken.',
      'For your backup: pick something that covers your worst matchup. Counter-pick threat = mental edge.',
      'Avoid picks that require 100+ games to scale (Azir, Aphelios, Riven) until you have time to commit.',
      'Champion mastery 7 on a main, then expand. Not before.',
    ],
  },

  mental_reset: {
    title: 'Resetting between games',
    paragraphs: [
      "Your job between games is recovery. The pros do this. They don't queue back instantly because every game starts with the residue of the last one.",
      'After a hard loss: stand up. Drink water. Look at something 20 feet away for 20 seconds (eye fatigue is real). Five minutes minimum before you queue again. After two losses: 30 minutes minimum.',
    ],
    bullets: [
      'Two losses → mandatory 30-minute break. Set an alarm.',
      'Between every game: 60 seconds away from screen, deep breath, shoulder roll.',
      'Hydrate. Tilt is partly low blood sugar and dehydration. Not a meme.',
      "If you can't name the win condition of your last game, you're still tilted.",
    ],
  },
};
