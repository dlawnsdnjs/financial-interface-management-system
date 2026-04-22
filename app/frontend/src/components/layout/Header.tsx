import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  loading: boolean;
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, loading, onRefresh }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <h2 className="text-lg font-semibold text-slate-800 capitalize">{activeTab}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search interfaces..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <button 
          onClick={onRefresh}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
        </button>
      </div>
    </header>
  );
};

export default Header;
