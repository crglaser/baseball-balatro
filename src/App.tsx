import React, { useState, useEffect, useRef } from 'react';
import { type GameState, type Player, type Result } from './types.js';
import { Engine } from './engine.js';
import { ABILITIES } from './abilities.js';
import { ShoppingCart, LayoutPanelLeft, Play, RotateCcw, FastForward, Trophy, SkipForward } from 'lucide-react';

const GAME_LENGTH = 9;

/**
 * 2026 Projected Mets Lineup
 * Source: Fangraphs Roster Resource Depth Charts (Corrected for 2026)
 */
const METS_2026_LINEUP: Player[] = [
    { id: '665742', name: 'Juan Soto (RF)', stats: { contact: 92, power: 98, patience: 99, speed: 60 }, abilities: [ABILITIES.BIG_BATS], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/665742/headshot/67/current' },
    { id: '596019', name: 'Francisco Lindor (SS)', stats: { contact: 86, power: 75, patience: 82, speed: 85 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/596019/headshot/67/current' },
    { id: '643667', name: 'Bo Bichette (SS/DH)', stats: { contact: 90, power: 70, patience: 65, speed: 75 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/643667/headshot/67/current' },
    { id: '668901', name: 'Mark Vientos (1B/3B)', stats: { contact: 75, power: 90, patience: 70, speed: 45 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/668901/headshot/67/current' },
    { id: '543760', name: 'Marcus Semien (2B)', stats: { contact: 80, power: 75, patience: 80, speed: 70 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/543760/headshot/67/current' },
    { id: '682626', name: 'Francisco Alvarez (C)', stats: { contact: 68, power: 94, patience: 75, speed: 40 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/682626/headshot/67/current' },
    { id: '669134', name: 'Luis Campusano (C/DH)', stats: { contact: 78, power: 65, patience: 70, speed: 30 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/669134/headshot/67/current' },
    { id: '682668', name: 'Luisangel Acuña (CF)', stats: { contact: 82, power: 55, patience: 72, speed: 95 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/682668/headshot/67/current' },
    { id: '701424', name: 'Jett Williams (LF/CF)', stats: { contact: 84, power: 50, patience: 94, speed: 92 }, abilities: [], imageUrl: 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/701424/headshot/67/current' },
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
    setLog([{msg: '🏟️ Welcome to Citi Field! Opening Day 2026.', type: 'META'}]);
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
    else if (result === 'WALK') msg = `🚶 ${batter.name.split(' (')[0]} draws a walk.`;
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
    <div className="min-h-screen bg-[#020202] text-slate-100 font-sans selection:bg-[#00aff0]/30 flex flex-col items-center overflow-x-hidden">
      
      {/* SNY Style Scorebug */}
      <div className="mt-4 flex bg-[#0a0a0a] border-b-4 border-[#00aff0] rounded-b shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden font-mono h-20 items-stretch ring-1 ring-white/10 z-50">
          <div className="bg-[#111] px-8 flex items-center justify-center border-r-2 border-zinc-800">
              <span className="text-[#00aff0] font-black text-4xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,175,240,0.5)]">SNY</span>
          </div>
          <div className="flex bg-[#0a2144] px-8 items-center gap-6 border-r-2 border-zinc-800 min-w-[220px]">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 bg-[#ff5910] rounded-sm shadow-inner ring-1 ring-white/10" />
                <span className="font-black text-3xl tracking-tighter text-white">METS</span>
              </div>
              <span className="text-5xl font-black ml-auto text-white tabular-nums">{gameState.score}</span>
          </div>
          <div className="flex bg-[#111] px-8 items-center gap-6 border-r-2 border-zinc-800 min-w-[220px]">
              <div className="flex items-center gap-4 opacity-30">
                <div className="w-7 h-7 bg-zinc-600 rounded-sm shadow-inner ring-1 ring-white/10" />
                <span className="font-black text-3xl tracking-tighter">OPP</span>
              </div>
              <span className="text-5xl font-black ml-auto opacity-10 tabular-nums">0</span>
          </div>
          <div className="flex flex-col justify-center px-8 border-r-2 border-zinc-800 bg-[#050505] min-w-[100px] items-center text-center">
              <span className="text-2xl font-black leading-none mb-1 text-[#00aff0]">▲{Math.min(gameState.inning, GAME_LENGTH)}</span>
              <span className="text-[11px] text-zinc-500 font-black uppercase leading-none tracking-widest">INN</span>
          </div>
          <div className="flex bg-[#050505] px-8 items-center gap-4 border-r-2 border-zinc-800 min-w-[140px]">
              <span className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Outs</span>
              <div className="flex gap-3">
                  {[...Array(2)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-black transition-all duration-500 ${i < gameState.outs ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)] scale-110' : 'bg-zinc-950 shadow-inner'}`} />
                  ))}
              </div>
          </div>
          <div className="flex bg-[#050505] px-10 items-center text-sm font-black min-w-[180px]">
              <span className="text-zinc-600 mr-5 uppercase tracking-tighter text-xs">Batter</span>
              <span className="text-[#00aff0] text-4xl font-black italic tracking-tighter">#{gameState.currentBatterIndex + 1}</span>
          </div>
      </div>

      <div className="max-w-[1550px] w-full flex flex-col gap-6 p-8 flex-1">
        
        {/* Lineup Section */}
        <div className="bg-[#0f172a]/10 rounded-3xl border border-white/5 p-6 flex justify-between items-center gap-4 shadow-inner relative overflow-visible">
            {gameState.lineup.batters.map((p, i) => {
                const isUp = i === gameState.currentBatterIndex;
                return (
                    <div 
                        key={p.id}
                        className={`
                            relative flex-1 min-w-0 transition-all duration-500
                            h-48 bg-gradient-to-br rounded-2xl border-2 flex flex-col items-center justify-between p-3
                            ${isUp ? 'from-blue-600/10 to-blue-900/20 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'from-zinc-900/50 to-zinc-950 border-zinc-800 opacity-30 grayscale-[0.8]'}
                        `}
                    >
                        {isUp && <div className="absolute inset-0 border-4 border-blue-400/20 pointer-events-none animate-pulse rounded-2xl" />}
                        <div className={`text-[9px] font-black absolute top-2 left-3 z-20 ${isUp ? 'text-blue-400' : 'text-zinc-600'}`}>#{i+1}</div>
                        <div className={`w-full aspect-square bg-black/20 rounded-xl overflow-hidden flex items-center justify-center p-1 relative transition-transform duration-700 ${isUp ? 'scale-110' : ''}`}>
                            <img src={p.imageUrl} className={`w-full h-full object-cover transition-transform duration-500 ${isUp ? 'scale-110' : ''}`} alt={p.name} />
                        </div>
                        <div className="text-center w-full min-w-0 z-20">
                            <div className={`font-black truncate text-[9px] uppercase tracking-tighter ${isUp ? 'text-white' : 'text-zinc-500'}`}>{p.name.split(' (')[0]}</div>
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-12 gap-8 flex-1 min-h-[550px]">
            
            {/* Play Area: Batter + Diamond Split */}
            <div className="col-span-12 lg:col-span-9 bg-gradient-to-b from-[#0a0a0a] to-[#030303] rounded-[3.5rem] border border-white/10 relative overflow-hidden shadow-2xl flex flex-row items-stretch ring-1 ring-white/5 p-2">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                
                {/* Left: Batter Info (50%) */}
                <div className="flex-1 flex flex-col justify-center text-left space-y-8 relative z-10 pl-16">
                    <div className="space-y-2">
                        <h2 className="text-sm font-black text-[#00aff0] uppercase tracking-[0.6em] animate-pulse">Now Batting</h2>
                        <div className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight">{gameState.lineup.batters[gameState.currentBatterIndex]?.name}</div>
                    </div>
                    
                    <div className="flex gap-12 font-mono">
                            <div className="text-left space-y-1">
                                <div className="text-[12px] font-black text-zinc-600 uppercase tracking-widest">Contact</div>
                                <div className="text-7xl font-black text-blue-400 tabular-nums">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.contact}</div>
                            </div>
                            <div className="w-px bg-white/5 h-20 self-end mb-2" />
                            <div className="text-left space-y-1">
                                <div className="text-[12px] font-black text-zinc-600 uppercase tracking-widest">Power</div>
                                <div className="text-7xl font-black text-orange-500 tabular-nums">{gameState.lineup.batters[gameState.currentBatterIndex]?.stats.power}</div>
                            </div>
                    </div>

                    <div className="pt-8 flex gap-6 items-center">
                        <button 
                            disabled={gameState.inning > GAME_LENGTH || !!overlay}
                            onClick={playPlateAppearance}
                            className="group relative px-14 py-8 bg-[#00aff0] hover:bg-[#009ee0] disabled:bg-zinc-900 disabled:text-zinc-700 rounded-3xl text-3xl font-black uppercase tracking-[0.2em] shadow-[0_10px_60px_rgba(0,175,240,0.3)] transition-all transform active:scale-95 hover:scale-105"
                        >
                            <span className="relative flex items-center gap-5 italic"><Play fill="currentColor" size={32}/> NEXT AT BAT</span>
                        </button>
                        <div className="flex flex-col gap-3">
                            <button onClick={simulateInning} className="group px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-3 border border-white/5">
                                <FastForward size={18}/> SIM INN
                            </button>
                            <button onClick={simulateFullGame} className="group px-8 py-3 bg-white hover:bg-slate-200 text-black rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-3 shadow-2xl">
                                <SkipForward size={18}/> SIM GAME
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: GIANT INFIELD TRACKER (50%) */}
                <div className="flex-1 flex items-center justify-center p-8 relative z-10 border-l border-white/5 bg-black/20">
                    <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                        {/* The Dirt Diamond Background */}
                        <div className="absolute w-[280px] h-[280px] border-[16px] border-zinc-900/80 rotate-45 flex items-center justify-center bg-black/60 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-lg" />
                        
                        {/* Bases - Positioned outside the rotated dirt */}
                        {/* 2nd Base (Top) */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-20 h-20 border-4 transition-all duration-500 flex items-center justify-center rounded-xl shadow-2xl z-20 ${gameState.runners[1] ? 'bg-[#ffc629] border-white shadow-[0_0_60px_#ffc629] scale-110' : 'bg-zinc-900 border-zinc-800'}`}>
                             <span className={`text-4xl font-black ${gameState.runners[1] ? 'text-black' : 'text-zinc-700 opacity-20'}`}>2</span>
                        </div>
                        {/* 1st Base (Right) */}
                        <div className={`absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 w-20 h-20 border-4 transition-all duration-500 flex items-center justify-center rounded-xl shadow-2xl z-20 ${gameState.runners[0] ? 'bg-[#ffc629] border-white shadow-[0_0_60px_#ffc629] scale-110' : 'bg-zinc-900 border-zinc-800'}`}>
                             <span className={`text-4xl font-black ${gameState.runners[0] ? 'text-black' : 'text-zinc-700 opacity-20'}`}>1</span>
                        </div>
                        {/* 3rd Base (Left) */}
                        <div className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 w-20 h-20 border-4 transition-all duration-500 flex items-center justify-center rounded-xl shadow-2xl z-20 ${gameState.runners[2] ? 'bg-[#ffc629] border-white shadow-[0_0_60px_#ffc629] scale-110' : 'bg-zinc-900 border-zinc-800'}`}>
                             <span className={`text-4xl font-black ${gameState.runners[2] ? 'text-black' : 'text-zinc-700 opacity-20'}`}>3</span>
                        </div>
                        {/* Home Plate (Bottom) */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-16 h-16 bg-white/10 border-2 border-white/20 flex items-center justify-center rounded-full shadow-inner">
                             <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                        </div>

                        {/* Connection Lines */}
                        <div className="absolute w-[240px] h-[240px] border border-white/5 rotate-45 pointer-events-none" />
                    </div>
                    <div className="absolute bottom-10 right-10 flex items-center gap-3 bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 bg-[#ffc629] rounded-full shadow-[0_0_8px_#ffc629]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Base Occupied</span>
                    </div>
                </div>
            </div>

            {/* Sidebar Coverage */}
            <div className="col-span-12 lg:col-span-3 flex flex-col bg-[#080808] rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl relative ring-1 ring-white/5">
                <div className="p-8 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-xl flex items-center justify-between">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#00aff0] flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]" /> Live Coverage
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6 font-mono scroll-smooth">
                    {log.map((entry, i) => (
                        <div 
                            key={i} 
                            className={`
                                p-5 rounded-2xl border leading-relaxed animate-in slide-in-from-top-6 duration-500 shadow-xl
                                ${entry.type === 'META' ? 'bg-[#00aff0]/10 border-[#00aff0]/30 text-[#00aff0] font-black italic text-center text-xs py-6 my-4' : 
                                  entry.type === 'HIT' ? 'bg-green-900/20 border-green-500/20 text-green-400 text-sm' :
                                  entry.type === 'WALK' ? 'bg-yellow-900/20 border-yellow-500/20 text-yellow-500 text-sm' :
                                  'bg-zinc-900/50 border-white/5 text-zinc-500 text-sm opacity-90'}
                            `}
                        >
                            {entry.msg}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Final Overlay */}
      {overlay === 'GAME_OVER' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-1000 p-8">
              <div className="text-center max-w-xl space-y-12 animate-in zoom-in-95 duration-700">
                  <div className="flex justify-center">
                      <div className="p-12 bg-[#00aff0]/10 rounded-full border-4 border-[#00aff0]/30 shadow-[0_0_150px_rgba(0,175,240,0.3)] relative">
                          <Trophy size={140} className="text-[#00aff0]" />
                          <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#00aff0]/20" />
                      </div>
                  </div>
                  <div className="space-y-4">
                      <h2 className="text-2xl font-black text-[#00aff0] uppercase tracking-[0.8em]">Game Set Match</h2>
                      <div className="text-9xl font-black text-white italic tracking-tighter">FINAL: {gameState.score}</div>
                  </div>
                  <button onClick={initializeGame} className="w-full py-10 bg-[#00aff0] hover:bg-[#009ee0] text-white rounded-[2.5rem] text-4xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-[0_20px_80px_rgba(0,175,240,0.5)]">
                      <RotateCcw size={40} className="inline mr-6" /> NEW GAME
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
