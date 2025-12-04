import type { SidebarItemProps } from '../types';

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  hasSubmenu = false, 
  subItems = [], 
  currentSub, 
  onSubClick 
}) => (
  <div className="mb-2">
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive && !hasSubmenu ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
    
    {/* Submenu simulando as redes para Saldo e Histórico */}
    {hasSubmenu && isActive && (
      <div className="ml-10 mt-1 flex flex-col gap-1 border-l border-slate-700 pl-3 animate-in slide-in-from-left-2 duration-200">
        {subItems.map(item => (
          <button
            key={item.key}
            onClick={() => onSubClick && onSubClick(item.key)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentSub === item.key ? 'text-indigo-400 bg-indigo-500/10 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    )}
  </div>
);