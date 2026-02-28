import React, { useState, useEffect } from 'react';
import { type GameState, type Player } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw, FastForward, ChevronRight, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [view, setView] = useState<'GAME' | 'SHOP'>('GAME');
  const [overlay, setOverlay] = useState<'NEXT_INNING' | 'GAME_OVER' | null>(null);

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
      if (p) lineupBatters.push({ ...p, id: `p-${i}-${Math.random()}` });
    }

    setGameState({
      lineup: { batters: lineupBatters },
      inning: 1,
      outs: 0,
      score: 0,
      runners: [null, null, null],
      currentBatterIndex: 0,
    });
    setLog(['Season Opener started!']);
    setOverlay(null);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const playPlateAppearance = () => {
    if (!gameState || overlay || gameState.inning > 3) return;
    
    const batter = gameState.lineup.batters[gameState.currentBatterIndex];
    if (!batter) return;

    const result = Engine.simulatePlateAppearance(batter);
    const nextState = Engine.processResult(gameState, result);

    const eventLog = `${batter.name}: ${result}`;
    const newLogs = [eventLog];
    
    if (nextState.inning > gameState.inning) {
        newLogs.unshift(`--- End Inning ${gameState.inning} ---`);
        if (nextState.inning > 3) {
            setOverlay('GAME_OVER');
        } else {
            setOverlay('NEXT_INNING');
        }
    }

    setLog(prev => [...newLogs, ...prev]);
    setGameState(nextState);
  };

  const simulateInning = () => {
    if (!gameState || overlay || gameState.inning > 3) return;
    
    let currentState = { ...gameState };
    const startInning = currentState.inning;
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
        setOverlay('GAME_OVER');
    } else {
        setOverlay('NEXT_INNING');
    }
    
    setLog(prev => [...newLogs, ...prev]);
    setGameState(currentState);
  };

  if (!gameState) return <div className="p-8 text-white font-mono">Loading stadium...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans selection:bg-red-500/30 overflow-hidden flex flex-col">
      {/* Top Bar / Scorebug */}
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center bg-[#1e293b]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl mb-8 z-20">
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Score</span>
                <span className="text-3xl font-black text-red-500 leading-none">{gameState.score}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Inning</span>
                <span className="text-xl font-bold leading-none">▲{Math.min(gameState.inning, 3)}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Outs</span>
                <div className="flex gap-1.5 mt-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full border border-white/20 transition-all duration-300 ${i < gameState.outs ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110' : 'bg-slate-900'}`} />
                    ))}
                </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="relative w-12 h-12 bg-slate-900 rounded rotate-45 border border-white/5 flex items-center justify-center shadow-inner">
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-all duration-300 ${gameState.runners[1] ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] scale-110' : 'bg-slate-800'}`} title="2nd Base" />
                <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-all duration-300 ${gameState.runners[2] ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] scale-110' : 'bg-slate-800'}`} title="3rd Base" />
                <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-4 h-4 rounded-sm border border-white/20 -rotate-45 transition-all duration-300 ${gameState.runners[0] ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] scale-110' : 'bg-slate-800'}`} title="1st Base" />
            </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setView('GAME')} className={`p-3 rounded-xl transition ${view === 'GAME' ? 'bg-red-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}><LayoutPanelLeft size={20}/></button>
          <button onClick={() => setView('SHOP')} className={`p-3 rounded-xl transition ${view === 'SHOP' ? 'bg-red-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}><ShoppingCart size={20}/></button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-8 flex-1 overflow-hidden relative">
        {/* Overlay Screens */}
        {overlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md animate-in fade-in duration-300 p-6 rounded-3xl">
                <div className="text-center max-w-sm space-y-8 animate-in zoom-in-95 duration-500">
                    {overlay === 'NEXT_INNING' ? (
                        <>
                            <div className="space-y-2">
                                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">End of Inning</h2>
                                <div className="text-6xl font-black text-white italic">INNING {gameState.inning - 1}</div>
                            </div>
                            <div className="flex justify-center items-center gap-4 text-2xl font-bold bg-white/5 p-6 rounded-2xl border border-white/10">
                                <span>Runs Scored</span>
                                <span className="text-red-500 text-4xl">{gameState.score}</span>
                            </div>
                            <button 
                                onClick={() => setOverlay(null)}
                                className="w-full flex items-center justify-center gap-3 py-6 bg-red-600 hover:bg-red-500 rounded-2xl text-2xl font-black uppercase tracking-widest transition transform active:scale-95 shadow-2xl"
                            >
                                Continue <ChevronRight size={32} />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center">
                                <div className="p-6 bg-yellow-500/20 rounded-full border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                                    <Trophy size={80} className="text-yellow-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Season Result</h2>
                                <div className="text-6xl font-black text-white">FINAL SCORE: {gameState.score}</div>
                            </div>
                            <button 
                                onClick={initializeGame}
                                className="w-full flex items-center justify-center gap-3 py-6 bg-white hover:bg-slate-200 text-[#020617] rounded-2xl text-2xl font-black uppercase tracking-widest transition transform active:scale-95 shadow-2xl"
                            >
                                <RotateCcw size={28} /> New Season
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* Play Area */}
        <div className="col-span-12 lg:col-span-8 flex flex-col justify-center gap-12">
            {/* Lineup Cards */}
            <div className="flex justify-center items-center gap-3 h-80 overflow-x-auto px-10 py-6 scrollbar-hide">
                {gameState.lineup.batters.map((p, i) => {
                    const isUp = i === gameState.currentBatterIndex;
                    return (
                        <div 
                            key={p.id}
                            className={`
                                relative flex-shrink-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                                w-36 h-56 bg-gradient-to-br from-slate-800 to-slate-950
                                rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-between p-4
                                ${isUp ? 'border-red-500 ring-8 ring-red-500/20 scale-125 z-10' : 'border-white/5 opacity-40'}
                            `}
                        >
                            <div className="text-[10px] font-black opacity-20 absolute top-2 right-3 italic">#{i+1}</div>
                            <div className={`w-full aspect-square bg-white/5 rounded-xl mb-2 overflow-hidden flex items-center justify-center p-2`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`} className="w-full h-full object-contain pixelated" alt={p.name} />
                            </div>
                            <div className="text-center w-full">
                                <div className={`font-black truncate text-[11px] uppercase tracking-tighter ${isUp ? 'text-red-400' : 'text-slate-500'}`}>{p.name}</div>
                                {isUp && (
                                    <div className="grid grid-cols-2 gap-1.5 mt-2 font-mono">
                                        <div className="bg-black/60 rounded py-1 border border-white/5">
                                            <div className="text-[6px] text-slate-500 uppercase leading-none font-bold">CON</div>
                                            <div className="text-[11px] font-black">{p.stats.contact}</div>
                                        </div>
                                        <div className="bg-black/60 rounded py-1 border border-white/5">
                                            <div className="text-[6px] text-slate-500 uppercase leading-none font-bold">POW</div>
                                            <div className="text-[11px] font-black">{p.stats.power}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Action Area */}
            <div className="flex flex-col items-center gap-8">
                <div className="flex gap-6">
                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={playPlateAppearance}
                        className="group relative px-12 py-5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-3xl text-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(239,68,68,0.3)] transition transform active:scale-95 disabled:shadow-none"
                    >
                        <span className="relative flex items-center gap-3">
                            <Play fill="currentColor" size={24}/> Play Ball
                        </span>
                    </button>

                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={simulateInning}
                        className="group px-8 py-5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-700 rounded-3xl text-xs font-black uppercase tracking-widest transition transform active:scale-95 flex items-center gap-2 border border-white/10"
                        title="Simulate until 3 outs"
                    >
                        <FastForward size={22}/> Sim Inning
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar Log */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-slate-950/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-4">
            <div className="p-5 border-b border-white/5 bg-[#1e293b]/30 backdrop-blur-md">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> 
                    Live Coverage
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide font-mono">
                {log.map((entry, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-4 rounded-2xl border leading-relaxed animate-in slide-in-from-right-8 duration-500 text-sm
                            ${entry.includes('End') || entry.includes('GAME OVER') ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 font-black italic text-center' : 'bg-white/5 border-white/5 text-slate-400'}
                        `}
                    >
                        {entry}
                    </div>
                ))}
                {log.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4">
                        <Play size={40} />
                        <span className="text-xs uppercase font-bold tracking-widest">Standing By...</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
