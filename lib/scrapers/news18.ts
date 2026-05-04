import { buildStateResult } from '../aggregate';
import { normalizePartyId } from '../party-aliases';
import { STATE_CODES, type StateCode } from '../states';
import type { Snapshot } from '../types';

const PARSER_VERSION = 'news18-analytic-data-v1';

const BASE = 'https://elections-v3-api.news18.com/api/en/analytic-data';

const DEFAULT_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'en-IN,en;q=0.9',
};

interface PastYearRow {
  year: string | number;
  winner?: string;
  leadingParty?: string;
  leading?: boolean;
  voteShare?: number;
}

interface AnalyticRow {
  past?: PastYearRow[];
  consName?: string;
}

interface AnalyticResponse {
  status: boolean;
  data?: AnalyticRow[];
}

export function aggregateConstituencyRows(rows: AnalyticRow[]): {
  tallies: Map<string, { won: number; leading: number }>;
  declaredConstituencies: number;
  leadingConstituencies: number;
} {
  const map = new Map<string, { won: number; leading: number }>();
  let declaredConstituencies = 0;
  let leadingConstituencies = 0;

  for (const row of rows) {
    const past = row.past;
    if (!past?.length) continue;
    const y2026 = past.find((p) => String(p.year) === '2026');
    if (!y2026) continue;

    const winnerRaw = (y2026.winner ?? '').trim();
    const leadingRaw = (y2026 as { leadingParty?: string }).leadingParty?.trim?.() ?? '';

    if (winnerRaw) {
      declaredConstituencies += 1;
      const id = normalizePartyId(winnerRaw);
      const cur = map.get(id) ?? { won: 0, leading: 0 };
      cur.won += 1;
      map.set(id, cur);
    } else if (leadingRaw) {
      leadingConstituencies += 1;
      const id = normalizePartyId(leadingRaw);
      const cur = map.get(id) ?? { won: 0, leading: 0 };
      cur.leading += 1;
      map.set(id, cur);
    }
  }

  return { tallies: map, declaredConstituencies, leadingConstituencies };
}

async function fetchStateRows(code: StateCode): Promise<AnalyticRow[]> {
  const url = `${BASE}?shortState=${encodeURIComponent(code)}&type=AS`;
  const res = await fetch(url, { headers: DEFAULT_HEADERS, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`News18 ${code}: HTTP ${res.status}`);
  const json = (await res.json()) as AnalyticResponse;
  if (!json.status || !Array.isArray(json.data)) {
    throw new Error(`News18 ${code}: invalid payload`);
  }
  return json.data;
}

export async function fetchNews18Snapshot(): Promise<Snapshot> {
  const states = {} as Snapshot['states'];

  for (const code of STATE_CODES) {
    const rows = await fetchStateRows(code);
    const { tallies, declaredConstituencies, leadingConstituencies } = aggregateConstituencyRows(rows);
    states[code] = buildStateResult(code, tallies, {
      declaredConstituencies,
      leadingConstituencies,
    });
  }

  return {
    fetchedAt: new Date().toISOString(),
    source: 'news18',
    parserVersion: PARSER_VERSION,
    states,
  };
}
