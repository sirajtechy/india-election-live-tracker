import type { Snapshot } from './types';

const CACHE_KEY = 'results:v1';
const TTL_SECONDS = 120;

let memorySnapshot: Snapshot | null = null;
let memoryFetchedAt = 0;

function hasKvEnv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function readSnapshot(): Promise<Snapshot | null> {
  if (hasKvEnv()) {
    try {
      const { kv } = await import('@vercel/kv');
      const raw = await kv.get<string>(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Snapshot;
        return parsed;
      }
    } catch (e) {
      console.error('[cache] KV read failed', e);
    }
  }
  return memorySnapshot;
}

export async function writeSnapshot(snapshot: Snapshot): Promise<void> {
  memorySnapshot = snapshot;
  memoryFetchedAt = Date.now();

  if (hasKvEnv()) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(CACHE_KEY, JSON.stringify(snapshot), { ex: TTL_SECONDS });
    } catch (e) {
      console.error('[cache] KV write failed', e);
    }
  }
}

export function getMemoryMeta(): { ageSec: number | null; hasMemory: boolean } {
  if (!memorySnapshot) return { ageSec: null, hasMemory: false };
  return { ageSec: Math.floor((Date.now() - memoryFetchedAt) / 1000), hasMemory: true };
}
