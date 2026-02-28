import React, { useState, useEffect, useRef } from 'react';
import { type GameState, type Player, type Result } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw, FastForward, Trophy, Info } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [log, setLog] = useState<{msg: string, type: 'HIT' | 'OUT' | 'WALK' | 'META'}[]>([]);
  const [view, setView] = useState<'GAME' | 'SHOP'>('GAME');
  const [overlay, setOverlay] = useState<'GAME_OVER' | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

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
    setLog([{msg: '🏟️ Welcome to the Stadium! Season Opener is underway.', type: 'META'}]);
    setOverlay(null);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const getLogType = (res: Result): 'HIT' | 'OUT' | 'WALK' => {
      if (res === 'WALK') return 'WALK';
      if (['SINGLE', 'DOUBLE', 'TRIPLE', 'HOME_RUN'].includes(res)) return 'HIT';
      return 'OUT';
  };

  const playPlateAppearance = () => {
    if (!gameState || overlay || gameState.inning > 3) return;
    
    const batter = gameState.lineup.batters[gameState.currentBatterIndex];
    if (!batter) return;

    const result = Engine.simulatePlateAppearance(batter);
    let nextState = Engine.processResult(gameState, result);

    const msg = `${batter.name} ${result === 'HOME_RUN' ? 'CRUSHES A HOME RUN!' : result === 'STRIKEOUT' ? 'strikes out looking.' : `hits a ${result.toLowerCase()}.`}`;
    const newLogs: {msg: string, type: any}[] = [{msg, type: getLogType(result)}];
    
    if (nextState.outs >= 3) {
        newLogs.push({msg: `🏁 End Inning ${gameState.inning}. Total Score: ${nextState.score}`, type: 'META'});
        if (gameState.inning >= 3) {
            setOverlay('GAME_OVER');
        } else {
            nextState.inning += 1;
            nextState.outs = 0;
            nextState.runners = [null, null, null];
        }
    }

    setLog(prev => [...prev, ...newLogs]);
    setGameState(nextState);
  };

  const simulateInning = () => {
    if (!gameState || overlay || gameState.inning > 3) return;
    
    let currentState = JSON.parse(JSON.stringify(gameState));
    const startInning = currentState.inning;
    const newLogs: {msg: string, type: any}[] = [];
    
    while (currentState.outs < 3) {
        const batter = currentState.lineup.batters[currentState.currentBatterIndex];
        if (!batter) break;
        const result = Engine.simulatePlateAppearance(batter);
        currentState = Engine.processResult(currentState, result);
        const msg = `${batter.name}: ${result}`;
        newLogs.push({msg, type: getLogType(result)});
    }
    
    newLogs.push({msg: `🏁 End Inning ${startInning}. Total Score: ${currentState.score}`, type: 'META'});
    
    if (startInning >= 3) {
        setOverlay('GAME_OVER');
    } else {
        currentState.inning += 1;
        currentState.outs = 0;
        currentState.runners = [null, null, null];
    }
    
    setLog(prev => [...prev, ...newLogs]);
    setGameState(currentState);
  };

  if (!gameState) return <div className="p-8 text-white font-mono">Loading stadium...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col items-center">
      
      {/* SNY Style Scorebug - Refined */}
      <div className="mt-6 flex bg-[#0a0a0a] border-b-4 border-blue-600 rounded-b-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden font-mono h-16 items-stretch ring-1 ring-white/5">
          <div className="bg-[#1a1a1a] px-6 flex items-center justify-center border-r border-zinc-800">
              <span className="text-[#00aff0] font-black text-2xl italic tracking-tighter drop-shadow-[0_0_8px_rgba(0,175,240,0.4)]">SNY</span>
          </div>
          
          <div className="flex bg-[#0a2144] px-6 items-center gap-4 border-r border-zinc-800 min-w-[160px]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#ff5910] rounded-sm shadow-inner" />
                <span className="font-black text-xl tracking-tight">METS</span>
              </div>
              <span className="text-3xl font-black ml-auto text-white">{gameState.score}</span>
          </div>

          <div className="flex bg-[#1a1a1a] px-6 items-center gap-4 border-r border-zinc-800 min-w-[160px]">
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-5 h-5 bg-zinc-600 rounded-sm shadow-inner" />
                <span className="font-black text-xl tracking-tight">OPP</span>
              </div>
              <span className="text-3xl font-black ml-auto opacity-20">0</span>
          </div>

          <div className="flex flex-col justify-center px-6 border-r border-zinc-800 bg-[#050505] min-w-[80px] items-center">
              <span className="text-sm font-black leading-none mb-1 text-blue-400">▲{Math.min(gameState.inning, 3)}</span>
              <span className="text-[10px] text-zinc-500 font-black uppercase leading-none">INN</span>
          </div>

          {/* Diamond Tracker - Graphical */}
          <div className="bg-[#050505] px-8 flex items-center justify-center border-r border-zinc-800">
              <div className="relative w-10 h-10 border-2 border-zinc-800/50 rotate-45 flex items-center justify-center bg-zinc-950 shadow-inner">
                  {/* Bases */}
                  <div className={`absolute -top-2 -right-2 w-4 h-4 -rotate-45 border-2 border-black/60 transition-all duration-300 ${gameState.runners[1] ? 'bg-[#ffc629] shadow-[0_0_15px_#ffc629] scale-110 z-10' : 'bg-zinc-800'}`} />
                  <div className={`absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 -rotate-45 border-2 border-black/60 transition-all duration-300 ${gameState.runners[2] ? 'bg-[#ffc629] shadow-[0_0_15px_#ffc629] scale-110 z-10' : 'bg-zinc-800'}`} />
                  <div className={`absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 -rotate-45 border-2 border-black/60 transition-all duration-300 ${gameState.runners[0] ? 'bg-[#ffc629] shadow-[0_0_15px_#ffc629] scale-110 z-10' : 'bg-zinc-800'}`} />
                  {/* Home Plate */}
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 -rotate-45 bg-zinc-700/30 rounded-full" />
              </div>
          </div>

          <div className="flex bg-[#050505] px-6 items-center gap-3 border-r border-zinc-800 min-w-[100px]">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Out</span>
              <div className="flex gap-2">
                  {[...Array(2)].map((_, i) => (
                      <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 border-black transition-all duration-300 ${i < gameState.outs ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-zinc-900 shadow-inner'}`} />
                  ))}
              </div>
          </div>

          <div className="flex bg-[#050505] px-6 items-center text-xs font-black min-w-[120px]">
              <span className="text-zinc-600 mr-3 uppercase tracking-tighter">Order</span>
              <span className="text-blue-500 text-lg">#{gameState.currentBatterIndex + 1}</span>
          </div>
      </div>

      <div className="max-w-[1400px] w-full grid grid-cols-12 gap-6 flex-1 overflow-hidden p-6">
        
        {/* Play Area - Wide for Lineup */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            
            {/* Lineup Card Row - No Scroll */}
            <div className="bg-[#0f172a]/30 rounded-3xl border border-white/5 p-6 flex justify-between items-center gap-2 shadow-inner">
                {gameState.lineup.batters.map((p, i) => {
                    const isUp = i === gameState.currentBatterIndex;
                    return (
                        <div 
                            key={p.id}
                            className={`
                                relative flex-1 min-w-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                                h-48 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-xl border-2 flex flex-col items-center justify-between p-3
                                ${isUp ? 'border-blue-500 ring-[12px] ring-blue-500/10 scale-110 -translate-y-2 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'border-zinc-800 opacity-40 grayscale-[0.5]'}
                            `}
                        >
                            <div className={`text-[9px] font-black absolute top-1.5 left-2 ${isUp ? 'text-blue-400' : 'text-zinc-600'}`}>#{i+1}</div>
                            <div className={`w-full aspect-square bg-black/40 rounded-lg overflow-hidden flex items-center justify-center p-1 relative`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 25}.png`} className={`w-full h-full object-contain pixelated transition-transform duration-700 ${isUp ? 'scale-110 rotate-3' : ''}`} alt={p.name} />
                                {isUp && <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />}
                            </div>
                            <div className="text-center w-full min-w-0">
                                <div className={`font-black truncate text-[10px] uppercase tracking-tighter ${isUp ? 'text-white' : 'text-zinc-500'}`}>{p.name}</div>
                                {isUp && (
                                    <div className="flex gap-1 mt-1 justify-center">
                                        <div className="bg-blue-600/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                                            <span className="text-[10px] font-black text-blue-400">{p.stats.contact}</span>
                                        </div>
                                        <div className="bg-orange-600/20 px-1.5 py-0.5 rounded border border-orange-500/20">
                                            <span className="text-[10px] font-black text-orange-400">{p.stats.power}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Stage / Action */}
            <div className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-12 group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
                
                {/* Visual Feedback Area */}
                <div className="relative z-10 text-center space-y-4">
                    <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">Now Batting</h2>
                    <div className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{gameState.lineup.batters[gameState.currentBatterIndex]?.name}</div>
                    <div className="flex justify-center gap-12 pt-4">
                         <div className="text-center">
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Contact</div>
                            <div className="text-3xl font-black">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.contact}</div>
                         </div>
                         <div className="text-center">
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Power</div>
                            <div className="text-3xl font-black">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.power}</div>
                         </div>
                    </div>
                </div>

                <div className="mt-16 flex gap-8 relative z-10">
                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={playPlateAppearance}
                        className="group relative px-16 py-7 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl text-3xl font-black uppercase tracking-[0.2em] shadow-[0_0_60px_rgba(37,99,235,0.3)] transition-all transform active:scale-95 hover:scale-105 ring-1 ring-white/20"
                    >
                        <span className="relative flex items-center gap-4 italic">
                            <Play fill="currentColor" size={28}/> Next Pitch
                        </span>
                    </button>

                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={simulateInning}
                        className="group px-10 py-7 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 flex items-center gap-3 border border-white/10"
                    >
                        <FastForward size={24}/> End Inning
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar Log - Refined */}
        <div className="col-span-12 lg:col-span-3 flex flex-col bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-white/5 bg-[#1a1a1a]/50 backdrop-blur-md flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" /> 
                    Live Coverage
                </h3>
                <Info size={14} className="text-zinc-600" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono scroll-smooth">
                {log.map((entry, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-3 rounded-lg border leading-tight transition-all duration-500
                            ${entry.type === 'META' ? 'bg-blue-900/10 border-blue-500/20 text-blue-400 font-black italic text-center text-xs py-4' : 
                              entry.type === 'HIT' ? 'bg-green-900/10 border-green-500/10 text-green-400 text-sm' :
                              entry.type === 'WALK' ? 'bg-yellow-900/10 border-yellow-500/10 text-yellow-400 text-sm' :
                              'bg-white/[0.02] border-white/5 text-zinc-500 text-sm opacity-80'}
                        `}
                    >
                        {entry.msg}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
      </div>

      {/* Overlays */}
      {overlay === 'GAME_OVER' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-700 p-8">
              <div className="text-center max-w-lg space-y-10 animate-in zoom-in-95 duration-700">
                  <div className="flex justify-center">
                      <div className="p-10 bg-blue-500/10 rounded-full border-4 border-blue-500/30 shadow-[0_0_100px_rgba(37,99,235,0.2)] relative">
                          <Trophy size={120} className="text-blue-500" />
                          <div className="absolute inset-0 animate-ping rounded-full border border-blue-500/20" />
                      </div>
                  </div>
                  <div className="space-y-4">
                      <h2 className="text-xl font-black text-blue-400 uppercase tracking-[0.5em]">Season Over</h2>
                      <div className="text-8xl font-black text-white italic tracking-tighter">FINAL: {gameState.score}</div>
                  </div>
                  <button 
                      onClick={initializeGame}
                      className="w-full flex items-center justify-center gap-4 py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl text-3xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.4)]"
                  >
                      <RotateCcw size={32} /> New Season
                  </button>
              </div>
          </div>
      )}
      
      {/* Navigation Footer */}
      <div className="w-full max-w-6xl flex justify-center gap-12 py-6 mt-auto">
          <button onClick={() => setView('GAME')} className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all ${view === 'GAME' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'hover:bg-zinc-900 text-zinc-500'}`}>
            <LayoutPanelLeft size={18}/> Field
          </button>
          <button onClick={() => setView('SHOP')} className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all ${view === 'SHOP' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'hover:bg-zinc-900 text-zinc-500'}`}>
            <ShoppingCart size={18}/> Front Office
          </button>
      </div>
    </div>
  );
};

export default App;
