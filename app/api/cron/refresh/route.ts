import { NextRequest, NextResponse } from 'next/server';
import { readSnapshot, writeSnapshot } from '@/lib/cache';
import { fetchLiveSnapshot } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorizeCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Allow in dev when unset (Vercel production should set CRON_SECRET)
    return process.env.NODE_ENV !== 'production';
  }
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let snapshot = await fetchLiveSnapshot();
  const previous = await readSnapshot();

  if (snapshot.source === 'demo' && previous) {
    snapshot = {
      ...previous,
      fetchedAt: snapshot.fetchedAt,
      source: 'stale-cache',
      parserVersion: previous.parserVersion,
    };
  }

  await writeSnapshot(snapshot);

  return NextResponse.json({
    ok: true,
    source: snapshot.source,
    fetchedAt: snapshot.fetchedAt,
  });
}

/** Manual refresh in dev */
export async function POST(req: NextRequest) {
  return GET(req);
}
