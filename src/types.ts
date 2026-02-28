export type Result = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'HOME_RUN' | 'WALK' | 'OUT' | 'STRIKEOUT';

export interface Stats {
  contact: number; // 0-100
  power: number;   // 0-100
  patience: number; // 0-100
  speed: number;   // 0-100
}

export interface Ability {
  name: string;
  description: string;
  effect: (context: any) => any;
}

export interface Player {
  id: string;
  name: string;
  stats: Stats;
  abilities: Ability[];
}

export interface Lineup {
  batters: Player[]; // Usually 9 players
}

export interface GameState {
  lineup: Lineup;
  inning: number;
  outs: number;
  score: number;
  runners: (Player | null)[]; // [1st, 2nd, 3rd]
  currentBatterIndex: number;
}
