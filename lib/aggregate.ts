import type { AllianceTally, PartyTally, StateResult } from './types';
import { STATES, type StateCode } from './states';
import { normalizePartyId } from './party-aliases';

function partyBelongsToAlliance(partyId: string, members: readonly string[]): boolean {
  const p = normalizePartyId(partyId);
  return members.some((m) => normalizePartyId(m) === p);
}

export function buildStateResult(
  code: StateCode,
  tallies: Map<string, { won: number; leading: number }>,
  opts?: { declaredConstituencies?: number; leadingConstituencies?: number },
): StateResult {
  const cfg = STATES[code];
  const parties: PartyTally[] = Array.from(tallies.entries())
    .map(([id, v]) => ({
      id: normalizePartyId(id),
      won: v.won,
      leading: v.leading,
      total: v.won + v.leading,
    }))
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total);

  const used = new Set<string>();
  const alliances: AllianceTally[] = [];

  for (const [allianceId, members] of Object.entries(cfg.alliances)) {
    let seats = 0;
    const partyIds: string[] = [];
    for (const pt of parties) {
      if (partyBelongsToAlliance(pt.id, members)) {
        seats += pt.total;
        partyIds.push(pt.id);
        used.add(pt.id);
      }
    }
    alliances.push({
      id: allianceId,
      name: allianceId.replace(/_/g, ' + '),
      seats,
      partyIds: [...new Set(partyIds)],
    });
  }

  let others = 0;
  const othersParties: string[] = [];
  for (const pt of parties) {
    if (!used.has(pt.id)) {
      others += pt.total;
      othersParties.push(pt.id);
    }
  }
  if (others > 0) {
    alliances.push({
      id: 'OTHERS',
      name: 'Others',
      seats: others,
      partyIds: othersParties,
    });
  }

  const declaredFromParties = parties.reduce((s, p) => s + p.won, 0);
  const declared = opts?.declaredConstituencies ?? declaredFromParties;
  const leadingConstituencies = opts?.leadingConstituencies;

  return {
    code,
    name: cfg.name,
    totalSeats: cfg.seats,
    majority: cfg.majority,
    declared,
    leadingConstituencies,
    parties,
    alliances: alliances.sort((a, b) => b.seats - a.seats),
  };
}
