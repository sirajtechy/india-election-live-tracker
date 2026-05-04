'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import type { Snapshot } from '@/lib/types';
import type { StateCode } from '@/lib/states';
import { LiveBadge } from './LiveBadge';
import { AllianceCard } from './AllianceCard';
import { SeatBar } from './SeatBar';
import { ResultsCharts } from './ResultsCharts';
import { partyColor } from '@/lib/party-colors';
import { partyFullName } from '@/lib/party-names';

async function fetcher(url: string): Promise<Snapshot> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function StatePageClient({ code }: { code: StateCode }) {
  const [isLive, setIsLive] = useState(true);
  const { data, error, isLoading } = useSWR<Snapshot>('/api/results', fetcher, {
    refreshInterval: isLive ? 20_000 : 0,
    dedupingInterval: 5000,
  });

  const result = data?.states[code];
  const maxParty = useMemo(() => {
    if (!result?.parties.length) return 1;
    return Math.max(...result.parties.map((p) => p.total), 1);
  }, [result]);

  const last = useMemo(() => {
    if (!data?.fetchedAt) return '';
    try {
      return new Date(data.fetchedAt).toLocaleString();
    } catch {
      return data.fetchedAt;
    }
  }, [data?.fetchedAt]);

  return (
    <div className="app">
      <Link href="/" className="back-link">
        ← All states
      </Link>

      <header className="header">
        <div className="header-left">
          <div className="india-flag">
            <div className="flag-saffron" />
            <div className="flag-white">
              <div className="ashoka-chakra">☸</div>
            </div>
            <div className="flag-green" />
          </div>
          <div>
            <h1 className="title">{result?.name ?? code}</h1>
            <p className="subtitle">
              {result ? `${result.declared} / ${result.totalSeats} declared` : 'Loading…'}
              {(result?.leadingConstituencies ?? 0) > 0
                ? ` · ${result?.leadingConstituencies} with lead`
                : ''}
            </p>
          </div>
        </div>
        <div className="header-right">
          <LiveBadge isLive={isLive} onToggle={() => setIsLive(!isLive)} />
          <div className="last-updated">Updated: {last || '—'}</div>
          {data && (
            <div className="source-line">
              Source: {data.source} · {data.parserVersion}
            </div>
          )}
        </div>
      </header>

      {isLoading && <div className="loading">Loading…</div>}
      {error && <div className="error-box">{String(error)}</div>}

      {result && (
        <>
          <div className="majority-line">
            Majority: <strong>{result.majority}</strong> of {result.totalSeats} seats
          </div>

          <div className="alliance-grid">
            {result.alliances.map((a) => (
              <AllianceCard
                key={a.id}
                stateCode={result.code}
                allianceId={a.id}
                seats={a.seats}
                totalSeats={result.totalSeats}
                majority={result.majority}
                parties={a.partyIds}
              />
            ))}
          </div>

          <ResultsCharts result={result} />

          <div className="seats-visualization">
            <h3>Parties (won / leading / total)</h3>
            {result.parties.map((p) => (
              <div key={p.id}>
                <SeatBar partyId={p.id} seats={p.total} maxSeats={maxParty} />
                <div className="seat-subcounts">
                  won {p.won} · leading {p.leading}
                </div>
              </div>
            ))}
            {result.parties.length === 0 && (
              <p style={{ color: '#888', fontSize: 14 }}>No party tallies yet — counting may not have started.</p>
            )}
          </div>

          <div className="parties-table" style={{ marginTop: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Party (full name)</th>
                  <th className="num">Won</th>
                  <th className="num leading">Leading</th>
                  <th className="num bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {result.parties.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="party-cell">
                        <span className="party-dot" style={{ background: partyColor(p.id) }} />
                        <div>
                          <div className="party-table-full">{partyFullName(p.id)}</div>
                          <div className="party-table-code">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num">{p.won}</td>
                    <td className="num leading">{p.leading}</td>
                    <td className="num bold">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <footer className="footer">
        <p>News18 API primary · NDTV fallback · ECI for official results.</p>
      </footer>
    </div>
  );
}
