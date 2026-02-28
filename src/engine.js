import {} from './types.js';
export class Engine {
    static simulatePlateAppearance(player) {
        const rand = Math.random() * 100;
        // Very basic probability model
        // patience: 10% walk at 50 patience
        const walkChance = player.stats.patience / 5;
        if (rand < walkChance)
            return 'WALK';
        // contact: 20% strikeout at 0 contact, 5% at 100 contact
        const strikeoutChance = 20 - (player.stats.contact / 20);
        if (rand < walkChance + strikeoutChance)
            return 'STRIKEOUT';
        // Rest of outcomes are contact-based
        const hitChance = 20 + (player.stats.contact / 4);
        if (rand < walkChance + strikeoutChance + hitChance) {
            const hitRand = Math.random() * 100;
            // Power determines extra base hits
            const hrChance = player.stats.power / 5;
            const tripleChance = player.stats.speed / 10;
            const doubleChance = player.stats.power / 4;
            if (hitRand < hrChance)
                return 'HOME_RUN';
            if (hitRand < hrChance + tripleChance)
                return 'TRIPLE';
            if (hitRand < hrChance + tripleChance + doubleChance)
                return 'DOUBLE';
            return 'SINGLE';
        }
        return 'OUT';
    }
    static processResult(state, result) {
        const newState = { ...state, runners: [...state.runners] };
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
        newState.currentBatterIndex = (newState.currentBatterIndex + 1) % newState.lineup.batters.length;
        return newState;
    }
    static advanceRunners(state, bases, isWalk) {
        const batter = state.lineup.batters[state.currentBatterIndex];
        if (!batter)
            return;
        if (isWalk) {
            // Simple forced advancement logic for walks
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
        }
        else {
            // Hits: runners advance by bases (simplified: always advance fixed number of bases)
            for (let i = 2; i >= 0; i--) {
                const runner = state.runners[i];
                if (runner) {
                    if (i + bases >= 3) {
                        state.score++;
                    }
                    else {
                        state.runners[i + bases] = runner;
                    }
                    state.runners[i] = null;
                }
            }
            if (bases >= 4) {
                state.score++;
            }
            else {
                state.runners[bases - 1] = batter;
            }
        }
    }
}
//# sourceMappingURL=engine.js.map