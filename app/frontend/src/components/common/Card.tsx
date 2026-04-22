import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  trend?: 'up' | 'down';
}

const Card: React.FC<CardProps> = ({ title, value, icon, subValue, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? '▲ Healthy' : '▼ Action Required'}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{title}</h4>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {subValue && <div className="text-[10px] text-slate-400 mt-2 font-medium">{subValue}</div>}
      </div>
    </div>
  );
};

export default Card;
