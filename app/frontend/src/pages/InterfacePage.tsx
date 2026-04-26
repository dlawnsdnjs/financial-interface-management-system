import React, { useState, useEffect } from 'react';
import { PROTOCOL_SCHEMAS, ProtocolType } from '../types/protocol';
import { DynamicForm } from '../components/DynamicForm';
import { FileExplorer } from '../components/FileExplorer';
import { LogDetailModal } from '../components/LogDetailModal';
import { 
  getInterfaces, 
  createInterface, 
  updateInterface, 
  deleteInterface, 
  executeInterface, 
  InterfaceEntity,
  MessageLog 
} from '../services/apiService';
import { Play, Edit, Trash2, Plus, CheckCircle, AlertCircle, Info, Settings, Database } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const InterfacePage: React.FC = () => {
  const [interfaces, setInterfaces] = useState<InterfaceEntity[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [protocol, setProtocol] = useState<ProtocolType>('REST');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [argData, setArgData] = useState<Record<string, any>>({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [itemLoadingIds, setItemLoadingIds] = useState<number[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailLog, setDetailLog] = useState<MessageLog | null>(null);

  useEffect(() => {
    loadInterfaces();
  }, []);

  const handleSelectFiles = (remoteDir: string, fileNames: string[]) => {
    setFormData(prev => ({
      ...prev,
      remoteDir,
      fileName: fileNames.join(',')
    }));
  };

  const loadInterfaces = async () => {
    try {
      const data = await getInterfaces();
      setInterfaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load interfaces', error);
      setInterfaces([]);
    }
  };

  const handleEdit = (item: InterfaceEntity) => {
    if (!item) return;
    setEditingId(item.id!);
    setName(item.name || '');
    setDescription(item.description || '');
    setProtocol((item.protocolType as ProtocolType) || 'REST');
    setFormData(item.protocolConfig || {});
    setArgData(item.defaultArguments || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setProtocol('REST');
    setFormData({});
    setArgData({});
  };

  const handleSubmit = async () => {
    if (!name) return alert('이름을 입력하세요');
    setLoading(true);
    const payload: InterfaceEntity = { 
      name, 
      description,
      protocolType: protocol, 
      protocolConfig: formData,
      defaultArguments: argData,
      enabled: true
    };
    
    try {
      if (editingId) {
        await updateInterface(editingId, payload);
        setMessage({ text: '인터페이스가 성공적으로 수정되었습니다.', type: 'success' });
      } else {
        await createInterface(payload);
        setMessage({ text: '새로운 인터페이스가 등록되었습니다.', type: 'success' });
      }
      resetForm();
      loadInterfaces();
    } catch (error) {
      setMessage({ text: '작업 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await deleteInterface(id);
      loadInterfaces();
    } catch (error) {
      alert('삭제 실패');
    }
  };

  const handleExecute = async (item: InterfaceEntity, payload: any = null) => {
    if (!item?.id) return;
    setItemLoadingIds(prev => [...prev, item.id!]);
    try {
      const result = await executeInterface(item.id, payload);
      // 결과가 로그 데이터라면 모달로 표시
      if (result && typeof result === 'object' && ('status' in result || 'payload' in result)) {
        setDetailLog(result as MessageLog);
      } else {
        alert(`[${item.name}] 실행 완료`);
      }
    } catch (error: any) {
      alert(`[${item.name}] 실행 실패: ${error.message}`);
    } finally {
      setItemLoadingIds(prev => prev.filter(id => id !== item.id!));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkExecute = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length}개의 인터페이스를 백그라운드에서 일괄 실행하시겠습니까?`)) return;
    
    setBulkLoading(true);
    try {
      await fetch('http://localhost:8080/api/interfaces/execute-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedIds)
      });
      alert(`${selectedIds.length}개의 인터페이스 일괄 실행이 완료되었습니다.`);
      setSelectedIds([]);
    } catch (e: any) {
      alert('일괄 실행 실패: ' + e.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const currentSchema = PROTOCOL_SCHEMAS[protocol] || PROTOCOL_SCHEMAS['REST'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">인터페이스 관리</h1>
          <p className="text-gray-500 text-sm mt-1">시스템 간 데이터 연동을 위한 프로토콜 및 엔드포인트를 설정합니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          {editingId ? <Edit size={18} className="text-blue-600" /> : <Plus size={18} className="text-orange-600" />}
          <h2 className="text-base font-bold text-gray-800">
            {editingId ? '인터페이스 구성 편집' : '신규 인터페이스 생성'}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">인터페이스 명칭</label>
              <input 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all text-sm" 
                placeholder="예: ERP 고객 데이터 연동" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">통신 프로토콜</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all text-sm" 
                value={protocol} 
                onChange={(e) => {
                  const nextProtocol = e.target.value as ProtocolType;
                  setProtocol(nextProtocol);
                  setFormData(prev => ({ protocol: prev.protocol || 'SFTP' }));
                  setArgData({});
                }}
              >
                {Object.keys(PROTOCOL_SCHEMAS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">상세 설명</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all text-sm" 
              placeholder="해당 인터페이스의 용도 및 특이사항을 입력하세요." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-5 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                <Settings size={16} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700">연결 구성 ({protocol})</h3>
              </div>
              <DynamicForm fields={currentSchema.configFields || []} onChange={setFormData} initialData={formData} />
              {protocol === 'FILE' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <FileExplorer 
                    config={formData} 
                    onSelect={handleSelectFiles} 
                  />
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-5 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                <Database size={16} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700">기본 실행 파라미터</h3>
              </div>
              <DynamicForm 
                fields={currentSchema.argFields || []} 
                onChange={setArgData} 
                initialData={{ ...formData, ...argData }} 
                supportsRawBody={currentSchema.supportsRawBody}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex-1">
              {message && (
                <div className={`text-sm flex items-center gap-2 font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {editingId && (
                <button 
                  className="px-6 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors" 
                  onClick={resetForm}
                >
                  변경 취소
                </button>
              )}
              <button 
                className={`px-8 py-2 rounded text-white text-sm font-bold shadow-sm transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}`} 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '처리 중...' : (editingId ? '구성 업데이트' : '인터페이스 생성')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-800">등록된 인터페이스 목록 ({interfaces.length})</h2>
          </div>
          {selectedIds.length > 0 && (
            <button 
              className={`px-4 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${bulkLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              onClick={handleBulkExecute}
              disabled={bulkLoading}
            >
              {bulkLoading ? '처리 중...' : `일괄 실행 (${selectedIds.length})`}
            </button>
          )}
        </div>
        
        {interfaces.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-3 w-10 text-center"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? interfaces.map(i => i.id!) : [])} checked={selectedIds.length === interfaces.length && interfaces.length > 0} /></th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider">이름 / 식별자</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-center">프로토콜</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interfaces.map(item => (
                  <tr key={item?.id || Math.random()} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 w-10 text-center"><input type="checkbox" checked={selectedIds.includes(item.id!)} onChange={() => toggleSelect(item.id!)} /></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item?.name || 'Untitled'}</span>
                        <span className="text-xs text-gray-400 truncate max-w-xs">{item?.description || 'No description provided'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase">{item?.protocolType || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button 
                          title="즉시 실행"
                          className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors" 
                          onClick={() => handleExecute(item)} 
                          disabled={itemLoadingIds.includes(item.id!)}
                        >
                          {itemLoadingIds.includes(item.id!) ? '...' : <Play size={18} fill="currentColor" />}
                        </button>
                        <button 
                          title="편집"
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-all" 
                          onClick={() => handleEdit(item)}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          title="삭제"
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors" 
                          onClick={() => handleDelete(item.id!)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState 
              icon={Info} 
              title="데이터가 비어있습니다" 
              description="상단의 폼을 사용하여 첫 번째 인터페이스를 등록해보세요."
            />
          </div>
        )}
      </div>

      {detailLog && (
        <LogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />
      )}
    </div>
  );
};

export default InterfacePage;
