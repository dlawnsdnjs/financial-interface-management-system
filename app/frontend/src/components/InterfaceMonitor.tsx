import React, { useState, useEffect } from 'react';
import { getInterfaceLogs, getInterfaceStats, retryInterface, InterfaceEntity, MessageLog } from '../services/apiService';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Activity, RotateCcw, Eye, X, Terminal, ArrowRight } from 'lucide-react';

interface MonitorProps {
  interfaceEntity: InterfaceEntity;
}

export const InterfaceMonitor: React.FC<MonitorProps> = ({ interfaceEntity }) => {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [stats, setStats] = useState({ SUCCESS: 0, FAIL: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MessageLog | null>(null);

  useEffect(() => {
    loadData();
  }, [interfaceEntity.id]);

  const loadData = async () => {
    if (!interfaceEntity.id) return;
    setLoading(true);
    try {
      const logsData = await getInterfaceLogs(interfaceEntity.id);
      const statsData = await getInterfaceStats(interfaceEntity.id);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setStats(statsData || { SUCCESS: 0, FAIL: 0 });
    } catch (error) {
      console.error('Failed to load monitor data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId: number) => {
    if (!confirm('해당 메시지를 재처리하시겠습니까?')) return;
    try {
      await retryInterface(logId);
      loadData();
    } catch (error) {
      alert('재처리 실패');
    }
  };

  const safeDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-500" />
          <h3 className="font-bold text-gray-800 text-sm">실시간 모니터링: {interfaceEntity.name}</h3>
        </div>
        <button 
          onClick={loadData} 
          className={`p-1.5 hover:bg-white border border-transparent hover:border-gray-200 rounded transition-all ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="p-5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">성공 이력</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-green-600">{(stats?.SUCCESS || 0).toLocaleString()}</span>
              <CheckCircle size={20} className="text-green-300" />
            </div>
          </div>
          <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">실패 이력</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-red-600">{(stats?.FAIL || 0).toLocaleString()}</span>
              <AlertCircle size={20} className="text-red-300" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            <Clock size={12} />
            최근 실행 로그
          </div>
          <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-md">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-10">
                <tr className="text-gray-500">
                  <th className="px-4 py-2 font-bold uppercase">시간</th>
                  <th className="px-4 py-2 font-bold uppercase">상태</th>
                  <th className="px-4 py-2 font-bold uppercase text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length > 0 ? (
                  logs.map((log: MessageLog) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-medium">{safeDate(log.createdAt)}</td>
                      <td className="px-4 py-3">
                        {log.status === 'SUCCESS' ? 
                          <span className="inline-flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                            SUCCESS
                          </span> : 
                          <span className="inline-flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                            FAILED
                          </span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedLog(log)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="응답 확인"
                          >
                            <Eye size={14} />
                          </button>
                          {log.status === 'FAIL' && (
                            <button 
                              onClick={() => handleRetry(log.id)} 
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-black uppercase tracking-tighter"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                      No execution logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal for InterfaceMonitor */}
      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-gray-500" />
                <h4 className="font-bold text-gray-900 text-sm">실행 로그 상세</h4>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payload (Request)</p>
                  <pre className="p-3 bg-gray-900 text-gray-100 rounded text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.payload || 'N/A'}
                  </pre>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Response (Result)</p>
                  <pre className={`p-3 rounded text-[11px] font-mono overflow-x-auto whitespace-pre-wrap ${
                    selectedLog.status === 'SUCCESS' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
                  }`}>
                    {selectedLog.status === 'SUCCESS' ? (selectedLog.response || 'No content') : selectedLog.errorMessage}
                  </pre>
               </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-1.5 bg-gray-900 text-white rounded text-xs font-bold hover:bg-black transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
