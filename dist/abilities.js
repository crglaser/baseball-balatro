import {} from './types.js';
export const ABILITIES = {
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
//# sourceMappingURL=abilities.js.map