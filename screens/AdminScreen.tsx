import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useGlobalEconomy } from '../context/GlobalEconomyContext';
import { GlobalEventType } from '../types';

export const AdminScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, dispatch } = useGame();
  const { economy, updateEconomyEvent } = useGlobalEconomy();
  const [bugReport, setBugReport] = useState("");

  const giveMoney = (amount: number) => {
    dispatch({ type: 'ADD_GOLD', payload: amount });
  };

  const giveCrystals = (amount: number) => {
    dispatch({ type: 'ADD_CRYSTALS', payload: amount });
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = e.target.value as GlobalEventType;
    updateEconomyEvent(eventType);
  };

  const submitBug = () => {
    if (!bugReport) return;
    console.log("BUG REPORTED:", bugReport);
    alert("Hata raporu merkeze gönderildi (Simüle edildi).");
    setBugReport("");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col p-6 font-mono border-4 border-green-500/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-green-500 animate-pulse tracking-tighter">
          DEVELOPER_CONSOLE v4.0
        </h2>
        <button onClick={onClose} className="bg-red-600 text-white px-4 py-2 font-bold hover:bg-red-500">
          CLOSE_X
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
        {/* Player Management */}
        <section className="bg-green-900/10 border border-green-500/30 p-4 rounded">
          <h3 className="text-green-400 font-bold mb-4 border-b border-green-500/30 pb-2">PLAYER_RESOURCES</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button onClick={() => giveMoney(10000)} className="bg-green-600 text-black font-bold py-2 hover:bg-green-400">+10K GOLD</button>
            <button onClick={() => giveCrystals(100)} className="bg-cyan-600 text-black font-bold py-2 hover:bg-cyan-400">+100 CRYSTAL</button>
          </div>
          <div className="text-xs text-green-700">
            <div>NAME: {state.player?.username}</div>
            <div>LEVEL: {state.player?.level}</div>
            <div>GOLD: {state.player?.gold}</div>
            <div>CRYSTALS: {state.player?.crystals}</div>
          </div>
        </section>

        {/* Global Economy & Events */}
        <section className="bg-green-900/10 border border-green-500/30 p-4 rounded">
          <h3 className="text-green-400 font-bold mb-4 border-b border-green-500/30 pb-2">GLOBAL_SYSTEM_CONTROL</h3>
          <div className="space-y-4">
             <div>
               <label className="block text-xs text-green-600 mb-1">ACTIVE_EVENT</label>
               <select 
                 value={economy?.currentEvent} 
                 onChange={handleEventChange}
                 className="w-full bg-black border border-green-500 text-green-400 p-2 text-sm"
               >
                 <option value={GlobalEventType.NONE}>NO_EVENT</option>
                 <option value={GlobalEventType.CYBER_ATTACK}>CYBER_ATTACK</option>
                 <option value={GlobalEventType.MARKET_CRASH}>MARKET_CRASH</option>
                 <option value={GlobalEventType.POLICE_RAID}>POLICE_RAID</option>
                 <option value={GlobalEventType.BOUNTY_HUNT}>BOUNTY_HUNT</option>
               </select>
             </div>
             <div className="text-xs text-green-700">
                STABILITY: {economy?.stabilityIndex}% | ACTIVE_PLAYERS: {economy?.activePlayers}
             </div>
          </div>
        </section>

        {/* Player Stats Breakdown */}
        <section className="bg-green-900/10 border border-green-500/30 p-4 rounded">
          <h3 className="text-green-400 font-bold mb-4 border-b border-green-500/30 pb-2">PERFORMANCE_METRICS</h3>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-green-500/80">
             <div className="bg-black p-2 border border-green-500/20">TOTAL_BATTLES: {state.player?.stats.totalBattles}</div>
             <div className="bg-black p-2 border border-green-500/20">WINS: {state.player?.stats.wins}</div>
             <div className="bg-black p-2 border border-green-500/20">LOSSES: {state.player?.stats.losses}</div>
             <div className="bg-black p-2 border border-green-500/20">MAX_DMG: {state.player?.stats.maxDamageDealt}</div>
          </div>
        </section>

        {/* Bug Reporting Simulation */}
        <section className="bg-green-900/10 border border-green-500/30 p-4 rounded">
          <h3 className="text-green-400 font-bold mb-4 border-b border-green-500/30 pb-2">BUG_REPORT_SYSTEM</h3>
          <textarea 
            value={bugReport}
            onChange={(e) => setBugReport(e.target.value)}
            placeholder="Describe the glitch..."
            className="w-full bg-black border border-green-500 text-green-400 p-2 text-xs h-24 mb-2 resize-none"
          />
          <button onClick={submitBug} className="w-full bg-red-900/50 border border-red-500 text-red-400 font-bold py-2 text-xs hover:bg-red-800">
            TRANSMIT_SIGNAL
          </button>
        </section>
      </div>

      <div className="mt-auto text-center text-[9px] text-green-900 pt-4 uppercase tracking-[0.5em]">
        Authorized Personnel Only // Access Code: 0xDEADBEEF
      </div>
    </div>
  );
};