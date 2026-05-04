import type { StateCode } from './states';

export type DataSource = 'news18' | 'ndtv' | 'stale-cache' | 'demo';

export interface PartyTally {
  id: string;
  won: number;
  leading: number;
  total: number;
}

export interface AllianceTally {
  id: string;
  name: string;
  seats: number;
  partyIds: string[];
}

export interface ConstituencySeat {
  consName: string;
  acNo: number;
  consId?: string;
  district?: string;
}

export interface PartySeatLists {
  won: ConstituencySeat[];
  leading: ConstituencySeat[];
}

export type ConstituencyMasterStatus = 'declared' | 'leading' | 'counting' | 'awaiting';

/** Full AC list with status and winner/lead fields from News18 2026 row (when published). */
export interface ConstituencyMasterRow {
  acNo: number;
  consName: string;
  district?: string;
  consId?: string;
  status: ConstituencyMasterStatus;
  winnerPartyRaw?: string;
  winnerPartyId?: string;
  winnerCandidate?: string | null;
  leadingPartyRaw?: string;
  leadingPartyId?: string;
  leadingCandidate?: string | null;
  voteShare?: number;
  turnout?: number;
}

export interface StateResult {
  code: StateCode;
  name: string;
  totalSeats: number;
  majority: number;
  /** Constituencies with a final declared winner (2026) */
  declared: number;
  /** Constituencies with a lead but no final winner yet (if API provides) */
  leadingConstituencies?: number;
  parties: PartyTally[];
  alliances: AllianceTally[];
  /** Per party: which ACs are won vs leading (from News18 rows) */
  constituenciesByParty?: Record<string, PartySeatLists>;
  /** ACs where counting is on but API has not published a leading-party code yet */
  countingUndeclared?: ConstituencySeat[];
  /** Every constituency with 2026 row: status + parties/candidates when API provides them */
  constituencyMaster?: ConstituencyMasterRow[];
}

export interface Snapshot {
  fetchedAt: string;
  /** News18 API root `timeStamp` string when scraping from News18 (their clock / wording). */
  sourceDataTime?: string;
  source: DataSource;
  parserVersion: string;
  states: Record<StateCode, StateResult>;
}
