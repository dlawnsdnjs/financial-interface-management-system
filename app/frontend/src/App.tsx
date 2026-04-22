import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Settings, 
  LayoutDashboard, 
  List, 
  BarChart3,
  RefreshCw,
  Search,
  Plus,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend
} from 'recharts';

// Modular Components
import { Interface, Stats, TransactionLog } from './types';
import Card from './components/common/Card';
import InterfaceForm from './components/InterfaceForm';
import ResponseViewer from './components/ResponseViewer';

const API_BASE_URL = 'http://localhost:8080/api/v1/interfaces';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [interfaces, setInterfaces] = useState<Interface[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingInterface, setEditingInterface] = useState<Interface | undefined>(undefined);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intfRes, statsRes] = await Promise.all([
        axios.get(API_BASE_URL),
        axios.get(`${API_BASE_URL}/stats`)
      ]);
      setInterfaces(intfRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const executeInterface = async (intfId: string) => {
    setExecuting(intfId);
    try {
      const response = await axios.post(`${API_BASE_URL}/${intfId}/execute`);
      setExecutionResult(response.data);
      await fetchData(); 
    } catch (error: any) {
      setExecutionResult({
        status: 'FAIL',
        intfId,
        msg: error.response?.data?.message || error.message,
        latency: 'N/A',
        transId: 'ERR-' + Date.now()
      });
    } finally {
      setExecuting(null);
    }
  };

  const retryTransaction = async (logId: number) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/logs/${logId}/retry`);
      setExecutionResult(response.data);
      await fetchData();
    } catch (error: any) {
      alert('Retry failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInterfaceSubmit = async (data: Interface) => {
    try {
      setLoading(true);
      if (data.id) {
        // Update
        await axios.put(`${API_BASE_URL}/${data.intfId}`, data);
      } else {
        // Create
        await axios.post(API_BASE_URL, data);
      }
      setShowFormModal(false);
      setEditingInterface(undefined);
      await fetchData();
    } catch (error: any) {
      alert('Operation failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (intf: Interface) => {
    setEditingInterface(intf);
    setShowFormModal(true);
  };

  const openCreateModal = () => {
    setEditingInterface(undefined);
    setShowFormModal(true);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const protocolChartData = stats ? Object.entries(stats.protocolStats).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
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
              onClick={fetchData}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
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
                                onClick={() => retryTransaction(log.id)}
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
                  <button onClick={() => setActiveTab('interfaces')} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
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
                              onClick={() => executeInterface(intf.intfId)}
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
          )}

          {activeTab === 'interfaces' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Interface Management</h3>
                  <p className="text-sm text-slate-500 mt-1">Register and configure system interfaces.</p>
                </div>
                <button 
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                  <Plus size={18} /> Add Interface
                </button>
              </div>

              {/* Interface Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Protocol</th>
                      <th className="px-6 py-4">Endpoint</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {interfaces.map((intf) => (
                      <tr key={intf.intfId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{intf.intfId}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{intf.intfName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            intf.protType === 'REST' ? 'bg-blue-100 text-blue-700' :
                            intf.protType === 'SFTP' ? 'bg-amber-100 text-amber-700' :
                            intf.protType === 'BATCH' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {intf.protType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[200px]">{intf.endPoint}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {intf.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(intf)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors" 
                              title="Edit"
                            >
                              <Settings size={16} />
                            </button>
                            <button 
                              onClick={() => executeInterface(intf.intfId)}
                              disabled={executing === intf.intfId}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                              title="Run Now"
                            >
                              <Play size={16} fill="currentColor" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showFormModal && (
        <InterfaceForm 
          initialData={editingInterface}
          loading={loading}
          onSubmit={handleInterfaceSubmit}
          onCancel={() => setShowFormModal(false)}
        />
      )}

      {executionResult && (
        <ResponseViewer 
          data={executionResult}
          onClose={() => setExecutionResult(null)}
        />
      )}
    </div>
  );
}

export default App;
