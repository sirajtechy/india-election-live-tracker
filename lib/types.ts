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
}

export interface Snapshot {
  fetchedAt: string;
  source: DataSource;
  parserVersion: string;
  states: Record<StateCode, StateResult>;
}
