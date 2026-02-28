export type Result = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'HOME_RUN' | 'WALK' | 'OUT' | 'STRIKEOUT';
export interface Stats {
    contact: number;
    power: number;
    patience: number;
    speed: number;
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
    batters: Player[];
}
export interface GameState {
    lineup: Lineup;
    inning: number;
    outs: number;
    score: number;
    runners: (Player | null)[];
    currentBatterIndex: number;
}
//# sourceMappingURL=types.d.ts.map