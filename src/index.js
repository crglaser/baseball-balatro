import {} from './types.js';
import { Engine } from './engine.js';
const players = [
    { id: '1', name: 'Speedy Gonzalez', stats: { contact: 80, power: 20, patience: 50, speed: 90 }, abilities: [] },
    { id: '2', name: 'Slugger Sam', stats: { contact: 40, power: 90, patience: 30, speed: 20 }, abilities: [] },
    { id: '3', name: 'Steady Eddie', stats: { contact: 70, power: 50, patience: 80, speed: 50 }, abilities: [] },
];
// Fill out a 9-man lineup with copies for testing
const lineupBatters = [];
for (let i = 0; i < 9; i++) {
    const p = players[i % players.length];
    if (p)
        lineupBatters.push(p);
}
let gameState = {
    lineup: { batters: lineupBatters },
    inning: 1,
    outs: 0,
    score: 0,
    runners: [null, null, null],
    currentBatterIndex: 0,
};
console.log('--- Baseball Balatro Simulation Start ---');
while (gameState.inning <= 1) {
    const batter = gameState.lineup.batters[gameState.currentBatterIndex];
    if (!batter)
        break;
    const result = Engine.simulatePlateAppearance(batter);
    console.log(`Inning ${gameState.inning}, Outs ${gameState.outs} | ${batter.name} hits a ${result}`);
    gameState = Engine.processResult(gameState, result);
    if (gameState.outs >= 3) {
        console.log(`--- End of Inning ${gameState.inning}. Score: ${gameState.score} ---`);
        gameState.inning++;
        gameState.outs = 0;
        gameState.runners = [null, null, null];
    }
}
console.log(`Final Score: ${gameState.score}`);
//# sourceMappingURL=index.js.map