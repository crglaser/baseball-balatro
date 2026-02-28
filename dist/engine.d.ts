import { type Player, type Result, type GameState } from './types.js';
export declare class Engine {
    static simulatePlateAppearance(player: Player): Result;
    static processResult(state: GameState, result: Result): GameState;
    private static advanceRunners;
}
//# sourceMappingURL=engine.d.ts.map