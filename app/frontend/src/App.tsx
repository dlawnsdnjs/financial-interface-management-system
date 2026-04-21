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
  Search
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

const API_BASE = 'http://localhost:8080/api/v1';

const App = () => {
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInterface, setNewInterface] = useState({
    intfId: '',
    intfName: '',
    protType: 'REST',
    endPoint: '',
    status: 'ACTIVE'
  });

  const statsData = [
    { name: '09:00', tps: 45 },
    { name: '10:00', tps: 52 },
    { name: '11:00', tps: 48 },
    { name: '12:00', tps: 61 },
    { name: '13:00', tps: 55 },
    { name: '14:00', tps: 67 },
  ];

  useEffect(() => {
    fetchInterfaces();
  }, []);

  const fetchInterfaces = async () => {
    try {
      const res = await axios.get(`${API_BASE}/interfaces`);
      setInterfaces(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/interfaces`, newInterface);
      setIsModalOpen(false);
      setNewInterface({
        intfId: '',
        intfName: '',
        protType: 'REST',
        endPoint: '',
        status: 'ACTIVE'
      });
      fetchInterfaces();
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const handleExecute = async (intfId) => {
    setExecuting(intfId);
    setLastResult(null);
    try {
      const res = await axios.post(`${API_BASE}/interfaces/${intfId}/execute`);
      setLastResult(res.data);
    } catch (err) {
      setLastResult({ status: 'FAIL', msg: '백엔드 서버 연결 오류', intfId });
    }
    setExecuting(null);
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
            <div className="flex items-center gap-3 text-blue-400 bg-blue-400/10 p-2 rounded cursor-pointer">
              <LayoutDashboard size={20} /> 대시보드
            </div>
            <div className="flex items-center gap-3 text-slate-400 p-2 hover:text-white cursor-pointer transition">
              <Settings size={20} /> 환경 설정
            </div>
            <div className="flex items-center gap-3 text-slate-400 p-2 hover:text-white cursor-pointer transition">
              <Database size={20} /> 트랜잭션 로그
            </div>
          </nav>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:ml-64 flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">인터페이스 통합 관제 센터</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="인터페이스 검색..." 
                  className="pl-10 pr-4 py-2 bg-white border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition font-bold"
              >
                + 신규 등록
              </button>
            </div>
          </header>

          {/* 등록 모달 */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-900">신규 인터페이스 등록</h3>
                  <p className="text-slate-500 text-sm">시스템 간 연동을 위한 상세 설정을 입력하세요.</p>
                </div>
                <form onSubmit={handleRegister} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">인터페이스 ID</label>
                    <input 
                      required
                      type="text" 
                      placeholder="예: INTF-101"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newInterface.intfId}
                      onChange={(e) => setNewInterface({...newInterface, intfId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">인터페이스 명칭</label>
                    <input 
                      required
                      type="text" 
                      placeholder="예: 대외기관 거래 내역 연동"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newInterface.intfName}
                      onChange={(e) => setNewInterface({...newInterface, intfName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">프로토콜</label>
                      <select 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newInterface.protType}
                        onChange={(e) => setNewInterface({...newInterface, protType: e.target.value})}
                      >
                        <option value="REST">REST (JSON)</option>
                        <option value="SOAP">SOAP (XML)</option>
                        <option value="MQ">MQ (Message)</option>
                        <option value="SFTP">SFTP (File)</option>
                        <option value="BATCH">BATCH (Job)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">초기 상태</label>
                      <select 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newInterface.status}
                        onChange={(e) => setNewInterface({...newInterface, status: e.target.value})}
                      >
                        <option value="ACTIVE">활성 (Active)</option>
                        <option value="INACTIVE">비활성 (Inactive)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">엔드포인트 URL</label>
                    <input 
                      required
                      type="text" 
                      placeholder="https://api.example.com/v1"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newInterface.endPoint}
                      onChange={(e) => setNewInterface({...newInterface, endPoint: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      취소
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition"
                    >
                      등록하기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 주요 통계 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-slate-500 text-sm mb-2 font-medium">실시간 성공률</h3>
              <div className="text-3xl font-bold text-green-600">99.8%</div>
              <div className="text-xs text-slate-400 mt-2">전일 대비 +0.2% 상승</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-slate-500 text-sm mb-2 font-medium">현재 처리 TPS</h3>
              <div className="text-3xl font-bold">45.2 <span className="text-lg font-normal text-slate-400">/sec</span></div>
              <div className="h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <Bar dataKey="tps" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-slate-500 text-sm mb-2 font-medium">금일 장애 건수</h3>
              <div className="text-3xl font-bold text-red-500">12 <span className="text-lg font-normal text-slate-400">건</span></div>
              <button className="text-xs text-blue-600 mt-2 hover:underline font-bold">장애 상세 보기 &rarr;</button>
            </div>
          </div>

          {/* 인터페이스 목록 테이블 */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-lg">인터페이스 관리 현황</h3>
              <button onClick={fetchInterfaces} className="text-slate-400 hover:text-blue-600 transition">
                <RefreshCcw size={18} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">인터페이스 명칭</th>
                    <th className="p-4 font-semibold">프로토콜</th>
                    <th className="p-4 font-semibold">운영 상태</th>
                    <th className="p-4 font-semibold">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-400">데이터를 불러오는 중...</td></tr>
                  ) : (
                    interfaces.map((intf) => (
                      <tr key={intf.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono text-sm text-blue-600 font-medium">{intf.intfId}</td>
                        <td className="p-4 font-semibold text-slate-700">{intf.intfName}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            intf.protType === 'REST' ? 'bg-blue-100 text-blue-700' :
                            intf.protType === 'SOAP' ? 'bg-purple-100 text-purple-700' :
                            intf.protType === 'MQ' ? 'bg-orange-100 text-orange-700' :
                            intf.protType === 'SFTP' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {intf.protType}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium">정상 가동 중</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button 
                            disabled={executing === intf.intfId}
                            onClick={() => handleExecute(intf.intfId)}
                            className={`flex items-center gap-2 text-sm font-extrabold px-3 py-1.5 rounded-lg border transition shadow-sm ${
                              executing === intf.intfId 
                                ? 'bg-slate-100 text-slate-300' 
                                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400'
                            }`}
                          >
                            {executing === intf.intfId ? <RefreshCcw size={14} className="animate-spin" /> : <Play size={14} />}
                            실행 테스트
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 실행 결과 모달 시뮬레이션 */}
          {lastResult && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-2xl border-2 border-blue-500/20 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                {lastResult.status === 'SUCCESS' ? (
                  <CheckCircle2 className="text-green-500" size={24} />
                ) : (
                  <AlertCircle className="text-red-500" size={24} />
                )}
                <h4 className="font-bold text-xl">트랜잭션 실행 결과: {lastResult.intfId}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-slate-50 p-6 rounded-xl">
                <div>
                  <p className="text-slate-400 mb-1">상태</p>
                  <p className={`text-lg font-black ${lastResult.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                    {lastResult.status}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">응답 속도</p>
                  <p className="text-lg font-black text-slate-700">{lastResult.latency || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 mb-1">응답 메시지</p>
                  <p className="text-lg font-medium text-slate-700">{lastResult.msg}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
