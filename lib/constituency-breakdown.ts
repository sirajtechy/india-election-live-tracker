import { normalizePartyId } from './party-aliases';
import type { ConstituencySeat, PartySeatLists } from './types';

/** Raw row shape from News18 analytic-data */
/** Loose row shape so News18 `AnalyticRow` passes TypeScript without casts */
export interface AnalyticConstituencyRow {
  past?: unknown[] | undefined;
  consName?: string;
  acNo?: number;
  consId?: string;
  district?: string;
}

function seatFromRow(row: AnalyticConstituencyRow): ConstituencySeat {
  return {
    consName: row.consName ?? '—',
    acNo: typeof row.acNo === 'number' ? row.acNo : 0,
    consId: row.consId,
    district: row.district,
  };
}

function sortByAc(a: ConstituencySeat, b: ConstituencySeat): number {
  return (a.acNo || 0) - (b.acNo || 0);
}

/**
 * Build per-party constituency lists from News18 rows.
 * - Won: 2026 row has non-empty `winner`
 * - Leading: 2026 row has `leadingParty` (when API publishes it during counting)
 */
export function buildConstituencyBreakdown(rows: AnalyticConstituencyRow[]): {
  constituenciesByParty: Record<string, PartySeatLists>;
  countingUndeclared: ConstituencySeat[];
} {
  const byParty = new Map<string, { won: ConstituencySeat[]; leading: ConstituencySeat[] }>();
  const countingUndeclared: ConstituencySeat[] = [];

  const ensure = (pid: string) => {
    if (!byParty.has(pid)) byParty.set(pid, { won: [], leading: [] });
    return byParty.get(pid)!;
  };

  for (const row of rows) {
    const past = row.past;
    if (!past?.length) continue;
    const y2026 = past.find((p) => {
      const o = p as Record<string, unknown>;
      return String(o.year) === '2026';
    }) as Record<string, unknown> | undefined;
    if (!y2026) continue;

    const winnerRaw = String(y2026.winner ?? '').trim();
    const leadingRaw = String(y2026.leadingParty ?? '').trim();
    const seat = seatFromRow(row);

    if (winnerRaw) {
      const id = normalizePartyId(winnerRaw);
      ensure(id).won.push(seat);
    } else if (leadingRaw) {
      const id = normalizePartyId(leadingRaw);
      ensure(id).leading.push(seat);
    } else if (y2026.isLeading === true || y2026.leading === true) {
      countingUndeclared.push(seat);
    }
  }

  const constituenciesByParty: Record<string, PartySeatLists> = {};
  for (const [pid, lists] of byParty.entries()) {
    constituenciesByParty[pid] = {
      won: [...lists.won].sort(sortByAc),
      leading: [...lists.leading].sort(sortByAc),
    };
  }

  countingUndeclared.sort(sortByAc);

  return { constituenciesByParty, countingUndeclared };
}
