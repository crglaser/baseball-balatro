import {} from './types.js';
import { Engine } from './engine.js';
import { Shop } from './shop.js';
import { ABILITIES } from './abilities.js';
async function runGame() {
    const bigBats = ABILITIES.BIG_BATS;
    const crutch = ABILITIES.CRUTCH;
    if (!bigBats || !crutch)
        return;
    const initialPlayers = [
        { id: '1', name: 'Speedy Gonzalez', stats: { contact: 80, power: 20, patience: 50, speed: 90 }, abilities: [] },
        { id: '2', name: 'Slugger Sam', stats: { contact: 40, power: 90, patience: 30, speed: 20 }, abilities: [bigBats] },
        { id: '3', name: 'Steady Eddie', stats: { contact: 70, power: 50, patience: 80, speed: 50 }, abilities: [crutch] },
    ];
    let lineupBatters = [];
    for (let i = 0; i < 9; i++) {
        const p = initialPlayers[i % initialPlayers.length];
        if (p)
            lineupBatters.push({ ...p });
    }
    for (let season = 1; season <= 3; season++) {
        console.log(`\n=== SEASON ${season} ===`);
        let gameState = {
            lineup: { batters: lineupBatters },
            inning: 1,
            outs: 0,
            score: 0,
            runners: [null, null, null],
            currentBatterIndex: 0,
        };
        // Simulate 3 innings per game
        while (gameState.inning <= 3) {
            const batter = gameState.lineup.batters[gameState.currentBatterIndex];
            if (!batter)
                break;
            const result = Engine.simulatePlateAppearance(batter);
            gameState = Engine.processResult(gameState, result);
            if (gameState.outs >= 3) {
                gameState.inning++;
                gameState.outs = 0;
                gameState.runners = [null, null, null];
            }
        }
        console.log(`Season ${season} Final Score: ${gameState.score}`);
        // Free Agency Phase
        console.log(`\n--- Free Agency Phase ---`);
        const freeAgents = Shop.generateFreeAgents(3);
        console.log(`Free Agents available: ${freeAgents.map(f => f.name).join(', ')}`);
        // Auto-trade: replace the first player with the best free agent (highest contact + power)
        const bestFA = [...freeAgents].sort((a, b) => (b.stats.contact + b.stats.power) - (a.stats.contact + a.stats.power))[0];
        if (bestFA) {
            console.log(`Trading for ${bestFA.name} (Contact: ${bestFA.stats.contact}, Power: ${bestFA.stats.power})`);
            lineupBatters = Shop.tradePlayer(lineupBatters, season % 9, bestFA);
        }
    }
    console.log(`\n=== Final Lineup ===`);
    lineupBatters.forEach((p, i) => console.log(`${i + 1}. ${p.name} - C:${p.stats.contact} P:${p.stats.power}`));
}
runGame();
//# sourceMappingURL=index.js.map