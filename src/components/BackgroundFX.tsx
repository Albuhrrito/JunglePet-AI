export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-jungle-950">
      {/* Base layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-jungle-950 via-jungle-900 to-jungle-950" />

      {/* Aurora orbs */}
      <div className="absolute -left-40 -top-40 h-[640px] w-[640px] animate-pulse-slow rounded-full bg-jungle-500/15 blur-[140px]" />
      <div
        className="bg-arcane-500/12 absolute -right-32 top-1/3 h-[520px] w-[520px] animate-pulse-slow rounded-full blur-[140px]"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="bg-gold-500/8 absolute bottom-0 left-1/3 h-[420px] w-[420px] animate-pulse-slow rounded-full blur-[140px]"
        style={{ animationDelay: '4s' }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-jungle-950/90 via-transparent to-jungle-950/40" />
    </div>
  );
}
