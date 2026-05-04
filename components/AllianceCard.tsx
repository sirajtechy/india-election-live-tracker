import { allianceDisplayColor } from '@/lib/party-colors';
import type { StateCode } from '@/lib/states';
import { allianceFullName } from '@/lib/alliance-names';
import { partyLabelLine } from '@/lib/party-names';

export function AllianceCard({
  stateCode,
  allianceId,
  seats,
  totalSeats,
  majority,
  parties,
}: {
  stateCode: StateCode;
  allianceId: string;
  seats: number;
  totalSeats: number;
  majority: number;
  parties: string[];
}) {
  const pct = ((seats / totalSeats) * 100).toFixed(1);
  const hasMajority = seats >= majority;
  const color = allianceDisplayColor(allianceId);
  const title = allianceFullName(stateCode, allianceId);

  return (
    <div className={`alliance-card ${hasMajority ? 'majority' : ''}`}>
      {hasMajority && <div className="majority-badge">MAJORITY</div>}
      <div className="alliance-name" style={{ color }} title={title}>
        {title}
      </div>
      <div className="alliance-code muted">{allianceId.replace(/_/g, ' · ')}</div>
      <div className="alliance-seats">{seats}</div>
      <div className="alliance-seats-label">
        seats ({pct}%) · need {majority}
      </div>
      <div className="alliance-progress">
        <div className="progress-bar" style={{ width: `${Math.min((seats / totalSeats) * 100, 100)}%`, background: color }} />
      </div>
      <div className="alliance-parties">
        {parties.slice(0, 6).map((p, i) => (
          <span key={p}>
            {i > 0 ? <span className="alliance-sep"> · </span> : null}
            <span className="alliance-party-chip" title={partyLabelLine(p)}>
              {partyLabelLine(p)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
