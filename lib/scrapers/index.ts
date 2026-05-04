import type { Snapshot } from '../types';
import { STATE_CODES } from '../states';
import { buildStateResult } from '../aggregate';
import { fetchNews18Snapshot } from './news18';
import { fetchNdtvSnapshot } from './ndtv';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetries<T>(fn: () => Promise<T>, tries = 3, baseMs = 400): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i += 1) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await sleep(baseMs * 2 ** i + Math.random() * 200);
    }
  }
  throw last;
}

function emptySnapshot(source: Snapshot['source']): Snapshot {
  const states = {} as Snapshot['states'];
  for (const code of STATE_CODES) {
    states[code] = {
      ...buildStateResult(code, new Map()),
      constituenciesByParty: {},
      countingUndeclared: [],
      constituencyMaster: [],
    };
  }
  return {
    fetchedAt: new Date().toISOString(),
    source,
    parserVersion: 'empty',
    states,
  };
}

/**
 * Primary: News18 public JSON API. Fallback: NDTV HTML parse (often blocked off-Vercel).
 */
export async function fetchLiveSnapshot(): Promise<Snapshot> {
  try {
    return await withRetries(() => fetchNews18Snapshot(), 3, 500);
  } catch (e) {
    console.error('[scraper] News18 failed', e);
    try {
      const ndtv = await withRetries(() => fetchNdtvSnapshot(), 2, 600);
      if (ndtv) return ndtv;
    } catch (e2) {
      console.error('[scraper] NDTV failed', e2);
    }
    return emptySnapshot('demo');
  }
}
