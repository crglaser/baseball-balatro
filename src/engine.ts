import { Player, Result, GameState } from './types.js';
import { type AbilityContext } from './abilities.js';

export class Engine {
  static simulatePlateAppearance(player: Player): Result {
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
    // Deep clone state to avoid any mutations
    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const batter = nextState.lineup.batters[nextState.currentBatterIndex];
    
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
    }

    const oldScore = nextState.score;

    switch (result) {
      case 'WALK':
        this.advanceRunners(nextState, 1, true);
        break;
      case 'SINGLE':
        this.advanceRunners(nextState, 1, false);
        break;
      case 'DOUBLE':
        this.advanceRunners(nextState, 2, false);
        break;
      case 'TRIPLE':
        this.advanceRunners(nextState, 3, false);
        break;
      case 'HOME_RUN':
        this.advanceRunners(nextState, 4, false);
        break;
      case 'OUT':
      case 'STRIKEOUT':
        nextState.outs++;
        break;
    }

    if (nextState.score > oldScore) {
      nextState.score += bonusRuns;
    }

    nextState.currentBatterIndex = (nextState.currentBatterIndex + 1) % nextState.lineup.batters.length;
    
    return nextState;
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
