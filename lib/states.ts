export const STATE_CODES = ['WB', 'TN', 'KL', 'AS', 'PY'] as const;
export type StateCode = (typeof STATE_CODES)[number];

export type AllianceConfig = Record<string, readonly string[]>;

export interface StateConfig {
  name: string;
  seats: number;
  majority: number;
  alliances: AllianceConfig;
}

export const STATES: Record<StateCode, StateConfig> = {
  WB: {
    name: 'West Bengal',
    seats: 294,
    majority: 148,
    alliances: {
      TMC: ['AITC', 'TMC'],
      NDA: ['BJP'],
      LF_INC: ['CPM', 'CPIM', 'CPI', 'INC', 'RSP', 'AIFB'],
    },
  },
  TN: {
    name: 'Tamil Nadu',
    seats: 234,
    majority: 118,
    alliances: {
      SPA: ['DMK', 'INC', 'VCK', 'CPI', 'CPM', 'CPIM', 'MDMK', 'VCK'],
      NDA: ['AIADMK', 'BJP', 'PMK'],
      /** Nam Tamilar Katchi (Seeman) — do not confuse with TVK (Tamilaga Vettri Kazhagam) */
      NTK: ['NTK'],
      /** Tamilaga Vettri Kazhagam (Vijay) — appears only when upstream uses this winner code */
      TVK: ['TVK'],
    },
  },
  KL: {
    name: 'Kerala',
    seats: 140,
    majority: 71,
    alliances: {
      LDF: ['CPM', 'CPIM', 'CPI', 'KC(M)', 'KCM', 'JD(S)', 'NCP', 'KC'],
      UDF: ['INC', 'IUML', 'KC', 'RSP', 'CMPJ'],
      NDA: ['BJP', 'BDJS', 'Kerala KCM'],
    },
  },
  AS: {
    name: 'Assam',
    seats: 126,
    majority: 64,
    alliances: {
      NDA: ['BJP', 'AGP', 'UPPL'],
      MAHAJOT: ['INC', 'AIUDF', 'CPM', 'CPIM', 'CPI', 'BPF', 'AJP'],
    },
  },
  PY: {
    name: 'Puducherry',
    seats: 30,
    majority: 16,
    alliances: {
      NDA: ['AINRC', 'BJP', 'AIADMK'],
      SDA: ['DMK', 'INC', 'VCK', 'CPI'],
    },
  },
};

export function isStateCode(s: string): s is StateCode {
  return (STATE_CODES as readonly string[]).includes(s);
}
