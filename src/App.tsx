import React, { useState, useEffect, useRef } from 'react';
import { type GameState, type Player, type Result } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw, FastForward, Trophy, SkipForward } from 'lucide-react';

const GAME_LENGTH = 9;

/**
 * 2026 Projected Mets Lineup
 * Refined for 2026 projections: Soto, Lindor, Bichette, Alonso, Vientos, Semien, Nimmo, Alvarez, Gilbert
 */
const METS_2026_LINEUP: Player[] = [
    { id: '665742', name: 'Juan Soto (LF)', stats: { contact: 92, power: 98, patience: 99, speed: 60 }, abilities: [ABILITIES.BIG_BATS], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/665742/headshot/67/current' },
    { id: '596019', name: 'Francisco Lindor (SS)', stats: { contact: 86, power: 75, patience: 82, speed: 85 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/596019/headshot/67/current' },
    { id: '643667', name: 'Bo Bichette (DH)', stats: { contact: 90, power: 70, patience: 65, speed: 75 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/643667/headshot/67/current' },
    { id: '624413', name: 'Pete Alonso (1B)', stats: { contact: 68, power: 99, patience: 78, speed: 35 }, abilities: [ABILITIES.BIG_BATS], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/624413/headshot/67/current' },
    { id: '668901', name: 'Mark Vientos (3B)', stats: { contact: 75, power: 90, patience: 70, speed: 45 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/668901/headshot/67/current' },
    { id: '543760', name: 'Marcus Semien (2B)', stats: { contact: 80, power: 75, patience: 80, speed: 70 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/543760/headshot/67/current' },
    { id: '607043', name: 'Brandon Nimmo (RF)', stats: { contact: 84, power: 65, patience: 98, speed: 70 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/607043/headshot/67/current' },
    { id: '682626', name: 'Francisco Alvarez (C)', stats: { contact: 68, power: 94, patience: 75, speed: 40 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/682626/headshot/67/current' },
    { id: '694836', name: 'Drew Gilbert (CF)', stats: { contact: 78, power: 72, patience: 82, speed: 88 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/694836/headshot/67/current' },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [log, setLog] = useState<{msg: string, type: 'HIT' | 'OUT' | 'WALK' | 'META'}[]>([]);
  const [view, setView] = useState<'GAME' | 'SHOP'>('GAME');
  const [overlay, setOverlay] = useState<'GAME_OVER' | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const initializeGame = () => {
    setGameState({
      lineup: { batters: JSON.parse(JSON.stringify(METS_2026_LINEUP)) },
      inning: 1,
      outs: 0,
      score: 0,
      runners: [null, null, null],
      currentBatterIndex: 0,
    });
    setLog([{msg: '🏟️ Opening Day 2026 at Citi Field!', type: 'META'}]);
    setOverlay(null);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const getLogType = (res: Result): 'HIT' | 'OUT' | 'WALK' => {
      if (res === 'WALK') return 'WALK';
      if (['SINGLE', 'DOUBLE', 'TRIPLE', 'HOME_RUN'].includes(res)) return 'HIT';
      return 'OUT';
  };

  const generateNarrative = (batter: Player, result: Result, prevState: GameState, nextState: GameState) => {
    let msg = "";
    const runsScored = nextState.score - prevState.score;
    
    if (result === 'HOME_RUN') msg = `🚀 ${batter.name.split(' (')[0]} CRUSHES A HOME RUN!`;
    else if (result === 'WALK') msg = `🚶 ${batter.name.split(' (')[0]} works a walk.`;
    else if (result === 'STRIKEOUT') msg = `🚫 ${batter.name.split(' (')[0]} strikes out.`;
    else if (result === 'OUT') msg = `⚾ ${batter.name.split(' (')[0]} made an out.`;
    else msg = `🔥 ${batter.name.split(' (')[0]} rips a ${result.toLowerCase()}!`;

    if (runsScored > 0) {
        msg += ` ${runsScored} run${runsScored > 1 ? 's' : ''} score${runsScored === 1 ? 's' : ''}!`;
    }

    const runnersOn = nextState.runners.filter(r => r !== null).length;
    if (nextState.outs < 3 && runnersOn === 3) msg += " The bases are loaded!";

    return msg;
  };

  const playPlateAppearance = () => {
    if (!gameState || overlay || gameState.inning > GAME_LENGTH) return;
    
    const batter = gameState.lineup.batters[gameState.currentBatterIndex];
    if (!batter) return;

    const result = Engine.simulatePlateAppearance(batter);
    let nextState = Engine.processResult(gameState, result);

    const msg = generateNarrative(batter, result, gameState, nextState);
    const newLogs: {msg: string, type: any}[] = [{msg, type: getLogType(result)}];
    
    if (nextState.outs >= 3) {
        newLogs.unshift({msg: `🏁 End Inning ${gameState.inning}. Score: ${nextState.score}`, type: 'META'});
        if (gameState.inning >= GAME_LENGTH) {
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
    if (!gameState || overlay || gameState.inning > GAME_LENGTH) return;
    
    let currentState = JSON.parse(JSON.stringify(gameState));
    const startInning = currentState.inning;
    const newLogs: {msg: string, type: any}[] = [];
    
    while (currentState.outs < 3) {
        const batter = currentState.lineup.batters[currentState.currentBatterIndex];
        if (!batter) break;
        const prevState = JSON.parse(JSON.stringify(currentState));
        const result = Engine.simulatePlateAppearance(batter);
        currentState = Engine.processResult(currentState, result);
        newLogs.unshift({msg: generateNarrative(batter, result, prevState, currentState), type: getLogType(result)});
    }
    
    newLogs.unshift({msg: `🏁 End Inning ${startInning} --- Score: ${currentState.score}`, type: 'META'});
    
    if (startInning >= GAME_LENGTH) {
        setOverlay('GAME_OVER');
    } else {
        currentState.inning += 1;
        currentState.outs = 0;
        currentState.runners = [null, null, null];
    }
    
    setLog(prev => [...newLogs, ...prev]);
    setGameState(currentState);
  };

  const simulateFullGame = () => {
    if (!gameState || overlay || gameState.inning > GAME_LENGTH) return;
    
    let currentState = JSON.parse(JSON.stringify(gameState));
    const totalNewLogs: {msg: string, type: any}[] = [];
    
    while (currentState.inning <= GAME_LENGTH) {
        const startInning = currentState.inning;
        const inningLogs: {msg: string, type: any}[] = [];
        while (currentState.outs < 3) {
            const batter = currentState.lineup.batters[currentState.currentBatterIndex];
            if (!batter) break;
            const prevState = JSON.parse(JSON.stringify(currentState));
            const result = Engine.simulatePlateAppearance(batter);
            currentState = Engine.processResult(currentState, result);
            inningLogs.unshift({msg: generateNarrative(batter, result, prevState, currentState), type: getLogType(result)});
        }
        inningLogs.unshift({msg: `🏁 End Inning ${startInning} --- Score: ${currentState.score}`, type: 'META'});
        totalNewLogs.unshift(...inningLogs);
        
        if (currentState.inning < GAME_LENGTH) {
            currentState.inning += 1;
            currentState.outs = 0;
            currentState.runners = [null, null, null];
        } else {
            break;
        }
    }
    
    setOverlay('GAME_OVER');
    setLog(prev => [...totalNewLogs, ...prev]);
    setGameState(currentState);
  };

  if (!gameState) return <div className="p-8 text-white font-mono">Loading stadium...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col items-center">
      
      {/* SNY Style Scorebug */}
      <div className="mt-6 flex bg-[#0a0a0a] border-b-4 border-[#00aff0] rounded-b-lg shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden font-mono h-20 items-stretch ring-1 ring-white/10 z-50">
          <div className="bg-[#111] px-8 flex items-center justify-center border-r-2 border-zinc-800">
              <span className="text-[#00aff0] font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,175,240,0.5)]">SNY</span>
          </div>
          
          <div className="flex bg-[#0a2144] px-8 items-center gap-6 border-r-2 border-zinc-800 min-w-[200px]">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-[#ff5910] rounded-sm shadow-inner ring-1 ring-white/10" />
                <span className="font-black text-2xl tracking-tighter text-white">METS</span>
              </div>
              <span className="text-5xl font-black ml-auto text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] text-right min-w-[60px]">{gameState.score}</span>
          </div>

          <div className="flex bg-[#111] px-8 items-center gap-6 border-r-2 border-zinc-800 min-w-[200px]">
              <div className="flex items-center gap-4 opacity-30">
                <div className="w-6 h-6 bg-zinc-600 rounded-sm shadow-inner ring-1 ring-white/10" />
                <span className="font-black text-2xl tracking-tighter">OPP</span>
              </div>
              <span className="text-5xl font-black ml-auto opacity-10">0</span>
          </div>

          <div className="flex flex-col justify-center px-8 border-r-2 border-zinc-800 bg-[#050505] min-w-[100px] items-center text-center">
              <span className="text-xl font-black leading-none mb-1 text-[#00aff0]">▲{Math.min(gameState.inning, GAME_LENGTH)}</span>
              <span className="text-[11px] text-zinc-500 font-black uppercase leading-none tracking-widest">INN</span>
          </div>

          <div className="flex bg-[#050505] px-8 items-center gap-4 border-r-2 border-zinc-800 min-w-[140px]">
              <span className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Outs</span>
              <div className="flex gap-3">
                  {[...Array(2)].map((_, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full border-2 border-black transition-all duration-500 ${i < gameState.outs ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)]' : 'bg-zinc-950 shadow-inner'}`} />
                  ))}
              </div>
          </div>

          <div className="flex bg-[#050505] px-10 items-center text-sm font-black min-w-[160px]">
              <span className="text-zinc-600 mr-4 uppercase tracking-tighter text-xs">Batter</span>
              <span className="text-[#00aff0] text-3xl font-black italic tracking-tighter">#{gameState.currentBatterIndex + 1}</span>
          </div>
      </div>

      <div className="max-w-[1600px] w-full grid grid-cols-12 gap-8 flex-1 overflow-hidden p-8">
        
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
            
            {/* Lineup Row - FULL WIDTH */}
            <div className="bg-[#0f172a]/10 rounded-3xl border border-white/5 p-8 flex justify-between items-center gap-4 shadow-inner relative overflow-visible">
                {gameState.lineup.batters.map((p, i) => {
                    const isUp = i === gameState.currentBatterIndex;
                    return (
                        <div 
                            key={p.id}
                            className={`
                                relative flex-1 min-w-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                                h-52 bg-gradient-to-br rounded-2xl border-2 flex flex-col items-center justify-between p-4 overflow-hidden
                                ${isUp ? 'from-blue-600/10 to-blue-900/20 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'from-zinc-900/50 to-zinc-950 border-zinc-800 opacity-30 grayscale-[0.5]'}
                            `}
                        >
                            {isUp && <div className="absolute inset-0 border-4 border-blue-400/20 pointer-events-none animate-pulse rounded-2xl" />}
                            <div className={`text-[9px] font-black absolute top-2 left-3 z-20 ${isUp ? 'text-blue-400' : 'text-zinc-600'}`}>#{i+1}</div>
                            <div className={`w-full aspect-square bg-black/40 rounded-xl overflow-hidden flex items-center justify-center p-2 relative transition-transform duration-700 ${isUp ? 'scale-110' : ''}`}>
                                <img src={p.imageUrl} className={`w-full h-full object-contain pixelated`} alt={p.name} />
                            </div>
                            <div className="text-center w-full min-w-0 z-20">
                                <div className={`font-black truncate text-[10px] uppercase tracking-tighter ${isUp ? 'text-white' : 'text-zinc-500'}`}>{p.name}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Stage */}
            <div className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#030303] rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-12 group ring-1 ring-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                
                <div className="relative z-10 text-center space-y-6">
                    <h2 className="text-sm font-black text-[#00aff0] uppercase tracking-[0.6em] animate-pulse drop-shadow-[0_0_10px_rgba(0,175,240,0.3)]">Now Batting</h2>
                    <div className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500">{gameState.lineup.batters[gameState.currentBatterIndex]?.name}</div>
                    
                    <div className="flex justify-center gap-16 pt-8 font-mono text-center">
                         <div className="space-y-1">
                            <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">Contact</div>
                            <div className="text-5xl font-black text-blue-400 tabular-nums">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.contact}</div>
                         </div>
                         <div className="w-px bg-white/5" />
                         <div className="space-y-1">
                            <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">Power</div>
                            <div className="text-5xl font-black text-orange-500 tabular-nums">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.power}</div>
                         </div>
                    </div>
                </div>

                <div className="mt-20 flex gap-10 relative z-10">
                    <button 
                        disabled={gameState.inning > GAME_LENGTH || !!overlay}
                        onClick={playPlateAppearance}
                        className="group relative px-16 py-8 bg-[#00aff0] hover:bg-[#009ee0] disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl text-3xl font-black uppercase tracking-[0.2em] shadow-[0_10px_60px_rgba(0,175,240,0.3)] transition-all transform active:scale-95 hover:scale-105 ring-1 ring-white/30"
                    >
                        <span className="relative flex items-center gap-6 italic">
                            <Play fill="currentColor" size={32}/> NEXT AT BAT
                        </span>
                    </button>

                    <button 
                        disabled={gameState.inning > GAME_LENGTH || !!overlay}
                        onClick={simulateInning}
                        className="group px-10 py-8 bg-zinc-800/80 hover:bg-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 flex items-center gap-4 border border-white/10 backdrop-blur-sm"
                    >
                        <FastForward size={24}/> END INNING
                    </button>

                    <button 
                        disabled={gameState.inning > GAME_LENGTH || !!overlay}
                        onClick={simulateFullGame}
                        className="group px-10 py-8 bg-white hover:bg-slate-200 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 flex items-center gap-4 shadow-2xl"
                    >
                        <SkipForward size={24}/> SIM GAME
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar + Diamond Area */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            
            {/* Visual Diamond - HIGH FIDELITY SIMULATOR STYLE */}
            <div className="h-[300px] bg-gradient-to-br from-[#0f172a] to-black rounded-[2.5rem] border-2 border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-40" />
                
                {/* Rotated Field Square */}
                <div className="relative w-48 h-48 border-4 border-zinc-800/80 rotate-45 flex items-center justify-center bg-black/60 shadow-inner rounded-xl transition-transform duration-700 group-hover:scale-105">
                    
                    {/* Bases - Placed at corners of rotated square */}
                    {/* 2nd Base (Top corner) */}
                    <div className={`absolute -top-6 -right-6 w-12 h-12 -rotate-45 border-4 flex items-center justify-center rounded-lg transition-all duration-500 shadow-2xl z-20 ${gameState.runners[1] ? 'bg-[#ffc629] border-white shadow-[0_0_30px_#ffc629] scale-110' : 'bg-zinc-900 border-zinc-800 opacity-60'}`}>
                        <span className={`text-xl font-black ${gameState.runners[1] ? 'text-black' : 'text-zinc-800 opacity-20'}`}>2</span>
                    </div>

                    {/* 1st Base (Right corner) */}
                    <div className={`absolute top-1/2 -right-6 -translate-y-1/2 w-12 h-12 -rotate-45 border-4 flex items-center justify-center rounded-lg transition-all duration-500 shadow-2xl z-20 ${gameState.runners[0] ? 'bg-[#ffc629] border-white shadow-[0_0_30px_#ffc629] scale-110' : 'bg-zinc-900 border-zinc-800 opacity-60'}`}>
                        <span className={`text-xl font-black ${gameState.runners[0] ? 'text-black' : 'text-zinc-800 opacity-20'}`}>1</span>
                    </div>

                    {/* 3rd Base (Left corner) */}
                    <div className={`absolute top-1/2 -left-6 -translate-y-1/2 w-12 h-12 -rotate-45 border-4 flex items-center justify-center rounded-lg transition-all duration-500 shadow-2xl z-20 ${gameState.runners[2] ? 'bg-[#ffc629] border-white shadow-[0_0_30px_#ffc629] scale-110' : 'bg-zinc-900 border-zinc-800 opacity-60'}`}>
                        <span className={`text-xl font-black ${gameState.runners[2] ? 'text-black' : 'text-zinc-800 opacity-20'}`}>3</span>
                    </div>

                    {/* Home Plate (Bottom corner) */}
                    <div className="absolute -bottom-4 -left-4 w-10 h-10 -rotate-45 bg-[#ff5910]/40 rounded-sm border-2 border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,89,16,0.2)]">
                        <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" />
                    </div>
                </div>
                
                <div className="absolute bottom-4 font-black text-[10px] uppercase tracking-[0.5em] text-zinc-700 group-hover:text-[#00aff0] transition-colors">Stadium Diamond</div>
            </div>

            {/* Play-by-Play Sidebar */}
            <div className="flex-1 flex flex-col bg-[#080808] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
                <div className="p-6 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-xl">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00aff0] flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]" /> 
                        Live Coverage
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scroll-smooth">
                    {log.map((entry, i) => (
                        <div 
                            key={i} 
                            className={`
                                p-4 rounded-xl border leading-relaxed animate-in slide-in-from-top-4 duration-500 shadow-sm
                                ${entry.type === 'META' ? 'bg-[#00aff0]/10 border-[#00aff0]/30 text-[#00aff0] font-black italic text-center text-xs py-5 my-4' : 
                                  entry.type === 'HIT' ? 'bg-green-900/10 border-green-500/20 text-green-400 text-sm' :
                                  entry.type === 'WALK' ? 'bg-yellow-900/10 border-yellow-500/20 text-yellow-500 text-sm' :
                                  'bg-zinc-900/30 border-white/5 text-zinc-500 text-sm opacity-90'}
                            `}
                        >
                            {entry.msg}
                        </div>
                    ))}
                </div>
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
                      <h2 className="text-xl font-black text-blue-400 uppercase tracking-[0.5em]">Game Set Match</h2>
                      <div className="text-8xl font-black text-white italic tracking-tighter">FINAL: {gameState.score}</div>
                  </div>
                  <button onClick={initializeGame} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl text-3xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-2xl">
                      <RotateCcw size={32} className="inline mr-4" /> NEW GAME
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
