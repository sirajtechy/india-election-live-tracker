import { normalizePartyId } from './party-aliases';

const COLORS: Record<string, string> = {
  BJP: '#FF9933',
  INC: '#00BFFF',
  TMC: '#3CB371',
  AITC: '#3CB371',
  DMK: '#C0392B',
  AIADMK: '#228B22',
  CPM: '#E74C3C',
  CPIM: '#E74C3C',
  CPI: '#C0392B',
  SP: '#FF0000',
  AGP: '#F1C40F',
  UPPL: '#9B59B6',
  AIUDF: '#16A085',
  NTK: '#8E44AD',
  /** Tamilaga Vettri Kazhagam (not Nam Tamilar `NTK`) */
  TVK: '#9B59B6',
  PMK: '#F39C12',
  VCK: '#1ABC9C',
  IUML: '#2ECC71',
  BDJS: '#D35400',
  AINRC: '#3498DB',
  RSP: '#E67E22',
  AIFB: '#C0392B',
  AIMIM: '#27AE60',
  IND: '#95A5A6',
  OTH: '#95A5A6',
  OTHERS: '#95A5A6',
};

export function partyColor(partyId: string): string {
  const id = normalizePartyId(partyId);
  return COLORS[id] ?? '#95A5A6';
}

export function allianceDisplayColor(allianceId: string): string {
  const map: Record<string, string> = {
    TMC: '#3CB371',
    NDA: '#FF9933',
    LF_INC: '#E74C3C',
    SPA: '#C0392B',
    NTK: '#8E44AD',
    TVK: '#9B59B6',
    LDF: '#E74C3C',
    UDF: '#00BFFF',
    MAHAJOT: '#00BFFF',
    SDA: '#00BFFF',
    OTHERS: '#95A5A6',
  };
  return map[allianceId] ?? '#95A5A6';
}
