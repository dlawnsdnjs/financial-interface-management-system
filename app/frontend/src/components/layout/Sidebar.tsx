import React from 'react';
import { Activity, LayoutDashboard, List, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Activity className="text-blue-400" />
        <span className="text-xl font-bold tracking-tight">FIMS Portal</span>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('interfaces')}
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'interfaces' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <List size={20} /> Interfaces
        </button>
        <button className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
          <BarChart3 size={20} /> Analytics
        </button>
        <button className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
          <Settings size={20} /> System Config
        </button>
      </nav>
      <div className="p-4 border-t border-slate-800 text-slate-500 text-xs text-center">
        © 2026 Noah ATS - FIMS v1.1
      </div>
    </div>
  );
};

export default Sidebar;
