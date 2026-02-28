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

export const ABILITIES: Record<string, Ability> = {
  CRUTCH: {
    name: 'The Crutch',
    description: '+20 contact on 2 strikes (always active for now)',
    effect: (ctx) => {
      if (ctx.stage === 'PRE_SWING') {
        ctx.player.stats.contact += 20;
      }
      return ctx;
    }
  },
  BIG_BATS: {
    name: 'Big Bats',
    description: 'Home Runs give +1 additional run (flat bonus)',
    effect: (ctx) => {
      if (ctx.stage === 'POST_SWING' && ctx.result === 'HOME_RUN') {
        ctx.flatBonus += 1;
      }
      return ctx;
    }
  }
};
