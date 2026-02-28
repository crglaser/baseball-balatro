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
    
    newLogs.push({msg: `🏁 End Inning ${startInning} --- Score: ${currentState.score}`, type: 'META'});
    
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
      
      {/* SNY Style Scorebug - Refined Dimensions */}
      <div className="mt-6 flex bg-[#0a0a0a] border-b-4 border-[#00aff0] rounded-b-lg shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden font-mono h-20 items-stretch ring-1 ring-white/10 z-50">
          {/* SNY Logo Section */}
          <div className="bg-[#111] px-8 flex items-center justify-center border-r-2 border-zinc-800">
              <span className="text-[#00aff0] font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,175,240,0.5)]">SNY</span>
          </div>
          
          {/* Mets Team Section */}
          <div className="flex bg-[#0a2144] px-8 items-center gap-6 border-r-2 border-zinc-800 min-w-[200px]">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-[#ff5910] rounded-sm shadow-inner ring-1 ring-white/10" />
                <span className="font-black text-2xl tracking-tighter text-white">METS</span>
              </div>
              <span className="text-5xl font-black ml-auto text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{gameState.score}</span>
          </div>

          {/* Opponent Section */}
          <div className="flex bg-[#111] px-8 items-center gap-6 border-r-2 border-zinc-800 min-w-[200px]">
              <div className="flex items-center gap-4 opacity-30">
                <div className="w-6 h-6 bg-zinc-600 rounded-sm shadow-inner ring-1 ring-white/10" />
                <span className="font-black text-2xl tracking-tighter">OPP</span>
              </div>
              <span className="text-5xl font-black ml-auto opacity-10">0</span>
          </div>

          {/* Inning Section */}
          <div className="flex flex-col justify-center px-8 border-r-2 border-zinc-800 bg-[#050505] min-w-[100px] items-center">
              <span className="text-xl font-black leading-none mb-1 text-[#00aff0]">▲{Math.min(gameState.inning, 3)}</span>
              <span className="text-[11px] text-zinc-500 font-black uppercase leading-none tracking-widest">INN</span>
          </div>

          {/* Diamond Tracker - HIGH VISIBILITY */}
          <div className="bg-[#050505] px-12 flex items-center justify-center border-r-2 border-zinc-800">
              <div className="relative w-12 h-12 border-2 border-zinc-800 rotate-45 flex items-center justify-center bg-black/40 shadow-inner">
                  {/* Bases - Each base is a visual diamond */}
                  <div className={`absolute -top-3 -right-3 w-5 h-5 -rotate-45 border-2 transition-all duration-300 ${gameState.runners[1] ? 'bg-[#ffc629] border-white shadow-[0_0_20px_#ffc629] scale-125 z-10' : 'bg-zinc-900 border-zinc-800'}`} title="2nd Base" />
                  <div className={`absolute top-1/2 -left-3 -translate-y-1/2 w-5 h-5 -rotate-45 border-2 transition-all duration-300 ${gameState.runners[2] ? 'bg-[#ffc629] border-white shadow-[0_0_20px_#ffc629] scale-125 z-10' : 'bg-zinc-900 border-zinc-800'}`} title="3rd Base" />
                  <div className={`absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 -rotate-45 border-2 transition-all duration-300 ${gameState.runners[0] ? 'bg-[#ffc629] border-white shadow-[0_0_20px_#ffc629] scale-125 z-10' : 'bg-zinc-900 border-zinc-800'}`} title="1st Base" />
                  {/* Home Plate Indicator */}
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 -rotate-45 bg-[#ff5910]/20 rounded-full border border-white/5" />
              </div>
          </div>

          {/* Outs Section - BIG CIRCLES */}
          <div className="flex bg-[#050505] px-8 items-center gap-4 border-r-2 border-zinc-800 min-w-[140px]">
              <span className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Outs</span>
              <div className="flex gap-3">
                  {[...Array(2)].map((_, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full border-2 border-black transition-all duration-500 ${i < gameState.outs ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)]' : 'bg-zinc-950 shadow-inner'}`} />
                  ))}
              </div>
          </div>

          {/* Batting Order Info */}
          <div className="flex bg-[#050505] px-10 items-center text-sm font-black min-w-[160px]">
              <span className="text-zinc-600 mr-4 uppercase tracking-tighter text-xs">Batter</span>
              <span className="text-[#00aff0] text-3xl font-black italic tracking-tighter">#{gameState.currentBatterIndex + 1}</span>
          </div>
      </div>

      <div className="max-w-[1400px] w-full grid grid-cols-12 gap-8 flex-1 overflow-hidden p-8">
        
        {/* Play Area - Wide for Lineup */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
            
            {/* Lineup Card Row - Fixed Grid, No Padding conflicts */}
            <div className="bg-[#0f172a]/20 rounded-3xl border border-white/5 p-8 flex justify-between items-center gap-3 shadow-inner relative">
                {gameState.lineup.batters.map((p, i) => {
                    const isUp = i === gameState.currentBatterIndex;
                    return (
                        <div 
                            key={p.id}
                            className={`
                                relative flex-1 min-w-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                                h-52 bg-gradient-to-br rounded-2xl border-2 flex flex-col items-center justify-between p-4
                                ${isUp ? 'from-blue-600/20 to-blue-900/40 border-blue-500 ring-[12px] ring-blue-500/10 scale-110 -translate-y-2 z-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)]' : 'from-zinc-800 to-zinc-950 border-zinc-800 opacity-30 grayscale-[0.3]'}
                            `}
                        >
                            <div className={`text-[10px] font-black absolute top-2 left-3 ${isUp ? 'text-blue-400' : 'text-zinc-600'}`}>ORDER #{i+1}</div>
                            <div className={`w-full aspect-square bg-black/40 rounded-xl overflow-hidden flex items-center justify-center p-2 relative transition-transform duration-700 ${isUp ? 'scale-110' : ''}`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 25}.png`} className={`w-full h-full object-contain pixelated`} alt={p.name} />
                                {isUp && <div className="absolute inset-0 bg-blue-400/5 animate-pulse rounded-xl" />}
                            </div>
                            <div className="text-center w-full min-w-0">
                                <div className={`font-black truncate text-[11px] uppercase tracking-tighter ${isUp ? 'text-white' : 'text-zinc-500'}`}>{p.name}</div>
                                {isUp && (
                                    <div className="flex gap-2 mt-2 justify-center font-mono">
                                        <div className="bg-blue-600/30 px-2 py-0.5 rounded border border-blue-500/20">
                                            <span className="text-[10px] font-black text-blue-400">CON {p.stats.contact}</span>
                                        </div>
                                        <div className="bg-orange-600/30 px-2 py-0.5 rounded border border-orange-500/20">
                                            <span className="text-[10px] font-black text-orange-400">POW {p.stats.power}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Stage Area */}
            <div className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#030303] rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-12 group ring-1 ring-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                
                <div className="relative z-10 text-center space-y-6">
                    <h2 className="text-sm font-black text-[#00aff0] uppercase tracking-[0.6em] animate-pulse drop-shadow-[0_0_10px_rgba(0,175,240,0.3)]">Now Batting</h2>
                    <div className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500">{gameState.lineup.batters[gameState.currentBatterIndex]?.name}</div>
                    
                    <div className="flex justify-center gap-16 pt-8 font-mono">
                         <div className="text-center space-y-1">
                            <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">Contact Score</div>
                            <div className="text-5xl font-black text-blue-400 tabular-nums">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.contact}</div>
                         </div>
                         <div className="w-px bg-white/5" />
                         <div className="text-center space-y-1">
                            <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">Power Rating</div>
                            <div className="text-5xl font-black text-orange-500 tabular-nums">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.power}</div>
                         </div>
                    </div>
                </div>

                <div className="mt-20 flex gap-10 relative z-10">
                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={playPlateAppearance}
                        className="group relative px-20 py-8 bg-[#00aff0] hover:bg-[#009ee0] disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl text-3xl font-black uppercase tracking-[0.2em] shadow-[0_10px_60px_rgba(0,175,240,0.3)] transition-all transform active:scale-95 hover:scale-105 hover:rotate-1 ring-1 ring-white/30"
                    >
                        <span className="relative flex items-center gap-6 italic">
                            <Play fill="currentColor" size={32}/> NEXT PITCH
                        </span>
                        <div className="absolute -inset-1 bg-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    </button>

                    <button 
                        disabled={gameState.inning > 3 || !!overlay}
                        onClick={simulateInning}
                        className="group px-12 py-8 bg-zinc-800/80 hover:bg-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 flex items-center gap-4 border border-white/10 backdrop-blur-sm"
                    >
                        <FastForward size={24}/> FAST FORWARD INNING
                    </button>
                </div>
            </div>
        </div>

        {/* Play-by-Play Sidebar */}
        <div className="col-span-12 lg:col-span-3 flex flex-col bg-[#080808] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-xl flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00aff0] flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]" /> 
                    Live Coverage
                </h3>
                <Info size={16} className="text-zinc-700 hover:text-zinc-400 cursor-pointer transition" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scroll-smooth">
                {log.map((entry, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-4 rounded-xl border leading-relaxed animate-in slide-in-from-right-8 duration-500 shadow-sm
                            ${entry.type === 'META' ? 'bg-[#00aff0]/10 border-[#00aff0]/30 text-[#00aff0] font-black italic text-center text-xs py-5 my-4' : 
                              entry.type === 'HIT' ? 'bg-green-500/10 border-green-500/20 text-green-400 text-sm' :
                              entry.type === 'WALK' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 text-sm' :
                              'bg-zinc-900/30 border-white/5 text-zinc-500 text-sm opacity-90'}
                        `}
                    >
                        {entry.msg}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
      </div>

      {/* Navigation - Hidden during gameplay focus */}
      <div className="w-full max-w-6xl flex justify-center gap-16 py-8 mt-auto opacity-40 hover:opacity-100 transition-opacity duration-700">
          <button onClick={() => setView('GAME')} className={`flex items-center gap-4 px-10 py-3 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all ${view === 'GAME' ? 'bg-[#00aff0] text-white shadow-[0_0_30px_rgba(0,175,240,0.4)]' : 'hover:bg-zinc-900 text-zinc-600'}`}>
            <LayoutPanelLeft size={20}/> The Field
          </button>
          <button onClick={() => setView('SHOP')} className={`flex items-center gap-4 px-10 py-3 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all ${view === 'SHOP' ? 'bg-[#00aff0] text-white shadow-[0_0_30px_rgba(0,175,240,0.4)]' : 'hover:bg-zinc-900 text-zinc-600'}`}>
            <ShoppingCart size={20}/> Front Office
          </button>
      </div>
    </div>
  );
};

export default App;
