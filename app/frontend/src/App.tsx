import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Settings, 
  Play, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  LayoutDashboard,
  Database,
  Search,
  Plus,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip
} from 'recharts';

const API_BASE = 'http://localhost:8080/api/v1';

const App = () => {
  const [interfaces, setInterfaces] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    successRate: 0,
    totalCount: 0,
    errorCount: 0,
    recentLogs: []
  });
  const [newInterface, setNewInterface] = useState({
    intfId: '',
    intfName: '',
    protType: 'REST',
    endPoint: '',
    status: 'ACTIVE',
    parameters: [{ key: '', value: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchInterfaces(), fetchStats(), fetchLogs()]);
    setLoading(false);
  };

  const fetchInterfaces = async () => {
    try {
      const res = await axios.get(`${API_BASE}/interfaces`);
      setInterfaces(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/interfaces/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/interfaces/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const filteredParams = newInterface.parameters.filter(p => p.key && p.key.trim() !== '');
      const payload = { ...newInterface, parameters: filteredParams };
      await axios.post(`${API_BASE}/interfaces`, payload);
      setIsModalOpen(false);
      setNewInterface({
        intfId: '', intfName: '', protType: 'REST', endPoint: '', status: 'ACTIVE',
        parameters: [{ key: '', value: '' }]
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const [execConfigs, setExecConfigs] = useState({}); // { intfId: { method: 'GET', body: '' } }

  const handleExecute = async (intfId) => {
    setExecuting(intfId);
    setLastResult(null);
    
    const config = execConfigs[intfId] || { method: 'GET', body: '' };
    
    try {
      const res = await axios.post(`${API_BASE}/interfaces/${intfId}/execute`, 
        config.body ? JSON.parse(config.body) : null,
        { params: { method: config.method } }
      );
      setLastResult(res.data);
      fetchData();
    } catch (err) {
      setLastResult({ 
        status: 'FAIL', 
        msg: err.response?.data?.message || '연결 오류 또는 페이로드 형식 오류', 
        intfId 
      });
    }
    setExecuting(null);
  };

  const updateExecConfig = (intfId, field, value) => {
    setExecConfigs(prev => ({
      ...prev,
      [intfId]: { ...(prev[intfId] || { method: 'GET', body: '' }), [field]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex">
        {/* 사이드바 */}
        <div className="w-64 bg-slate-900 h-screen fixed p-6 text-white hidden lg:block">
          <div className="flex items-center gap-2 mb-10">
            <Activity className="text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">FIMS Pro</h1>
          </div>
          <nav className="space-y-4">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${activeTab === 'dashboard' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard size={20} /> 대시보드
            </div>
            <div 
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${activeTab === 'logs' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'}`}
            >
              <Database size={20} /> 트랜잭션 로그
            </div>
            <div className="flex items-center gap-3 text-slate-400 p-2 hover:text-white cursor-pointer transition">
              <Settings size={20} /> 환경 설정
            </div>
          </nav>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:ml-64 flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {activeTab === 'dashboard' ? '인터페이스 통합 관제 센터' : '트랜잭션 로그 분석'}
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={fetchData}
                className="p-2 text-slate-400 hover:text-blue-600 transition"
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition font-bold"
              >
                + 신규 등록
              </button>
            </div>
          </header>

          {activeTab === 'dashboard' ? (
            <>
              {/* 주요 통계 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-slate-500 text-sm mb-2 font-medium">실시간 성공률</h3>
                  <div className="text-3xl font-bold text-green-600">{stats.successRate}%</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-slate-500 text-sm mb-2 font-medium">누적 트랜잭션</h3>
                  <div className="text-3xl font-bold">{stats.totalCount}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-slate-500 text-sm mb-2 font-medium">금일 장애 건수</h3>
                  <div className="text-3xl font-bold text-red-500">{stats.errorCount}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-slate-500 text-sm mb-2 font-medium">최근 장애 알림</h3>
                  <div className="flex items-center gap-2 text-amber-600 font-bold">
                    <AlertCircle size={18} />
                    <span>정상 운용 중</span>
                  </div>
                </div>
              </div>

              {/* 인터페이스 목록 */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-bold text-lg">인터페이스 관리 현황</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="p-4 font-semibold">ID</th>
                        <th className="p-4 font-semibold">인터페이스 명칭</th>
                        <th className="p-4 font-semibold">프로토콜</th>
                        <th className="p-4 font-semibold">엔드포인트</th>
                        <th className="p-4 font-semibold">상태</th>
                        <th className="p-4 font-semibold">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {interfaces.map((intf) => (
                        <tr key={intf.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono text-sm text-blue-600 font-medium">{intf.intfId}</td>
                          <td className="p-4 font-semibold text-slate-700">{intf.intfName}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              intf.protType === 'REST' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {intf.protType}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500 truncate max-w-[200px]">{intf.endPoint}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${intf.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                              <span className="text-sm font-medium">{intf.status}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                <select 
                                  value={execConfigs[intf.intfId]?.method || 'GET'}
                                  onChange={(e) => updateExecConfig(intf.intfId, 'method', e.target.value)}
                                  className="text-xs border rounded p-1 bg-white"
                                >
                                  <option value="GET">GET</option>
                                  <option value="POST">POST</option>
                                </select>
                                <button 
                                  disabled={executing === intf.intfId}
                                  onClick={() => handleExecute(intf.intfId)}
                                  className="flex items-center gap-2 text-xs font-extrabold px-3 py-1 rounded-lg border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 transition"
                                >
                                  {executing === intf.intfId ? <RefreshCcw size={12} className="animate-spin" /> : <Play size={12} />}
                                  실행
                                </button>
                              </div>
                              {execConfigs[intf.intfId]?.method === 'POST' && (
                                <input 
                                  type="text"
                                  placeholder='JSON Payload'
                                  value={execConfigs[intf.intfId]?.body || ''}
                                  onChange={(e) => updateExecConfig(intf.intfId, 'body', e.target.value)}
                                  className="text-[10px] border rounded p-1 w-full"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* 로그 탭 */
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">전체 트랜잭션 로그</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="p-4 font-semibold">Trans ID</th>
                      <th className="p-4 font-semibold">Interface</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Latency</th>
                      <th className="p-4 font-semibold">Result Code</th>
                      <th className="p-4 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition text-sm">
                        <td className="p-4 font-mono text-xs text-slate-400">{log.transId.substring(0, 8)}...</td>
                        <td className="p-4 font-medium">{log.intfId}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{log.latencyMs}ms</td>
                        <td className="p-4 font-mono text-slate-500">{log.resultCode}</td>
                        <td className="p-4 text-slate-500">{new Date(log.startTime).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr><td colSpan={6} className="p-10 text-center text-slate-400">로그가 존재하지 않습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 실행 결과 알림 */}
          {lastResult && (
            <div className="fixed bottom-8 right-8 w-96 bg-white rounded-2xl shadow-2xl border-2 border-blue-500 p-6 animate-in slide-in-from-right duration-300 z-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {lastResult.status === 'SUCCESS' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                  <h4 className="font-bold">실행 완료: {lastResult.intfId}</h4>
                </div>
                <button onClick={() => setLastResult(null)} className="text-slate-400 hover:text-slate-600">×</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Trans ID</span>
                  <span className="font-mono text-xs">{lastResult.transId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Latency</span>
                  <span className="font-bold">{lastResult.latency}</span>
                </div>
                <div className="pt-2">
                  <p className="text-slate-500 mb-1">Response</p>
                  <p className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-700 break-all max-h-32 overflow-y-auto">
                    {lastResult.msg}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 등록 모달 (생략 - 기존 로직 유지하되 스타일만 통일) */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
};

export default App;
