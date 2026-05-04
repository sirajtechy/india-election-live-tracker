/** Map upstream party codes to canonical ids used in UI / colors */
export const PARTY_ALIASES: Record<string, string> = {
  CPIM: 'CPM',
  'KC(M)': 'KCM',
  AITC: 'TMC',
  'AIADMK+': 'AIADMK',
};

export function normalizePartyId(raw: string): string {
  const t = raw.trim().toUpperCase();
  if (!t) return 'OTH';
  return PARTY_ALIASES[t] ?? t;
}
