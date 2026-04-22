import React from 'react';
import { X, Copy, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

interface ResponseViewerProps {
  data: any;
  onClose: () => void;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ data, onClose }) => {
  const isSuccess = data.status === 'SUCCESS';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className={`p-6 flex items-center justify-between ${isSuccess ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {isSuccess ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isSuccess ? 'text-emerald-900' : 'text-rose-900'}`}>
                {isSuccess ? '실행 성공' : '실행 실패'}
              </h3>
              <p className={`text-xs ${isSuccess ? 'text-emerald-700' : 'text-rose-700'}`}>
                트랜잭션 ID: {data.transId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-1">
                <Clock size={12} /> 지연 시간
              </div>
              <div className="text-xl font-bold text-slate-800">{data.latency}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-1">
                <Zap size={12} /> 인터페이스 ID
              </div>
              <div className="text-xl font-bold text-slate-800">{data.intfId}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">응답 데이터 / 페이로드</label>
              <button 
                onClick={() => copyToClipboard(data.payload || data.msg)}
                className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
              >
                <Copy size={10} /> 결과 복사
              </button>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl text-emerald-400 font-mono text-sm h-48 overflow-y-auto shadow-inner border border-slate-800">
              <pre className="whitespace-pre-wrap">{data.payload || data.msg}</pre>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponseViewer;
