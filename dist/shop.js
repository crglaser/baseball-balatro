import {} from './types.js';
export class Shop {
    static generateFreeAgents(count) {
        const names = ['Bo Jackson', 'Deion Sanders', 'Babe Ruth', 'Ted Williams', 'Willie Mays', 'Hank Aaron', 'Ken Griffey Jr.'];
        const freeAgents = [];
        for (let i = 0; i < count; i++) {
            const name = names[Math.floor(Math.random() * names.length)] + ' ' + (i + 1);
            freeAgents.push({
                id: Math.random().toString(36).substr(2, 9),
                name: name,
                stats: {
                    contact: Math.floor(Math.random() * 60) + 20,
                    power: Math.floor(Math.random() * 60) + 20,
                    patience: Math.floor(Math.random() * 60) + 20,
                    speed: Math.floor(Math.random() * 60) + 20,
                },
                abilities: []
            });
        }
        return freeAgents;
    }
    static tradePlayer(lineup, indexToReplace, newPlayer) {
        const newLineup = [...lineup];
        newLineup[indexToReplace] = newPlayer;
        return newLineup;
    }
}
//# sourceMappingURL=shop.js.map