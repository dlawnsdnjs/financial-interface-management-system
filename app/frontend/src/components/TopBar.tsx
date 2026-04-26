import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Management Console
      </div>
      <div className="text-[10px] font-medium text-gray-400">
        System Local Time: {new Date().toLocaleTimeString()}
      </div>
    </header>
  );
};

export default TopBar;
