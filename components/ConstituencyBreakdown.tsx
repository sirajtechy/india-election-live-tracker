'use client';

import type { StateResult } from '@/lib/types';
import { partyColor } from '@/lib/party-colors';
import { partyLabelLine } from '@/lib/party-names';

function SeatTable({
  title,
  rows,
  statusLabel,
  statusClass,
}: {
  title: string;
  rows: { consName: string; acNo: number; district?: string }[];
  statusLabel: string;
  statusClass: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="cb-subtable">
      <h5 className="cb-subtitle">
        {title}{' '}
        <span className={statusClass}>({rows.length})</span>
      </h5>
      <div className="cb-table-wrap">
        <table className="cb-table">
          <thead>
            <tr>
              <th>AC</th>
              <th>Constituency</th>
              <th>District</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.acNo}-${r.consName}-${i}`}>
                <td className="num">{r.acNo}</td>
                <td>{r.consName}</td>
                <td>{r.district ?? '—'}</td>
                <td>
                  <span className={statusClass}>{statusLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ConstituencyBreakdown({ result }: { result: StateResult }) {
  const byParty = result.constituenciesByParty ?? {};
  const counting = result.countingUndeclared ?? [];

  const partyIds = new Set<string>();
  result.parties.forEach((p) => partyIds.add(p.id));
  Object.keys(byParty).forEach((k) => partyIds.add(k));

  const ordered = [...partyIds].sort((a, b) => {
    const ta = result.parties.find((p) => p.id === a)?.total ?? 0;
    const tb = result.parties.find((p) => p.id === b)?.total ?? 0;
    return tb - ta;
  });

  const hasAny =
    counting.length > 0 ||
    ordered.some((pid) => {
      const x = byParty[pid];
      return x && (x.won.length > 0 || x.leading.length > 0);
    });

  return (
    <section className="constituency-breakdown">
      <h3 className="cb-heading">Constituency-wise break-up</h3>
      <p className="cb-note">
        Lists each assembly seat where News18 marks a <strong>declared winner</strong> (<span className="cb-won">Won</span>) or a{' '}
        <strong>leading party</strong> (<span className="cb-leading">Leading</span>) on the 2026 row. If the feed only shows counting
        without a party code, seats appear under <strong>Counting (party not in feed yet)</strong>.
      </p>

      {counting.length > 0 && (
        <div className="cb-counting-banner">
          <h4>Counting — party code not published yet ({counting.length})</h4>
          <div className="cb-table-wrap">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>AC</th>
                  <th>Constituency</th>
                  <th>District</th>
                </tr>
              </thead>
              <tbody>
                {counting.map((r, i) => (
                  <tr key={`${r.acNo}-${i}`}>
                    <td className="num">{r.acNo}</td>
                    <td>{r.consName}</td>
                    <td>{r.district ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hasAny && counting.length === 0 && (
        <p className="cb-empty">No constituency-level winner or lead data yet — refresh after counting progresses.</p>
      )}

      {ordered.map((partyId) => {
        const lists = byParty[partyId];
        if (!lists || (lists.won.length === 0 && lists.leading.length === 0)) return null;

        return (
          <details key={partyId} className="cb-details">
            <summary className="cb-summary">
              <span className="party-dot" style={{ background: partyColor(partyId) }} />
              <span className="cb-summary-text">{partyLabelLine(partyId)}</span>
              <span className="cb-summary-counts">
                {lists.won.length > 0 && <span className="cb-won">{lists.won.length} won</span>}
                {lists.won.length > 0 && lists.leading.length > 0 ? ' · ' : null}
                {lists.leading.length > 0 && <span className="cb-leading">{lists.leading.length} leading</span>}
              </span>
            </summary>

            <SeatTable title="Declared winner" rows={lists.won} statusLabel="Won" statusClass="cb-won" />
            <SeatTable title="Leading (not final)" rows={lists.leading} statusLabel="Leading" statusClass="cb-leading" />
          </details>
        );
      })}
    </section>
  );
}
