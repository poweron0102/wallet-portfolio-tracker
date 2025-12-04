import type { WalletOptionProps } from '../types';
import React from 'react';

export const WalletOption: React.FC<WalletOptionProps> = ({ name, icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 mb-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-20`}>
        {icon}
      </div>
      <span className="font-semibold text-lg text-slate-200 group-hover:text-white">{name}</span>
    </div>
    <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-green-400 transition-colors" />
  </button>
);