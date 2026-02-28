import React, { useState, useEffect } from 'react';
import { type GameState, type Player } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [view, setView] = useState<'GAME' | 'SHOP'>('GAME');

  const initializeGame = () => {
    const bigBats = ABILITIES.BIG_BATS;
    const crutch = ABILITIES.CRUTCH;
    
    const initialPlayers: Player[] = [
      { id: '1', name: 'Speedy Gonzalez', stats: { contact: 80, power: 20, patience: 50, speed: 90 }, abilities: [], imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/1.svg' },
      { id: '2', name: 'Slugger Sam', stats: { contact: 40, power: 90, patience: 30, speed: 20 }, abilities: bigBats ? [bigBats] : [], imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/1.svg' },
      { id: '3', name: 'Steady Eddie', stats: { contact: 70, power: 50, patience: 80, speed: 50 }, abilities: crutch ? [crutch] : [], imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/1.svg' },
    ];

    let lineupBatters: Player[] = [];
    for (let i = 0; i < 9; i++) {
      const p = initialPlayers[i % initialPlayers.length];
      if (p) lineupBatters.push({ ...p, id: `p-${i}` });
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

    setLog(prev => [`${batter.name}: ${result}`, ...prev]);

    if (nextState.outs >= 3) {
      setLog(prev => [`End Inning ${nextState.inning - 1}`, ...prev]);
      nextState.outs = 0;
      nextState.runners = [null, null, null];
    }

    setGameState(nextState);
  };

  if (!gameState) return <div className="p-8">Loading...</div>;

  const currentBatter = gameState.lineup.batters[gameState.currentBatterIndex];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 font-sans selection:bg-red-500/30">
      {/* Top Bar / Scorebug */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-[#1e293b] p-4 rounded-2xl border border-white/10 shadow-2xl mb-8">
        <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Score</span>
                <span className="text-3xl font-black text-red-500 leading-none">{gameState.score}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Inning</span>
                <span className="text-xl font-bold leading-none">▲{gameState.inning}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Outs</span>
                <div className="flex gap-1.5 mt-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full border border-white/20 ${i < gameState.outs ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-900'}`} />
                    ))}
                </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="relative w-12 h-12 bg-slate-900 rounded rotate-45 border border-white/5 flex items-center justify-center">
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-colors ${gameState.runners[1] ? 'bg-yellow-400' : 'bg-slate-800'}`} title="2nd Base" />
                <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-colors ${gameState.runners[2] ? 'bg-yellow-400' : 'bg-slate-800'}`} title="3rd Base" />
                <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-colors ${gameState.runners[0] ? 'bg-yellow-400' : 'bg-slate-800'}`} title="1st Base" />
            </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setView('GAME')} className={`p-3 rounded-xl transition ${view === 'GAME' ? 'bg-red-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}><LayoutPanelLeft size={20}/></button>
          <button onClick={() => setView('SHOP')} className={`p-3 rounded-xl transition ${view === 'SHOP' ? 'bg-red-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}><ShoppingCart size={20}/></button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        {/* Play Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Lineup Cards */}
            <div className="flex justify-center items-end gap-2 h-64 overflow-hidden px-4">
                {gameState.lineup.batters.map((p, i) => {
                    const isUp = i === gameState.currentBatterIndex;
                    return (
                        <div 
                            key={p.id}
                            className={`
                                relative flex-shrink-0 transition-all duration-500 ease-out
                                ${isUp ? 'w-48 h-64 z-10 -translate-y-4' : 'w-24 h-32 opacity-40 hover:opacity-60'}
                                bg-gradient-to-br from-slate-700 to-slate-900
                                rounded-xl border-2 shadow-2xl flex flex-col items-center justify-between p-3
                                ${isUp ? 'border-red-500 ring-4 ring-red-500/20' : 'border-white/10'}
                            `}
                        >
                            <div className="text-[10px] font-black opacity-50 absolute top-2 left-3">#{i+1}</div>
                            <div className={`w-full aspect-square bg-slate-800 rounded-lg mb-2 overflow-hidden flex items-center justify-center p-2`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`} className="w-full h-full object-contain pixelated" alt={p.name} />
                            </div>
                            <div className="text-center w-full">
                                <div className={`font-bold truncate text-xs ${isUp ? 'text-lg' : ''}`}>{p.name}</div>
                                {isUp && (
                                    <div className="grid grid-cols-4 gap-1 mt-2">
                                        {Object.entries(p.stats).map(([k, v]) => (
                                            <div key={k} className="bg-black/30 rounded py-1 px-0.5">
                                                <div className="text-[8px] text-slate-400 uppercase leading-none">{k.slice(0,3)}</div>
                                                <div className="text-[10px] font-bold">{v}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Action Area */}
            <div className="flex flex-col items-center gap-6 py-8">
                <button 
                    disabled={gameState.inning > 3}
                    onClick={playPlateAppearance}
                    className="group relative px-12 py-5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 rounded-full text-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.3)] transition transform active:scale-95 disabled:shadow-none"
                >
                    <span className="relative flex items-center gap-3">
                        <Play fill="currentColor" size={24}/> Play Ball
                    </span>
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition duration-500" />
                </button>
                
                {gameState.inning > 3 && (
                    <button onClick={initializeGame} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                        <RotateCcw size={14}/> Restart Season
                    </button>
                )}
            </div>
        </div>

        {/* Sidebar Log */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-[600px] bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Play-by-Play</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {log.map((entry, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-3 rounded-xl border leading-snug animate-in slide-in-from-right-4 duration-300
                            ${entry.includes('End') ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 font-bold' : 'bg-slate-800/50 border-white/5 text-slate-300'}
                        `}
                    >
                        {entry}
                    </div>
                ))}
                {log.length === 0 && <div className="text-center text-slate-600 mt-20 italic">No events recorded</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
