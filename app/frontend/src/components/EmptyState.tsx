import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, actionPath }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border-2 border-dashed border-gray-200 rounded-lg">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
