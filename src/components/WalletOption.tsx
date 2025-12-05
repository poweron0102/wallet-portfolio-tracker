import type { WalletOptionProps } from '../types';
import { X } from 'lucide-react';

export const WalletOption: React.FC<WalletOptionProps> = ({ name, icon, color, onClick, isConnected, address, onDisconnect }) => (
  <div
    className="w-full flex items-center justify-between p-4 mb-3 bg-slate-700/50 border border-slate-600 rounded-xl transition-all group"
  >
    <button
    onClick={onClick}
    className="flex-1 flex items-center gap-4 text-left"
    disabled={isConnected}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-20 flex-shrink-0`}>
          {icon}
      </div>
      <div>
        <span className={`font-semibold text-lg ${isConnected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{name}</span>
        {isConnected && address && (
          <p className="text-xs font-mono text-indigo-400">{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</p>
        )}
      </div>
    </button>
    {isConnected ? (
      <button onClick={onDisconnect} className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 transition-colors">
        <X size={18} />
      </button>
    ) : (
      <div className="w-2 h-2 rounded-full bg-slate-500" />
    )}
  </div>
);