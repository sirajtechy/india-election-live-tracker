import Link from 'next/link';
import type { StateResult } from '@/lib/types';
import { partyColor } from '@/lib/party-colors';
import { partyLabelLine } from '@/lib/party-names';
import { allianceFullName } from '@/lib/alliance-names';

export function StateTile({ result }: { result: StateResult }) {
  const top = result.parties.slice(0, 3);
  const max = Math.max(...top.map((p) => p.total), 1);
  const leading = result.alliances[0];
  const trend =
    (result.leadingConstituencies ?? 0) > 0
      ? ` · ${result.leadingConstituencies} with lead`
      : '';

  return (
    <Link href={`/state/${result.code}`} className="state-tile-link">
      <div className="state-card">
        <h4>{result.name}</h4>
        <div className="state-total">
          {result.declared} / {result.totalSeats} declared{trend}
        </div>
        {leading && (
          <div className="leading-alliance" title={allianceFullName(result.code, leading.id)}>
            Top bloc: {allianceFullName(result.code, leading.id)} ({leading.seats})
          </div>
        )}
        <div className="state-bars">
          {top.map((p) => (
            <div key={p.id} className="state-bar-item state-bar-item-stacked">
              <span className="state-party-line" title={partyLabelLine(p.id)}>
                <span className="state-party-full" style={{ color: partyColor(p.id) }}>
                  {partyLabelLine(p.id)}
                </span>
              </span>
              <div className="mini-bar">
                <div style={{ width: `${(p.total / max) * 100}%`, background: partyColor(p.id) }} />
              </div>
              <span>{p.total}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
