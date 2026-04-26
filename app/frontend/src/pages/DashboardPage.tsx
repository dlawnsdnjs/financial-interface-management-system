import React, { useState, useEffect } from 'react';
import { getInterfaces, getInterfaceStats, getRecentLogs, InterfaceEntity, retryInterface, MessageLog } from '../services/apiService';
import { RefreshCw, AlertTriangle, CheckCircle, AlertCircle, Info, Activity, Eye, X, Terminal, ArrowRight } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { CardSkeleton, TableRowSkeleton } from '../components/Skeleton';

export const DashboardPage: React.FC = () => {
  const [interfaces, setInterfaces] = useState<InterfaceEntity[]>([]);
  const [errors, setErrors] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MessageLog | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intfData, errData] = await Promise.all([getInterfaces(), getRecentLogs()]);
      setInterfaces(Array.isArray(intfData) ? intfData : []);
      setErrors(Array.isArray(errData) ? errData : []);
    } catch (err) {
      console.error("Dashboard data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const safeDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 통합 대시보드</h1>
          <p className="text-gray-500 text-sm mt-1">인터페이스 상태 및 실행 이력을 한눈에 확인합니다.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadData} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium" 
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">인터페이스 요약</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
          </div>
        ) : interfaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interfaces.map(i => <InterfaceSummaryCard key={i?.id || Math.random()} entity={i} />)}
          </div>
        ) : (
          <EmptyState 
            icon={Info} 
            title="등록된 인터페이스가 없습니다" 
            description="데이터 연동을 시작하려면 먼저 인터페이스를 등록해주세요."
            actionLabel="인터페이스 등록하기"
            actionPath="/"
          />
        )}
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-base font-bold text-gray-800">최근 실행 이력 (오류/성공)</h2>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">실시간 로깅</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-600 bg-gray-50">
                <th className="px-6 py-3 font-semibold">발생 시간</th>
                <th className="px-6 py-3 font-semibold text-center">상태</th>
                <th className="px-6 py-3 font-semibold">인터페이스 ID</th>
                <th className="px-6 py-3 font-semibold">내용 요약</th>
                <th className="px-6 py-3 font-semibold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : errors.length > 0 ? (
                errors.map(err => (
                  <tr key={err?.id || Math.random()} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {safeDate(err?.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${err?.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {err?.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{err?.interfaceId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium truncate max-w-xs ${err?.status === 'FAIL' ? 'text-red-600' : 'text-gray-600'}`}>
                          {err?.status === 'FAIL' ? err?.errorMessage : (err?.response || 'No response data')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedLog(err)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="상세 보기"
                        >
                          <Eye size={16} />
                        </button>
                        {err?.status === 'FAIL' && (
                          <button 
                            onClick={async () => { if(confirm('해당 건을 재처리하시겠습니까?')) { await retryInterface(err.id); loadData(); } }} 
                            className="text-blue-600 font-bold hover:underline text-xs"
                          >
                            재처리
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <CheckCircle size={32} />
                      <p className="font-medium">기록된 실행 이력이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">인터페이스 실행 상세 로그</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedLog.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedLog.status}
                </span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">인터페이스 ID</p>
                  <p className="font-bold text-gray-900">{selectedLog.interfaceId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">프로토콜</p>
                  <p className="font-bold text-gray-900 uppercase">{selectedLog.protocol}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">발생 시각</p>
                  <p className="font-bold text-gray-900">{safeDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <ArrowRight size={14} className="text-blue-500" />
                    전송 페이로드 (Request)
                  </div>
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {selectedLog.payload || '데이터 없음'}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <ArrowRight size={14} className={`text-${selectedLog.status === 'SUCCESS' ? 'green' : 'red'}-500`} />
                    수신 데이터 (Response / Result)
                  </div>
                  <pre className={`p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner ${
                    selectedLog.status === 'SUCCESS' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
                  }`}>
                    {selectedLog.status === 'SUCCESS' ? (selectedLog.response || 'No response content captured.') : selectedLog.errorMessage}
                  </pre>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-black transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InterfaceSummaryCard: React.FC<{ entity: InterfaceEntity }> = ({ entity }) => {
  const [stats, setStats] = useState({ SUCCESS: 0, FAIL: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (!entity?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getInterfaceStats(entity.id)
      .then(res => {
        if (res && typeof res === 'object') {
          setStats({
            SUCCESS: Number(res.SUCCESS || 0),
            FAIL: Number(res.FAIL || 0)
          });
        }
      })
      .catch(err => console.error("Stats load failed", err))
      .finally(() => setLoading(false)); 
  }, [entity?.id]);

  if (loading) return <CardSkeleton />;

  return (
    <div className="group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-default">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-2">{entity?.name || 'Unknown'}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter">{entity?.protocolType || 'N/A'}</span>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Success</p>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <span className="text-2xl font-black">{(stats.SUCCESS || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Failed</p>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <span className="text-2xl font-black">{(stats.FAIL || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
        <span>Availability</span>
        <span className="text-green-500">
          {stats.SUCCESS + stats.FAIL === 0 ? 'N/A' : `${((stats.SUCCESS / (stats.SUCCESS + stats.FAIL)) * 100).toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
};
