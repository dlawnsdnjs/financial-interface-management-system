import React, { useState, useEffect } from 'react';
import { ProtocolSchema } from '../types/protocol';
import { apiService } from '../services/apiService';

interface FileProtocolModalProps {
  interfaceId: number;
  schema: ProtocolSchema;
  onExecute: (data: Record<string, any>) => void;
  onClose: () => void;
}

interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
}

export const FileProtocolModal: React.FC<FileProtocolModalProps> = ({ interfaceId, schema, onExecute, onClose }) => {
  const [mode, setMode] = useState<'UPLOAD' | 'DOWNLOAD'>('UPLOAD');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async (path: string = '/') => {
    setLoading(true);
    try {
      const result = await apiService.post(`/interfaces/${interfaceId}/ftp/list`, { remotePath: path });
      setFiles(result);
    } catch (err) {
      alert('파일 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleExecute = () => {
    onExecute({
      mode,
      selectedFiles,
      timestamp: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <div className="flex gap-4 mb-6 border-b pb-2">
          <button className={`pb-2 ${mode === 'UPLOAD' ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setMode('UPLOAD')}>업로드</button>
          <button className={`pb-2 ${mode === 'DOWNLOAD' ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setMode('DOWNLOAD')}>다운로드</button>
        </div>

        <div className="h-64 overflow-y-auto border rounded p-2 mb-4 bg-gray-50">
          {loading ? <p>로딩 중...</p> : files.map(f => (
            <div key={f.name} className="flex items-center gap-2 p-1 hover:bg-blue-100 cursor-pointer">
              <input type="checkbox" onChange={(e) => {
                if (e.target.checked) setSelectedFiles([...selectedFiles, f.name]);
                else setSelectedFiles(selectedFiles.filter(name => name !== f.name));
              }} />
              <span>{f.isDirectory ? '📁' : '📄'} {f.name}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleExecute}>
            {mode === 'UPLOAD' ? '업로드 실행' : '다운로드 실행'}
          </button>
        </div>
      </div>
    </div>
  );
};
