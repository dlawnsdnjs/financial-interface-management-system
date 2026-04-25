import React from 'react';
import { Pause, Play, Trash2 } from 'lucide-react';

interface SubscriberRowProps {
  name: string;
  protocol: string;
  queue: string;
  status: 'listening' | 'stopped';
}

export const SubscriberRow: React.FC<SubscriberRowProps> = ({ name, protocol, queue, status }) => (
  <tr className="border-b last:border-0 hover:bg-gray-50">
    <td className="p-3 text-sm">{name}</td>
    <td className="p-3">
      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-700">{protocol}</span>
    </td>
    <td className="p-3 font-mono text-sm text-gray-500">{queue}</td>
    <td className="p-3 text-sm flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-green-500' : 'bg-gray-400'}`} />
      {status === 'listening' ? '리스닝 중' : '중지됨'}
    </td>
    <td className="p-3 text-right">
      <button className="text-gray-600 hover:text-blue-600 mr-3">
        {status === 'listening' ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button className="text-red-500 hover:text-red-700">
        <Trash2 size={16} />
      </button>
    </td>
  </tr>
);
