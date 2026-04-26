import React, { useState, useEffect } from 'react';
import { getInterfaces, getInterfaceLogs, getInterfaceStats, InterfaceEntity, MessageLog } from '../services/apiService';
import { Activity, Clock, Search, ChevronRight, CheckCircle, AlertCircle, BarChart3, Eye, X, Terminal, ArrowRight } from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../components/Skeleton';

export const HistoryPage: React.FC = () => {
  const [interfaces, setInterfaces] = useState<InterfaceEntity[]>([]);
  const [selectedIntf, setSelectedIntf] = useState<InterfaceEntity | null>(null);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailLog, setDetailLog] = useState<MessageLog | null>(null);

  useEffect(() => {
    loadInterfaces();
  }, []);

  const loadInterfaces = async () => {
    try {
      const data = await getInterfaces();
      setInterfaces(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectInterface = async (intf: InterfaceEntity) => {
    setSelectedIntf(intf);
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        getInterfaceLogs(intf.id!),
        getInterfaceStats(intf.id!)
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const safeDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">인터페이스 이력 및 성능 관리</h1>
        <p className="text-gray-500 text-sm mt-1">개별 인터페이스의 실행 로그와 평균 응답 속도를 분석합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Interface List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <h2 className="text-sm font-bold text-gray-700">인터페이스 선택</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
              {interfaces.map(intf => (
                <button
                  key={intf.id}
                  onClick={() => handleSelectInterface(intf)}
                  className={`w-full p-4 text-left flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedIntf?.id === intf.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{intf.name}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-black">{intf.protocolType}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Detailed Logs & Stats */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedIntf ? (
            <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
              <Activity size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-center">좌측 목록에서 분석할 인터페이스를 선택해 주세요.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">성공 횟수</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-green-600">{stats?.SUCCESS || 0}</span>
                    <CheckCircle size={20} className="text-green-200" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">실패 횟수</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-red-600">{stats?.FAIL || 0}</span>
                    <AlertCircle size={20} className="text-red-200" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">평균 응답 속도</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-600">{stats?.AVG_TIME || 0} <span className="text-xs font-medium">ms</span></span>
                    <BarChart3 size={20} className="text-blue-200" />
                  </div>
                </div>
              </div>

              {/* Log Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-700">전체 실행 이력</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3">실행 일시</th>
                        <th className="px-6 py-3 text-center">상태</th>
                        <th className="px-6 py-3 text-right">소요 시간</th>
                        <th className="px-6 py-3 text-right">상세</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <>
                          <TableRowSkeleton />
                          <TableRowSkeleton />
                          <TableRowSkeleton />
                        </>
                      ) : logs.length > 0 ? (
                        logs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{safeDate(log.createdAt)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-xs">
                              {log.executionTimeMs ? `${log.executionTimeMs}ms` : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => setDetailLog(log)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">실행 이력이 존재하지 않습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal (Reuse from Dashboard) */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">상세 로그 데이터</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${detailLog.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {detailLog.status}
                </span>
              </div>
              <button onClick={() => setDetailLog(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Payload</p>
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">{detailLog.payload || 'N/A'}</pre>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Response / Error</p>
                  <pre className={`p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap ${detailLog.status === 'SUCCESS' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                    {detailLog.status === 'SUCCESS' ? (detailLog.response || 'No response captured') : detailLog.errorMessage}
                  </pre>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setDetailLog(null)} className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
