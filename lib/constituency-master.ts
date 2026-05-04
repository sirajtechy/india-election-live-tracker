import { normalizePartyId } from './party-aliases';
import type { ConstituencyMasterRow } from './types';
import type { AnalyticConstituencyRow } from './constituency-breakdown';

function strField(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function nullableCand(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') {
    const t = v.trim();
    return t || null;
  }
  return String(v);
}

/**
 * One row per constituency from News18 analytic-data: current status, winner/lead party + candidate when the API sends them.
 */
export function buildConstituencyMaster(rows: AnalyticConstituencyRow[]): ConstituencyMasterRow[] {
  const out: ConstituencyMasterRow[] = [];

  for (const row of rows) {
    const past = row.past;
    if (!past?.length) continue;

    const y2026 = past.find((p) => {
      const o = p as Record<string, unknown>;
      return String(o.year) === '2026';
    }) as Record<string, unknown> | undefined;

    if (!y2026) continue;

    const winnerRaw = strField(y2026, 'winner');
    const leadingRaw = strField(y2026, 'leadingParty', 'LeadingParty', 'leading_party');
    const isLeading = y2026.isLeading === true || y2026.leading === true;

    let status: ConstituencyMasterRow['status'];
    if (winnerRaw) {
      status = 'declared';
    } else if (leadingRaw) {
      status = 'leading';
    } else if (isLeading) {
      status = 'counting';
    } else {
      status = 'awaiting';
    }

    const voteShare = typeof y2026.voteShare === 'number' ? y2026.voteShare : undefined;
    const turnout = typeof y2026.turnout === 'number' ? y2026.turnout : undefined;

    const winnerPartyId = winnerRaw ? normalizePartyId(winnerRaw) : undefined;
    const leadingPartyId = leadingRaw ? normalizePartyId(leadingRaw) : undefined;

    const leadCand =
      strField(y2026, 'leadingCand', 'leadingCandidate', 'leading_candidate') ||
      nullableCand(y2026.winningCand);

    const leadName =
      leadingRaw ? (leadCand || null) : isLeading && !winnerRaw ? nullableCand(y2026.winningCand) : null;

    out.push({
      acNo: typeof row.acNo === 'number' ? row.acNo : 0,
      consName: row.consName ?? '—',
      district: row.district,
      consId: row.consId,
      status,
      winnerPartyRaw: winnerRaw || undefined,
      winnerPartyId,
      winnerCandidate: winnerRaw ? nullableCand(y2026.winningCand) : null,
      leadingPartyRaw: leadingRaw || undefined,
      leadingPartyId,
      leadingCandidate: leadName,
      voteShare,
      turnout,
    });
  }

  out.sort((a, b) => (a.acNo || 0) - (b.acNo || 0));
  return out;
}
