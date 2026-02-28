import { type Result, type Player } from './types.js';
export interface AbilityContext {
    player: Player;
    result?: Result;
    scoreMultiplier: number;
    flatBonus: number;
    stage: 'PRE_SWING' | 'POST_SWING';
}
export type AbilityEffect = (context: AbilityContext) => AbilityContext;
export interface Ability {
    name: string;
    description: string;
    effect: AbilityEffect;
}
export declare const ABILITIES: Record<string, Ability>;
//# sourceMappingURL=abilities.d.ts.map