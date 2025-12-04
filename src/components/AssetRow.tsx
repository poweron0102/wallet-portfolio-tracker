import type { AssetRowProps } from '../types';
import React from 'react';

export const AssetRow: React.FC<AssetRowProps> = ({ asset, fiatRate, fiatSymbol }) => {
  const value = (asset.balance * asset.priceUsd * fiatRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const price = (asset.priceUsd * fiatRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {asset.ticker[0]}
          </div>
          <div>
            <div className="font-bold text-slate-200">{asset.name}</div>
            <div className="text-xs text-slate-500">{asset.ticker} • {asset.network}</div>
          </div>
        </div>
      </td>
      <td className="py-4 text-right">
        <div className="text-slate-200 font-medium">{asset.balance.toLocaleString()}</div>
      </td>
      <td className="py-4 text-right">
        <div className="text-slate-200 font-medium">{fiatSymbol} {price}</div>
      </td>
      <td className="py-4 text-right pr-4">
        <div className="text-slate-200 font-bold">{fiatSymbol} {value}</div>
        <div className="flex items-center justify-end gap-2 text-xs mt-1">
          <span className={asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            24h: {asset.change24h}%
          </span>
          <span className="text-slate-600">|</span>
          <span className={asset.change7d >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            7d: {asset.change7d}%
          </span>
        </div>
      </td>
    </tr>
  );
};