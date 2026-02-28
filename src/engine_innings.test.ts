import { describe, it, expect } from 'vitest';
import { Engine } from './engine.js';
import { type Player, type GameState } from './types.js';

describe('Engine - Inning & Outs', () => {
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

  it('should increment outs when an OUT occurs', () => {
    const nextState = Engine.processResult(mockGameState, 'OUT');
    expect(nextState.outs).toBe(1);
    expect(nextState.inning).toBe(1); // Inning shouldn't flip yet
  });

  it('should reset outs but NOT flip inning when reaching 3 outs (UI handles flip)', () => {
    let state = { ...mockGameState, outs: 2 };
    const nextState = Engine.processResult(state, 'OUT');
    
    expect(nextState.outs).toBe(3); 
    expect(nextState.inning).toBe(1); // Crucial: Engine shouldn't flip inning, UI handles it via handleNextInning
  });

  it('should score runs and keep outs correct', () => {
    let state = { ...mockGameState, runners: [mockPlayer, mockPlayer, mockPlayer] as (Player|null)[] };
    const nextState = Engine.processResult(state, 'SINGLE');
    
    expect(nextState.score).toBe(1);
    expect(nextState.outs).toBe(0);
    expect(nextState.runners[0]).not.toBeNull();
  });
});
