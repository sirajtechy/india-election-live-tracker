import { NextResponse } from 'next/server';
import { readSnapshot } from '@/lib/cache';
import { getMemoryMeta } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snap = await readSnapshot();
  const mem = getMemoryMeta();
  if (!snap) {
    return NextResponse.json({
      ok: false,
      lastSuccess: null,
      source: null,
      ageSec: null,
      memory: mem,
    });
  }
  const fetched = new Date(snap.fetchedAt).getTime();
  const ageSec = Number.isFinite(fetched) ? Math.floor((Date.now() - fetched) / 1000) : null;
  return NextResponse.json({
    ok: true,
    lastSuccess: snap.fetchedAt,
    source: snap.source,
    parserVersion: snap.parserVersion,
    ageSec,
    memory: mem,
  });
}
