import * as cheerio from 'cheerio';
import { buildStateResult } from '../aggregate';
import { normalizePartyId } from '../party-aliases';
import { STATE_CODES, STATES, type StateCode } from '../states';

import type { Snapshot } from '../types';

const PARSER_VERSION = 'ndtv-html-v1';

const NDTV_ELECTIONS = 'https://www.ndtv.com/elections';

const DEFAULT_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-IN,en;q=0.9',
};

/**
 * Best-effort HTML parse when NDTV serves full HTML (Akamai sometimes blocks bots).
 * Looks for lines like "TMC 45" or "BJP - 12" near state headings.
 */
export function parseNdtvElectionsHtml(html: string): Partial<Record<StateCode, Map<string, { won: number; leading: number }>>> | null {
  if (html.includes('Access Denied') || html.length < 5000) return null;

  const $ = cheerio.load(html);
  const text = $('body').text().replace(/\s+/g, ' ');
  const out: Partial<Record<StateCode, Map<string, { won: number; leading: number }>>> = {};

  for (const code of STATE_CODES) {
    const stateName = STATES[code].name;
    const idx = text.search(new RegExp(stateName.replace(/ /g, '\\s+'), 'i'));
    if (idx < 0) continue;
    const window = text.slice(idx, idx + 4000);
    const tallies = new Map<string, { won: number; leading: number }>();

    const partyToken = /(BJP|INC|TMC|DMK|AIADMK|CPIM|CPM|CPI|IUML|AGP|UPPL|AIUDF|AINRC|NTK|PMK|VCK|BDJS|IND)\b[^0-9]{0,40}?(\d+)/gi;
    let m: RegExpExecArray | null;
    let n = 0;
    while ((m = partyToken.exec(window)) && n < 40) {
      n += 1;
      const id = normalizePartyId(m[1]);
      const val = parseInt(m[2], 10);
      if (!Number.isFinite(val)) continue;
      const cur = tallies.get(id) ?? { won: 0, leading: 0 };
      cur.won += val;
      tallies.set(id, cur);
    }
    if (tallies.size > 0) out[code] = tallies;
  }

  return Object.keys(out).length ? out : null;
}

export async function fetchNdtvSnapshot(): Promise<Snapshot | null> {
  const res = await fetch(NDTV_ELECTIONS, { headers: DEFAULT_HEADERS, next: { revalidate: 0 } });
  if (!res.ok) return null;
  const html = await res.text();
  const partial = parseNdtvElectionsHtml(html);
  if (!partial) return null;

  const states = {} as Snapshot['states'];
  for (const code of STATE_CODES) {
    const tallies = partial[code];
    if (tallies && tallies.size > 0) {
      states[code] = {
        ...buildStateResult(code, tallies),
        constituenciesByParty: {},
        countingUndeclared: [],
        constituencyMaster: [],
      };
    } else {
      states[code] = {
        ...buildStateResult(code, new Map()),
        constituenciesByParty: {},
        countingUndeclared: [],
        constituencyMaster: [],
      };
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    source: 'ndtv',
    parserVersion: PARSER_VERSION,
    states,
  };
}
