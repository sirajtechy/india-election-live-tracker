import { partyColor } from '@/lib/party-colors';
import { partyFullName } from '@/lib/party-names';

export function SeatBar({ partyId, seats, maxSeats }: { partyId: string; seats: number; maxSeats: number }) {
  const color = partyColor(partyId);
  const pct = maxSeats > 0 ? (seats / maxSeats) * 100 : 0;
  return (
    <div className="seat-bar-row">
      <div className="party-label">
        <span className="party-dot" style={{ background: color }} />
        <span className="party-label-text">
          <span className="party-full">{partyFullName(partyId)}</span>
          <span className="party-code">({partyId})</span>
        </span>
      </div>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="seat-count">{seats}</div>
    </div>
  );
}
