import { NextResponse } from 'next/server';
import { readSnapshot, writeSnapshot } from '@/lib/cache';
import { fetchLiveSnapshot } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';

export async function GET() {
  let snap = await readSnapshot();
  if (!snap) {
    try {
      snap = await fetchLiveSnapshot();
      await writeSnapshot(snap);
    } catch {
      return NextResponse.json(
        { error: 'No cached results yet. Wait for cron or hit /api/cron/refresh.' },
        { status: 503 },
      );
    }
  }
  return NextResponse.json(snap, {
    headers: {
      'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
    },
  });
}
