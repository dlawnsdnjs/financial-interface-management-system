import React, { useState, useEffect } from 'react';
import { PROTOCOL_SCHEMAS, ProtocolType } from '../types/protocol';
import { DynamicForm } from '../components/DynamicForm';
import { 
  getInterfaces, 
  createInterface, 
  updateInterface, 
  deleteInterface, 
  executeInterface, 
  InterfaceEntity 
} from '../services/apiService';
import { Play, Edit, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react';

const InterfacePage: React.FC = () => {
  const [interfaces, setInterfaces] = useState<InterfaceEntity[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [protocol, setProtocol] = useState<ProtocolType>('REST');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [argData, setArgData] = useState<Record<string, any>>({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadInterfaces();
  }, []);

  const loadInterfaces = async () => {
    try {
      const data = await getInterfaces();
      setInterfaces(data);
    } catch (error) {
      console.error('Failed to load interfaces', error);
    }
  };

  const handleEdit = (item: InterfaceEntity) => {
    setEditingId(item.id!);
    setName(item.name);
    setDescription(item.description || '');
    setProtocol(item.protocolType as ProtocolType);
    setFormData(item.protocolConfig);
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
        setMessage({ text: '수정 완료', type: 'success' });
      } else {
        await createInterface(payload);
        setMessage({ text: '저장 완료', type: 'success' });
      }
      resetForm();
      loadInterfaces();
    } catch (error) {
      setMessage({ text: '작업 실패', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteInterface(id);
      loadInterfaces();
    } catch (error) {
      alert('삭제 실패');
    }
  };

  const handleExecute = async (item: InterfaceEntity) => {
    try {
      setLoading(true);
      const result = await executeInterface(item.id!, null);
      
      // 파일 다운로드 처리
      if (result && typeof result === 'object' && result.type === 'file') {
        const { fileName, content } = result;
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/octet-stream' });
        
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        
        alert('파일 다운로드 완료: ' + fileName);
      } else {
        const displayResult = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
        alert('실행 성공:\n' + displayResult);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data 
        ? (typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : error.response.data)
        : error.message;
      alert('실행 실패:\n' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {editingId ? <Edit size={24} /> : <Plus size={24} />}
          {editingId ? '인터페이스 수정' : '새 인터페이스 등록'}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">인터페이스 이름</label>
            <input 
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="예: 고객 정보 동기화" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">프로토콜 타입</label>
            <select 
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              value={protocol} 
              onChange={(e) => {
                setProtocol(e.target.value as ProtocolType);
                setFormData({});
                setArgData({});
              }}
            >
              {Object.keys(PROTOCOL_SCHEMAS).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">설명</label>
          <input 
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="인터페이스에 대한 설명을 입력하세요" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">상세 설정 ({protocol})</h2>
            <DynamicForm fields={PROTOCOL_SCHEMAS[protocol].configFields} onChange={setFormData} initialData={formData} />
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">실행 인자값 (저장된 값으로 실행됨)</h2>
            <DynamicForm 
              fields={PROTOCOL_SCHEMAS[protocol].argFields} 
              onChange={setArgData} 
              initialData={argData} 
              supportsRawBody={PROTOCOL_SCHEMAS[protocol].supportsRawBody}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            className={`flex-1 py-2 rounded text-white font-medium flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '처리 중...' : (editingId ? '수정하기' : '등록하기')}
          </button>
          {editingId && (
            <button 
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100" 
              onClick={resetForm}
            >
              취소
            </button>
          )}
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
              <th className="p-4 font-semibold">이름</th>
              <th className="p-4 font-semibold">프로토콜</th>
              <th className="p-4 font-semibold text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {interfaces.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-xs font-semibold uppercase">{item.protocolType}</td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded" onClick={() => handleExecute(item)} disabled={loading}><Play size={18} /></button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" onClick={() => handleEdit(item)}><Edit size={18} /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(item.id!)}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterfacePage;
