'use client';

import { useMemo, useState } from 'react';
import type { StateResult } from '@/lib/types';
import { partyColor } from '@/lib/party-colors';
import { partyLabelLine } from '@/lib/party-names';
import { normalizePartyId } from '@/lib/party-aliases';

function PartyCell({
  partyId,
  partyRaw,
  candidate,
}: {
  partyId?: string;
  partyRaw?: string;
  candidate?: string | null;
}) {
  const id = partyId ?? (partyRaw ? normalizePartyId(partyRaw) : '');
  if (!id && !partyRaw) {
    if (candidate) {
      return (
        <div className="cm-party-cell">
          <div className="cm-cand cm-cand-provisional" title="Name from feed; party may be added when available">
            {candidate}
          </div>
        </div>
      );
    }
    return <span className="cm-na">—</span>;
  }
  const line = id ? partyLabelLine(id) : (partyRaw ?? '—');
  return (
    <div className="cm-party-cell">
      {id || partyRaw ? (
        <div className="cm-party-line">
          <span className="party-dot" style={{ background: partyColor(id || normalizePartyId(partyRaw ?? 'OTH')) }} />
          <span className="cm-party-text">{line}</span>
        </div>
      ) : null}
      {candidate ? <div className="cm-cand">{candidate}</div> : null}
    </div>
  );
}

function statusLabel(s: string): string {
  if (s === 'declared') return 'Declared';
  if (s === 'leading') return 'Leading';
  if (s === 'counting') return 'Counting';
  return 'Awaiting';
}

function statusClass(s: string): string {
  if (s === 'declared') return 'cm-st-declared';
  if (s === 'leading') return 'cm-st-leading';
  if (s === 'counting') return 'cm-st-counting';
  return 'cm-st-awaiting';
}

export function ConstituencyMasterTable({ result }: { result: StateResult }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const rows = result.constituencyMaster ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => {
      const ac = String(r.acNo);
      const blob = [ac, r.consName, r.district, r.winnerPartyId, r.winnerPartyRaw, r.leadingPartyId, r.leadingPartyRaw, r.winnerCandidate, r.leadingCandidate]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(t);
    });
  }, [result.constituencyMaster, q]);

  const rows = result.constituencyMaster ?? [];
  if (rows.length === 0) {
    return (
      <section className="constituency-master">
        <h3 className="cm-heading">All constituencies</h3>
        <p className="cm-note">No constituency rows in this snapshot — refresh after the scraper has run on News18 data.</p>
      </section>
    );
  }

  return (
    <section className="constituency-master">
      <h3 className="cm-heading">All constituencies</h3>
      <p className="cm-note">
        One row per assembly segment from the News18 <code>analytic-data</code> 2026 block: <strong>declared</strong> when{' '}
        <code>winner</code> is set, <strong>leading</strong> when <code>leadingParty</code> is set (if the API publishes it), otherwise{' '}
        <strong>counting</strong> or <strong>awaiting</strong>. Party + candidate appear only when those fields are present in the
        feed — the API does not list every party’s candidate per seat in this endpoint.
      </p>
      <div className="cm-toolbar">
        <label className="cm-filter-label" htmlFor="cm-filter">
          Filter
        </label>
        <input
          id="cm-filter"
          className="cm-filter"
          type="search"
          placeholder="AC no, name, district, party, candidate…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        <span className="cm-count">
          {filtered.length} / {rows.length}
        </span>
      </div>
      <div className="cm-table-wrap">
        <table className="cm-table">
          <thead>
            <tr>
              <th>AC</th>
              <th>Constituency</th>
              <th>District</th>
              <th>Status</th>
              <th>Declared winner</th>
              <th>Current lead (if not final)</th>
              <th className="num">Vote %</th>
              <th className="num">Turnout %</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.consId ?? `${r.acNo}-${r.consName}`}>
                <td className="num">{r.acNo}</td>
                <td>{r.consName}</td>
                <td>{r.district ?? '—'}</td>
                <td>
                  <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                </td>
                <td>
                  <PartyCell partyId={r.winnerPartyId} partyRaw={r.winnerPartyRaw} candidate={r.winnerCandidate} />
                </td>
                <td>
                  {r.status === 'declared' ? (
                    <span className="cm-na">—</span>
                  ) : (
                    <PartyCell partyId={r.leadingPartyId} partyRaw={r.leadingPartyRaw} candidate={r.leadingCandidate} />
                  )}
                </td>
                <td className="num">{r.voteShare != null && r.voteShare > 0 ? r.voteShare.toFixed(2) : '—'}</td>
                <td className="num">{r.turnout != null ? r.turnout.toFixed(2) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
