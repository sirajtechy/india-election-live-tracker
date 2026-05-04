import type { StateCode } from './states';

const ALLIANCE_FULL_NAMES: Record<
  StateCode,
  Record<string, string>
> = {
  WB: {
    TMC: 'All India Trinamool Congress',
    NDA: 'National Democratic Alliance',
    LF_INC: 'Left Front & Congress (Sanjukta Morcha)',
  },
  TN: {
    SPA: 'Secular Progressive Alliance (DMK-led)',
    NDA: 'National Democratic Alliance (AIADMK-led)',
    NTK: 'Nam Tamilar Katchi',
    TVK: 'Tamilaga Vettri Kazhagam',
  },
  KL: {
    LDF: 'Left Democratic Front',
    UDF: 'United Democratic Front',
    NDA: 'National Democratic Alliance',
  },
  AS: {
    NDA: 'National Democratic Alliance',
    MAHAJOT: 'Mahajot (Congress-led alliance)',
  },
  PY: {
    NDA: 'National Democratic Alliance',
    SDA: 'Secular Democratic Alliance',
  },
};

export function allianceFullName(stateCode: StateCode, allianceId: string): string {
  if (allianceId === 'OTHERS') return 'Other parties & independents';

  const row = ALLIANCE_FULL_NAMES[stateCode];
  const named = row?.[allianceId];
  if (named) return named;

  return allianceId.replace(/_/g, ' ');
}
