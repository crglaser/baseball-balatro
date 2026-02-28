import { type Player } from './types.js';

export class Shop {
  static generateFreeAgents(count: number): Player[] {
    const names = ['Bo Jackson', 'Deion Sanders', 'Babe Ruth', 'Ted Williams', 'Willie Mays', 'Hank Aaron', 'Ken Griffey Jr.'];
    const freeAgents: Player[] = [];

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

  static tradePlayer(lineup: Player[], indexToReplace: number, newPlayer: Player): Player[] {
    const newLineup = [...lineup];
    newLineup[indexToReplace] = newPlayer;
    return newLineup;
  }
}
