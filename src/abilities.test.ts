import { describe, it, expect } from 'vitest';
import { ABILITIES, type AbilityContext } from './abilities.js';
import { type Player } from './types.js';

describe('Abilities', () => {
  const mockPlayer: Player = {
    id: 'test',
    name: 'Test Batter',
    stats: { contact: 50, power: 50, patience: 50, speed: 50 },
    abilities: []
  };

  it('CRUTCH should provide +20 contact at PRE_SWING', () => {
    const ability = ABILITIES.CRUTCH;
    if (!ability) throw new Error('Crutch ability not found');

    const ctx: AbilityContext = {
      player: { ...mockPlayer },
      scoreMultiplier: 1,
      flatBonus: 0,
      stage: 'PRE_SWING'
    };

    const nextCtx = ability.effect(ctx);
    expect(nextCtx.player.stats.contact).toBe(70);
  });

  it('BIG_BATS should provide +1 flatBonus on HOME_RUN at POST_SWING', () => {
    const ability = ABILITIES.BIG_BATS;
    if (!ability) throw new Error('Big Bats ability not found');

    const ctx: AbilityContext = {
      player: mockPlayer,
      result: 'HOME_RUN',
      scoreMultiplier: 1,
      flatBonus: 0,
      stage: 'POST_SWING'
    };

    const nextCtx = ability.effect(ctx);
    expect(nextCtx.flatBonus).toBe(1);
  });

  it('BIG_BATS should NOT provide bonus on SINGLE', () => {
    const ability = ABILITIES.BIG_BATS;
    if (!ability) throw new Error('Big Bats ability not found');

    const ctx: AbilityContext = {
      player: mockPlayer,
      result: 'SINGLE',
      scoreMultiplier: 1,
      flatBonus: 0,
      stage: 'POST_SWING'
    };

    const nextCtx = ability.effect(ctx);
    expect(nextCtx.flatBonus).toBe(0);
  });
});
