import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex gap-4">
      <div className="flex-1 h-12 bg-gray-100 rounded"></div>
      <div className="flex-1 h-12 bg-gray-100 rounded"></div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
  </tr>
);
