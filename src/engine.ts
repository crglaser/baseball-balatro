import { type Player, type Result, type GameState } from './types.js';
import { type AbilityContext } from './abilities.js';

export class Engine {
  static simulatePlateAppearance(player: Player): Result {
    // Apply PRE_SWING abilities
    let tempPlayer = JSON.parse(JSON.stringify(player));
    let ctx: AbilityContext = {
      player: tempPlayer,
      scoreMultiplier: 1,
      flatBonus: 0,
      stage: 'PRE_SWING'
    };

    player.abilities.forEach(ability => {
      ctx = ability.effect(ctx);
    });

    const stats = ctx.player.stats;
    const rand = Math.random() * 100;

    const walkChance = stats.patience / 5; 
    if (rand < walkChance) return 'WALK';

    const strikeoutChance = 20 - (stats.contact / 20);
    if (rand < walkChance + strikeoutChance) return 'STRIKEOUT';

    const hitChance = 20 + (stats.contact / 4);
    if (rand < walkChance + strikeoutChance + hitChance) {
      const hitRand = Math.random() * 100;
      const hrChance = stats.power / 5;
      const tripleChance = stats.speed / 10;
      const doubleChance = stats.power / 4;

      if (hitRand < hrChance) return 'HOME_RUN';
      if (hitRand < hrChance + tripleChance) return 'TRIPLE';
      if (hitRand < hrChance + tripleChance + doubleChance) return 'DOUBLE';
      return 'SINGLE';
    }

    return 'OUT';
  }

  static processResult(state: GameState, result: Result): GameState {
    const newState = { ...state, runners: [...state.runners] };
    const batter = state.lineup.batters[state.currentBatterIndex];
    
    // Calculate bonus from POST_SWING abilities
    let bonusRuns = 0;
    if (batter) {
      let ctx: AbilityContext = {
        player: batter,
        result: result,
        scoreMultiplier: 1,
        flatBonus: 0,
        stage: 'POST_SWING'
      };
      batter.abilities.forEach(ability => {
        ctx = ability.effect(ctx);
      });
      bonusRuns = ctx.flatBonus;
      // Multiplier logic could be added here too
    }

    const oldScore = newState.score;

    switch (result) {
      case 'WALK':
        this.advanceRunners(newState, 1, true);
        break;
      case 'SINGLE':
        this.advanceRunners(newState, 1, false);
        break;
      case 'DOUBLE':
        this.advanceRunners(newState, 2, false);
        break;
      case 'TRIPLE':
        this.advanceRunners(newState, 3, false);
        break;
      case 'HOME_RUN':
        this.advanceRunners(newState, 4, false);
        break;
      case 'OUT':
      case 'STRIKEOUT':
        newState.outs++;
        break;
    }

    if (newState.score > oldScore) {
      newState.score += bonusRuns;
    }

    newState.currentBatterIndex = (newState.currentBatterIndex + 1) % newState.lineup.batters.length;
    return newState;
  }

  private static advanceRunners(state: GameState, bases: number, isWalk: boolean) {
    const batter = state.lineup.batters[state.currentBatterIndex];
    if (!batter) return;

    if (isWalk) {
        if (state.runners[0]) {
            if (state.runners[1]) {
                if (state.runners[2]) {
                    state.score++;
                }
                state.runners[2] = state.runners[1];
            }
            state.runners[1] = state.runners[0];
        }
        state.runners[0] = batter;
    } else {
        for (let i = 2; i >= 0; i--) {
            const runner = state.runners[i];
            if (runner) {
                if (i + bases >= 3) {
                    state.score++;
                } else {
                    state.runners[i + bases] = runner;
                }
                state.runners[i] = null;
            }
        }
        if (bases >= 4) {
            state.score++;
        } else {
            state.runners[bases - 1] = batter;
        }
    }
  }
}
