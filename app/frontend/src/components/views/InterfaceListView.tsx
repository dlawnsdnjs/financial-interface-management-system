import React from 'react';
import { Plus, Settings, Play } from 'lucide-react';
import { Interface } from '../../types';

interface InterfaceListViewProps {
  interfaces: Interface[];
  executing: string | null;
  onOpenCreate: () => void;
  onOpenEdit: (intf: Interface) => void;
  onExecute: (id: string) => void;
}

const InterfaceListView: React.FC<InterfaceListViewProps> = ({
  interfaces,
  executing,
  onOpenCreate,
  onOpenEdit,
  onExecute
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">인터페이스 관리</h3>
          <p className="text-sm text-slate-500 mt-1">시스템 인터페이스를 등록하고 설정합니다.</p>
        </div>
        <button 
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> 인터페이스 추가
        </button>
      </div>

      {/* Interface Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">인터페이스명</th>
              <th className="px-6 py-4">프로토콜</th>
              <th className="px-6 py-4">엔드포인트</th>
              <th className="px-6 py-4">상태</th>
              <th className="px-6 py-4 text-center">작업</th>
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
                      onClick={() => onOpenEdit(intf)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors" 
                      title="수정"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={() => onExecute(intf.intfId)}
                      disabled={executing === intf.intfId}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                      title="즉시 실행"
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
  );
};

export default InterfaceListView;
