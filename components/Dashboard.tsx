'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import type { Snapshot } from '@/lib/types';
import { STATE_CODES } from '@/lib/states';
import { formatIndiaDateTime } from '@/lib/format-time';
import { LiveBadge } from './LiveBadge';
import { StateTile } from './StateTile';

async function fetcher(url: string): Promise<Snapshot> {
  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

function formatSource(s: Snapshot['source']): string {
  if (s === 'news18') return 'News18 (Elections API)';
  if (s === 'ndtv') return 'NDTV (HTML parse)';
  if (s === 'stale-cache') return 'cached (upstream failed)';
  return 'demo / empty';
}

export function Dashboard() {
  const [isLive, setIsLive] = useState(true);
  const { data, error, isLoading } = useSWR<Snapshot>('/api/results', fetcher, {
    refreshInterval: isLive ? 20_000 : 0,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const last = useMemo(() => {
    if (!data?.fetchedAt) return '';
    return formatIndiaDateTime(data.fetchedAt);
  }, [data?.fetchedAt]);

  return (
    <div className="app">
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
            <h1 className="title">India Election Live Tracker</h1>
            <p className="subtitle">Assembly elections 2026 — counting day (May 4)</p>
          </div>
        </div>
        <div className="header-right">
          <LiveBadge isLive={isLive} onToggle={() => setIsLive(!isLive)} />
          <div className="last-updated">Fetched: {last || '—'}</div>
          {data?.sourceDataTime && (
            <div className="source-line source-news18-time">News18 data time: {data.sourceDataTime}</div>
          )}
          {data && (
            <div className="source-line">
              Source: {formatSource(data.source)} · parser {data.parserVersion}
            </div>
          )}
        </div>
      </header>

      <div className="majority-line">
        <span>
          Tracking <strong>5</strong> assemblies: West Bengal, Tamil Nadu, Kerala, Assam, Puducherry (
          <strong>824</strong> seats total)
        </span>
      </div>

      {isLoading && <div className="loading">Loading results…</div>}
      {error && (
        <div className="error-box">
          Could not load results. Try again or ensure <code>/api/results</code> is reachable.
          <pre style={{ marginTop: 8, fontSize: 11, whiteSpace: 'pre-wrap' }}>{String(error)}</pre>
        </div>
      )}

      {data && (
        <div className="states-grid">
          {STATE_CODES.map((code) => (
            <StateTile key={code} result={data.states[code]} />
          ))}
        </div>
      )}

      <footer className="footer">
        <p>
          Data aggregated from News18 Elections API (primary) with NDTV HTML fallback. Official results: ECI. Not
          affiliated with News18 or NDTV.
        </p>
      </footer>
    </div>
  );
}
