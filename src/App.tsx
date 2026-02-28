import React, { useState, useEffect } from 'react';
import { type GameState, type Player } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw, FastForward, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [view, setView] = useState<'GAME' | 'SHOP'>('GAME');
  const [overlay, setOverlay] = useState<'GAME_OVER' | null>(null);

  const initializeGame = () => {
    const bigBats = ABILITIES.BIG_BATS;
    const crutch = ABILITIES.CRUTCH;
    
    const names = ['Speedy Gonzalez', 'Slugger Sam', 'Steady Eddie', 'Bo Jackson', 'Deion Sanders', 'Babe Ruth', 'Ted Williams', 'Willie Mays', 'Hank Aaron'];
    const lineupBatters: Player[] = names.map((name, i) => ({
      id: `p-${i}-${Math.random()}`,
      name,
      stats: {
        contact: 40 + Math.floor(Math.random() * 40),
        power: 40 + Math.floor(Math.random() * 40),
        patience: 40 + Math.floor(Math.random() * 40),
        speed: 40 + Math.floor(Math.random() * 40),
      },
      abilities: i === 1 && bigBats ? [bigBats] : (i === 2 && crutch ? [crutch] : []),
    }));

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
    let nextState = Engine.processResult(gameState, result);

    const eventLog = `${batter.name}: ${result}`;
    const newLogs = [eventLog];
    
    if (nextState.outs >= 3) {
        newLogs.unshift(`--- End Inning ${gameState.inning} ---`);
        if (gameState.inning >= 3) {
            setOverlay('GAME_OVER');
        } else {
            nextState.inning += 1;
            nextState.outs = 0;
            nextState.runners = [null, null, null];
        }
    }

    setLog(prev => [...newLogs, ...prev]);
    setGameState(nextState);
  };

  const simulateInning = () => {
    if (!gameState || overlay || gameState.inning > 3) return;
    
    let currentState = JSON.parse(JSON.stringify(gameState));
    const startInning = currentState.inning;
    const newLogs: string[] = [];
    
    while (currentState.outs < 3) {
        const batter = currentState.lineup.batters[currentState.currentBatterIndex];
        if (!batter) break;
        const result = Engine.simulatePlateAppearance(batter);
        currentState = Engine.processResult(currentState, result);
        newLogs.unshift(`${batter.name}: ${result}`);
    }
    
    newLogs.unshift(`--- End Inning ${startInning} ---`);
    
    if (startInning >= 3) {
        setOverlay('GAME_OVER');
    } else {
        currentState.inning += 1;
        currentState.outs = 0;
        currentState.runners = [null, null, null];
    }
    
    setLog(prev => [...newLogs, ...prev]);
    setGameState(currentState);
  };

  if (!gameState) return <div className="p-8 text-white font-mono">Loading stadium...</div>;

  const currentBatter = gameState.lineup.batters[gameState.currentBatterIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-500/30 overflow-hidden flex flex-col items-center">
      
      {/* SNY Style Scorebug */}
      <div className="mt-8 flex bg-black border-2 border-zinc-800 rounded shadow-2xl overflow-hidden font-mono h-14">
          {/* Logo/Station */}
          <div className="bg-[#1a1a1a] px-4 flex items-center justify-center border-r border-zinc-800">
              <span className="text-[#00aff0] font-black text-xl italic tracking-tighter">SNY</span>
          </div>
          
          {/* Team and Score */}
          <div className="flex bg-[#0f172a] px-4 items-center gap-3 border-r border-zinc-800 min-w-32">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-sm" />
                <span className="font-bold text-lg">METS</span>
              </div>
              <span className="text-2xl font-black ml-auto">{gameState.score}</span>
          </div>

          {/* Opponent (Static for now) */}
          <div className="flex bg-[#1e1e1e] px-4 items-center gap-3 border-r border-zinc-800 min-w-32">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-sm" />
                <span className="font-bold text-lg opacity-60 uppercase">Opp</span>
              </div>
              <span className="text-2xl font-black ml-auto opacity-40">0</span>
          </div>

          {/* Inning */}
          <div className="flex flex-col justify-center px-4 border-r border-zinc-800 bg-[#0a0a0a] min-w-16 items-center">
              <span className="text-xs font-bold leading-none mb-1">▲{Math.min(gameState.inning, 3)}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase leading-none">INN</span>
          </div>

          {/* Diamond / Base Runners */}
          <div className="bg-[#0a0a0a] px-6 flex items-center justify-center border-r border-zinc-800">
              <div className="relative w-8 h-8 rotate-45 border border-zinc-800 flex items-center justify-center bg-zinc-900/50">
                  <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 -rotate-45 border border-black/40 transition-colors duration-200 ${gameState.runners[1] ? 'bg-[#ffc629] shadow-[0_0_8px_#ffc629]' : 'bg-zinc-800'}`} />
                  <div className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 -rotate-45 border border-black/40 transition-colors duration-200 ${gameState.runners[2] ? 'bg-[#ffc629] shadow-[0_0_8px_#ffc629]' : 'bg-zinc-800'}`} />
                  <div className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 -rotate-45 border border-black/40 transition-colors duration-200 ${gameState.runners[0] ? 'bg-[#ffc629] shadow-[0_0_8px_#ffc629]' : 'bg-zinc-800'}`} />
              </div>
          </div>

          {/* Outs */}
          <div className="flex bg-[#0a0a0a] px-4 items-center gap-2 border-r border-zinc-800 min-w-20">
              <span className="text-xs font-bold text-zinc-500 uppercase">Out</span>
              <div className="flex gap-1.5">
                  {[...Array(2)].map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full border border-black transition-colors duration-200 ${i < gameState.outs ? 'bg-red-500' : 'bg-zinc-800'}`} />
                  ))}
              </div>
          </div>

          {/* Pitch Count / Stats */}
          <div className="flex bg-[#0a0a0a] px-4 items-center text-xs font-bold min-w-24">
              <span className="text-zinc-500 mr-2 uppercase">Order</span>
              <span>{gameState.currentBatterIndex + 1}-9</span>
          </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-8 flex-1 overflow-hidden relative p-8">
        {/* Overlay Screens */}
        {overlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 rounded-3xl">
                <div className="text-center max-w-sm space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="flex justify-center">
                        <div className="p-6 bg-yellow-500/10 rounded-full border-2 border-yellow-500/30">
                            <Trophy size={80} className="text-yellow-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none">Season Result</h2>
                        <div className="text-6xl font-black text-white italic">FINAL: {gameState.score}</div>
                    </div>
                    <button 
                        onClick={initializeGame}
                        className="w-full flex items-center justify-center gap-3 py-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-2xl font-black uppercase tracking-widest transition transform active:scale-95 shadow-2xl"
                    >
                        <RotateCcw size={28} /> New Season
                    </button>
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
                                w-36 h-56 bg-zinc-900 border-2 shadow-2xl flex flex-col items-center justify-between p-4 rounded-xl
                                ${isUp ? 'border-red-600 ring-8 ring-red-600/10 scale-125 z-10' : 'border-zinc-800 opacity-30'}
                            `}
                        >
                            <div className="text-[10px] font-bold opacity-30 absolute top-2 right-3">#{i+1}</div>
                            <div className={`w-full aspect-square bg-black/40 rounded-lg mb-2 overflow-hidden flex items-center justify-center p-2`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`} className="w-full h-full object-contain pixelated" alt={p.name} />
                            </div>
                            <div className="text-center w-full">
                                <div className={`font-black truncate text-[11px] uppercase tracking-tighter ${isUp ? 'text-red-500' : 'text-zinc-500'}`}>{p.name}</div>
                                {isUp && (
                                    <div className="grid grid-cols-2 gap-1.5 mt-2 font-mono">
                                        <div className="bg-black rounded py-1 border border-zinc-800">
                                            <div className="text-[6px] text-zinc-600 uppercase leading-none font-bold">CON</div>
                                            <div className="text-[11px] font-black">{p.stats.contact}</div>
                                        </div>
                                        <div className="bg-black rounded py-1 border border-zinc-800">
                                            <div className="text-[6px] text-zinc-600 uppercase leading-none font-bold">POW</div>
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
                        className="group relative px-12 py-5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-900 disabled:text-zinc-700 rounded text-2xl font-black uppercase tracking-widest shadow-xl transition transform active:scale-95"
                    >
                        <span className="relative flex items-center gap-3 italic">
                            <Play fill="currentColor" size={24}/> Next Pitch
                        </span>
                    </button>

                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={simulateInning}
                        className="group px-8 py-5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-800 rounded text-xs font-black uppercase tracking-widest transition transform active:scale-95 flex items-center gap-2 border border-zinc-700"
                    >
                        <FastForward size={22}/> End Inning
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar Log */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-black rounded border-2 border-zinc-900 overflow-hidden shadow-2xl mb-4">
            <div className="p-4 border-b-2 border-zinc-900 bg-zinc-900/50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> 
                    Live Coverage
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2 font-mono">
                {log.map((entry, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-3 border-b border-zinc-900 leading-snug animate-in slide-in-from-right-4 duration-300 text-sm
                            ${entry.includes('End') || entry.includes('GAME OVER') ? 'text-orange-500 font-black italic' : 'text-zinc-400'}
                        `}
                    >
                        {entry}
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Navigation Footer */}
      <div className="w-full max-w-6xl flex justify-center gap-8 py-4 border-t border-zinc-900 mb-4">
          <button onClick={() => setView('GAME')} className={`flex items-center gap-2 px-6 py-2 rounded font-black text-xs uppercase tracking-widest transition ${view === 'GAME' ? 'bg-red-600 text-white' : 'hover:bg-zinc-900 text-zinc-500'}`}>
            <LayoutPanelLeft size={16}/> Field
          </button>
          <button onClick={() => setView('SHOP')} className={`flex items-center gap-2 px-6 py-2 rounded font-black text-xs uppercase tracking-widest transition ${view === 'SHOP' ? 'bg-red-600 text-white' : 'hover:bg-zinc-900 text-zinc-500'}`}>
            <ShoppingCart size={16}/> Office
          </button>
      </div>
    </div>
  );
};

export default App;
