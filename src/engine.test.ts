import { describe, it, expect } from 'vitest';
import { Engine } from './engine.js';
import { type Player, type GameState } from './types.js';

describe('Engine', () => {
  const mockPlayer: Player = {
    id: 'test',
    name: 'Test Batter',
    stats: { contact: 50, power: 50, patience: 50, speed: 50 },
    abilities: []
  };

  const mockGameState: GameState = {
    lineup: { batters: [mockPlayer] },
    inning: 1,
    outs: 0,
    score: 0,
    runners: [null, null, null],
    currentBatterIndex: 0,
  };

  it('should correctly advance runners on a SINGLE', () => {
    const state = { ...mockGameState, runners: [mockPlayer, null, null] as (Player | null)[] };
    const nextState = Engine.processResult(state, 'SINGLE');
    
    // Runner on 1st moves to 2nd, batter moves to 1st
    expect(nextState.runners[1]).toBe(mockPlayer);
    expect(nextState.runners[0]).toBe(mockPlayer);
    expect(nextState.score).toBe(0);
  });

  it('should score a run on a HOME_RUN', () => {
    const state = { ...mockGameState, runners: [mockPlayer, null, null] as (Player | null)[] };
    const nextState = Engine.processResult(state, 'HOME_RUN');
    
    // Both runner and batter score
    expect(nextState.score).toBe(2);
    expect(nextState.runners).toEqual([null, null, null]);
  });

  it('should increment outs on an OUT', () => {
    const nextState = Engine.processResult(mockGameState, 'OUT');
    expect(nextState.outs).toBe(1);
  });

  it('should cycle the batting order', () => {
    const stateWithTwo = {
        ...mockGameState,
        lineup: { batters: [mockPlayer, { ...mockPlayer, id: '2' }] }
    };
    const nextState = Engine.processResult(stateWithTwo, 'OUT');
    expect(nextState.currentBatterIndex).toBe(1);
    
    const secondState = Engine.processResult(nextState, 'OUT');
    expect(secondState.currentBatterIndex).toBe(0);
  });
});
