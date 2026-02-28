import React, { useState, useEffect } from 'react';
import { type GameState, type Player, type Result } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { Shop } from './shop.js';
import { Play, RotateCcw, ShoppingCart, Users } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [view, setView] = useState<'GAME' | 'SHOP'>('GAME');

  const initializeGame = () => {
    const bigBats = ABILITIES.BIG_BATS;
    const crutch = ABILITIES.CRUTCH;
    
    const initialPlayers: Player[] = [
      { id: '1', name: 'Speedy Gonzalez', stats: { contact: 80, power: 20, patience: 50, speed: 90 }, abilities: [] },
      { id: '2', name: 'Slugger Sam', stats: { contact: 40, power: 90, patience: 30, speed: 20 }, abilities: bigBats ? [bigBats] : [] },
      { id: '3', name: 'Steady Eddie', stats: { contact: 70, power: 50, patience: 80, speed: 50 }, abilities: crutch ? [crutch] : [] },
    ];

    let lineupBatters: Player[] = [];
    for (let i = 0; i < 9; i++) {
      const p = initialPlayers[i % initialPlayers.length];
      if (p) lineupBatters.push({ ...p });
    }

    setGameState({
      lineup: { batters: lineupBatters },
      inning: 1,
      outs: 0,
      score: 0,
      runners: [null, null, null],
      currentBatterIndex: 0,
    });
    setLog(['Game started!']);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const playPlateAppearance = () => {
    if (!gameState) return;

    const batter = gameState.lineup.batters[gameState.currentBatterIndex];
    if (!batter) return;

    const result = Engine.simulatePlateAppearance(batter);
    const nextState = Engine.processResult(gameState, result);

    setLog(prev => [`Inning ${gameState.inning}, Outs ${gameState.outs} | ${batter.name}: ${result}`, ...prev]);

    if (nextState.outs >= 3) {
      setLog(prev => [`--- End of Inning ${nextState.inning - 1} ---`, ...prev]);
      nextState.outs = 0;
      nextState.runners = [null, null, null];
      
      if (nextState.inning > 3) {
        setLog(prev => [`--- GAME OVER. Final Score: ${nextState.score} ---`, ...prev]);
      }
    }

    setGameState(nextState);
  };

  if (!gameState) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 font-mono">
      <header className="flex justify-between items-center mb-8 border-b border-zinc-700 pb-4">
        <h1 className="text-2xl font-bold text-red-500">BASEBALL BALATRO</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setView('GAME')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${view === 'GAME' ? 'bg-red-600' : 'bg-zinc-800'}`}
          >
            <Play size={18} /> Field
          </button>
          <button 
            onClick={() => setView('SHOP')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${view === 'SHOP' ? 'bg-red-600' : 'bg-zinc-800'}`}
          >
            <ShoppingCart size={18} /> Front Office
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Scoreboard & Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-zinc-800 p-6 rounded-lg border-2 border-zinc-700 shadow-xl">
            <h2 className="text-zinc-400 text-sm mb-2 uppercase tracking-widest">Scoreboard</h2>
            <div className="text-5xl font-black mb-4">{gameState.score}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">INNING</span>
                <div className="text-xl">{gameState.inning}</div>
              </div>
              <div>
                <span className="text-zinc-500">OUTS</span>
                <div className="text-xl">{'●'.repeat(gameState.outs)}{'○'.repeat(3-gameState.outs)}</div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <div className={`w-4 h-4 rounded-sm rotate-45 border ${gameState.runners[1] ? 'bg-yellow-400' : 'bg-zinc-900'}`} title="2nd Base" />
              <div className="flex gap-4 -mt-2">
                 <div className={`w-4 h-4 rounded-sm rotate-45 border ${gameState.runners[2] ? 'bg-yellow-400' : 'bg-zinc-900'}`} title="3rd Base" />
                 <div className={`w-4 h-4 rounded-sm rotate-45 border ${gameState.runners[0] ? 'bg-yellow-400' : 'bg-zinc-900'}`} title="1st Base" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
             <h2 className="text-zinc-400 text-sm mb-4 uppercase tracking-widest">At Bat</h2>
             <div className="text-xl font-bold">{gameState.lineup.batters[gameState.currentBatterIndex]?.name}</div>
             <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="bg-zinc-900 p-2 rounded">
                    <div className="text-xs text-zinc-500">CON</div>
                    <div>{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.contact}</div>
                </div>
                <div className="bg-zinc-900 p-2 rounded">
                    <div className="text-xs text-zinc-500">POW</div>
                    <div>{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.power}</div>
                </div>
                <div className="bg-zinc-900 p-2 rounded">
                    <div className="text-xs text-zinc-500">PAT</div>
                    <div>{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.patience}</div>
                </div>
                <div className="bg-zinc-900 p-2 rounded">
                    <div className="text-xs text-zinc-500">SPD</div>
                    <div>{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.speed}</div>
                </div>
             </div>
          </div>

          <button 
            disabled={gameState.inning > 3}
            onClick={playPlateAppearance}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 rounded-lg text-xl font-bold shadow-lg transform transition active:scale-95"
          >
            {gameState.inning > 3 ? 'GAME OVER' : 'PLAY BALL'}
          </button>
          
          {gameState.inning > 3 && (
             <button 
                onClick={initializeGame}
                className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center gap-2"
             >
                <RotateCcw size={16} /> New Game
             </button>
          )}
        </div>

        {/* Center/Right: View Specific Content */}
        <div className="md:col-span-2 space-y-6">
          {view === 'GAME' ? (
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 h-[600px] flex flex-col">
              <h2 className="text-zinc-400 text-sm mb-4 uppercase tracking-widest">Play Log</h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {log.map((entry, i) => (
                  <div key={i} className={`p-3 rounded ${entry.includes('End') ? 'bg-zinc-900 text-yellow-500 font-bold' : 'bg-zinc-700/50'}`}>
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 min-h-[600px]">
              <h2 className="text-zinc-400 text-sm mb-4 uppercase tracking-widest">Team Management</h2>
              <div className="grid grid-cols-1 gap-4">
                {gameState.lineup.batters.map((p, i) => (
                   <div key={i} className={`p-4 rounded border flex justify-between items-center ${i === gameState.currentBatterIndex ? 'border-red-500 bg-red-900/10' : 'border-zinc-700 bg-zinc-900'}`}>
                      <div>
                        <span className="text-zinc-500 mr-4 font-bold">{i + 1}</span>
                        <span className="font-bold">{p.name}</span>
                        <div className="text-xs text-zinc-400 flex gap-4 mt-1">
                           <span>CON: {p.stats.contact}</span>
                           <span>POW: {p.stats.power}</span>
                           <span>SPD: {p.stats.speed}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         {p.abilities.map((a, ai) => (
                            <div key={ai} className="px-2 py-1 bg-blue-900 text-[10px] rounded" title={a.description}>
                               {a.name}
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
