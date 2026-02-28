import React, { useState, useEffect } from 'react';
import { type GameState, type Player } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw, FastForward } from 'lucide-react';

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
    if (!gameState || gameState.inning > 3) return;
    
    const batter = gameState.lineup.batters[gameState.currentBatterIndex];
    if (!batter) return;

    const result = Engine.simulatePlateAppearance(batter);
    const nextState = Engine.processResult(gameState, result);

    const newLogs = [`${batter.name}: ${result}`];
    
    if (nextState.inning > gameState.inning) {
        newLogs.unshift(`--- End Inning ${gameState.inning} ---`);
        if (nextState.inning > 3) {
            newLogs.unshift(`--- GAME OVER. Final Score: ${nextState.score} ---`);
        }
    }

    setLog(prev => [...newLogs, ...prev]);
    setGameState(nextState);
  };

  const simulateInning = () => {
    if (!gameState || gameState.inning > 3) return;
    const startInning = gameState.inning;
    let currentState = { ...gameState };
    const newLogs: string[] = [];
    
    while (currentState.inning === startInning) {
        const batter = currentState.lineup.batters[currentState.currentBatterIndex];
        if (!batter) break;
        const result = Engine.simulatePlateAppearance(batter);
        currentState = Engine.processResult(currentState, result);
        newLogs.unshift(`${batter.name}: ${result}`);
    }
    
    newLogs.unshift(`--- End Inning ${startInning} ---`);
    if (currentState.inning > 3) {
        newLogs.unshift(`--- GAME OVER. Final Score: ${currentState.score} ---`);
    }
    
    setLog(prev => [...newLogs, ...prev]);
    setGameState(currentState);
  };

  if (!gameState) return <div className="p-8 text-white font-mono">Loading simulation...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 font-sans selection:bg-red-500/30">
      {/* Top Bar / Scorebug */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-[#1e293b] p-4 rounded-2xl border border-white/10 shadow-2xl mb-8">
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Score</span>
                <span className="text-3xl font-black text-red-500 leading-none">{gameState.score}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Inning</span>
                <span className="text-xl font-bold leading-none">▲{Math.min(gameState.inning, 3)}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Outs</span>
                <div className="flex gap-1.5 mt-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full border border-white/20 ${i < gameState.outs ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-900'}`} />
                    ))}
                </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="relative w-12 h-12 bg-slate-900 rounded rotate-45 border border-white/5 flex items-center justify-center">
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-colors ${gameState.runners[1] ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-slate-800'}`} title="2nd Base" />
                <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-colors ${gameState.runners[2] ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-slate-800'}`} title="3rd Base" />
                <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-colors ${gameState.runners[0] ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-slate-800'}`} title="1st Base" />
            </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setView('GAME')} className={`p-3 rounded-xl transition ${view === 'GAME' ? 'bg-red-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}><LayoutPanelLeft size={20}/></button>
          <button onClick={() => setView('SHOP')} className={`p-3 rounded-xl transition ${view === 'SHOP' ? 'bg-red-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}><ShoppingCart size={20}/></button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        {/* Play Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8 text-center">
            {/* Lineup Cards */}
            <div className="flex justify-center items-center gap-3 h-72 overflow-x-auto px-4 py-4 scrollbar-hide">
                {gameState.lineup.batters.map((p, i) => {
                    const isUp = i === gameState.currentBatterIndex;
                    return (
                        <div 
                            key={p.id}
                            className={`
                                relative flex-shrink-0 transition-all duration-300 ease-out
                                w-32 h-48 bg-gradient-to-br from-slate-700 to-slate-900
                                rounded-xl border-2 shadow-2xl flex flex-col items-center justify-between p-3
                                ${isUp ? 'border-red-500 ring-4 ring-red-500/30 scale-110 -translate-y-2 z-10' : 'border-white/10 opacity-60'}
                            `}
                        >
                            <div className="text-[10px] font-black opacity-30 absolute top-2 left-2 italic">#{i+1}</div>
                            <div className={`w-full aspect-square bg-slate-800/50 rounded-lg mb-2 overflow-hidden flex items-center justify-center p-2`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`} className="w-full h-full object-contain pixelated" alt={p.name} />
                            </div>
                            <div className="text-center w-full">
                                <div className={`font-black truncate text-[10px] uppercase tracking-tighter ${isUp ? 'text-red-400' : 'text-slate-300'}`}>{p.name}</div>
                                {isUp && (
                                    <div className="grid grid-cols-2 gap-1 mt-1 font-mono">
                                        <div className="bg-black/40 rounded py-0.5">
                                            <div className="text-[6px] text-slate-500 uppercase leading-none font-bold">CON</div>
                                            <div className="text-[10px] font-black">{p.stats.contact}</div>
                                        </div>
                                        <div className="bg-black/40 rounded py-0.5">
                                            <div className="text-[6px] text-slate-500 uppercase leading-none font-bold">POW</div>
                                            <div className="text-[10px] font-black">{p.stats.power}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Action Area */}
            <div className="flex flex-col items-center gap-6 py-4">
                <div className="flex gap-4">
                    <button 
                        disabled={gameState.inning > 3}
                        onClick={playPlateAppearance}
                        className="group relative px-10 py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 rounded-2xl text-xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(239,68,68,0.2)] transition transform active:scale-95 disabled:shadow-none"
                    >
                        <span className="relative flex items-center gap-3">
                            <Play fill="currentColor" size={20}/> Play Ball
                        </span>
                    </button>

                    <button 
                        disabled={gameState.inning > 3}
                        onClick={simulateInning}
                        className="group px-6 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition transform active:scale-95 flex items-center gap-2"
                        title="Simulate until 3 outs"
                    >
                        <FastForward size={18}/> Sim Inning
                    </button>
                </div>
                
                {gameState.inning > 3 && (
                    <button onClick={initializeGame} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition">
                        <RotateCcw size={12}/> Restart Season
                    </button>
                )}
            </div>
        </div>

        {/* Sidebar Log */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-[550px] bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-inner">
            <div className="p-4 border-b border-white/5 bg-[#1e293b]/50 backdrop-blur-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Play-by-Play
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 font-mono">
                {log.map((entry, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-3 rounded-xl border leading-snug animate-in slide-in-from-right-4 duration-300 text-sm
                            ${entry.includes('End') || entry.includes('GAME OVER') ? 'bg-red-500/10 border-red-500/20 text-red-400 font-black italic' : 'bg-slate-800/40 border-white/5 text-slate-400'}
                        `}
                    >
                        {entry}
                    </div>
                ))}
                {log.length === 0 && <div className="text-center text-slate-700 mt-20 text-xs italic">Awaiting first pitch...</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
