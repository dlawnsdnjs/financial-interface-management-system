import React from 'react';
import { LayoutDashboard, Settings, ChevronRight, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { name: '대시보드', path: '/dashboard', icon: LayoutDashboard },
    { name: '인터페이스 관리', path: '/', icon: Settings },
    { name: '이력 및 성능 관리', path: '/history', icon: Activity },
  ];

  return (
    <div className="w-64 bg-[#232f3e] text-white min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white">F</div>
        <span className="text-xl font-bold tracking-tight">FIMS v2</span>
      </div>
      
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
              isActive(item.path) 
                ? 'bg-gray-700 text-white border-l-4 border-orange-500' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
            {isActive(item.path) && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">
        System Operational
      </div>
    </div>
  );
};

export default Sidebar;
