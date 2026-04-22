import React from 'react';
import { Activity, CheckCircle, Clock, XCircle, ArrowRight, RefreshCw, Play } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Interface, Stats } from '../../types';
import Card from '../common/Card';

interface DashboardViewProps {
  stats: Stats | null;
  interfaces: Interface[];
  executing: string | null;
  onExecute: (id: string) => void;
  onRetry: (id: number) => void;
  onNavigateToInterfaces: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardView: React.FC<DashboardViewProps> = ({ 
  stats, 
  interfaces, 
  executing, 
  onExecute, 
  onRetry, 
  onNavigateToInterfaces 
}) => {
  const protocolChartData = stats ? Object.entries(stats.protocolStats).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Transactions" 
          value={stats?.totalCount || 0} 
          icon={<Activity className="text-blue-500" />}
          subValue="+12% from yesterday"
        />
        <Card 
          title="Success Rate" 
          value={`${stats?.successRate || 0}%`} 
          icon={<CheckCircle className="text-emerald-500" />}
          trend={stats && stats.successRate > 95 ? 'up' : 'down'}
        />
        <Card 
          title="Avg Latency" 
          value={`${stats?.avgLatency || 0}ms`} 
          icon={<Clock className="text-amber-500" />}
          subValue="Target: <200ms"
        />
        <Card 
          title="Critical Errors" 
          value={stats?.errorCount || 0} 
          icon={<XCircle className="text-rose-500" />}
          trend={stats && (stats.errorCount === 0) ? 'up' : 'down'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 mb-6">Protocol Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolChartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {protocolChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 mb-6 flex items-center justify-between">
            Recent Activity
            <span className="text-xs font-normal text-slate-400">Real-time</span>
          </h3>
          <div className="flex flex-col gap-4">
            {stats?.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="text-xs font-bold text-slate-700 truncate">{log.intfId}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    {log.retryOf && <RefreshCw size={8} className="text-blue-500" />}
                    {log.protType} • {log.latencyMs}ms • {log.httpMethod || 'GET'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {log.status === 'SUCCESS' ? 
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">OK</span> :
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">FAIL</span>
                      <button 
                        onClick={() => onRetry(log.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-200 rounded-md transition-all shadow-sm bg-white"
                        title="Retry transaction"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  }
                </div>
              </div>
            ))}
            {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
              <div className="text-center py-8 text-slate-400 text-sm italic">No recent transactions</div>
            )}
          </div>
        </div>
      </div>

      {/* Interface Quick Control */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-md font-bold text-slate-800">Interface Quick Control</h3>
          <button onClick={onNavigateToInterfaces} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Interface Name</th>
                <th className="px-6 py-4">Protocol</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interfaces.slice(0, 5).map((intf) => (
                <tr key={intf.intfId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{intf.intfId}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{intf.intfName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-bold uppercase">
                      {intf.protType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onExecute(intf.intfId)}
                      disabled={executing === intf.intfId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <Play size={12} fill="white" /> {executing === intf.intfId ? 'Running...' : 'Run'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
