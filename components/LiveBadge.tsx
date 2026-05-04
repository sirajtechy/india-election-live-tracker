'use client';

export function LiveBadge({
  isLive,
  onToggle,
}: {
  isLive: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`live-badge ${isLive ? 'live' : 'paused'}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle();
      }}
    >
      <span className="live-dot" />
      {isLive ? 'LIVE' : 'PAUSED'}
    </div>
  );
}
