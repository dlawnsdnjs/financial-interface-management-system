import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
}

interface FileExplorerProps {
  config: Record<string, any>;
  onSelect: (remoteDir: string, fileName: string[]) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ config, onSelect }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(config.remoteDir || '/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async (path: string) => {
    if (!config.host || !config.username) {
        alert("호스트와 유저명을 입력하세요.");
        return;
    }
    setLoading(true);
    try {
      const result = await apiService.post(`/interfaces/ftp/list`, { config, remotePath: path });
      setFiles(Array.isArray(result) ? result : []);
      setCurrentPath(path);
    } catch (err: any) {
      alert('파일 목록 조회 실패: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (name: string) => {
    const next = selectedFiles.includes(name) 
      ? selectedFiles.filter(f => f !== name)
      : [...selectedFiles, name];
    setSelectedFiles(next);
    onSelect(currentPath, next);
  };

  return (
    <div className="border rounded p-4 bg-gray-50 mt-4">
      <div className="flex gap-2 mb-4">
        <input 
          className="flex-1 border p-2 rounded" 
          value={currentPath} 
          onChange={(e) => setCurrentPath(e.target.value)} 
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => fetchFiles(currentPath)}>탐색</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => onSelect(currentPath, selectedFiles)}>현재 경로 고정</button>
      </div>
      <div className="h-48 overflow-y-auto bg-white border p-2">
        {loading ? <p>로딩 중...</p> : files.map(f => (
          <div key={f.name} className="flex items-center gap-2 hover:bg-blue-50 cursor-pointer p-1">
            <input type="checkbox" checked={selectedFiles.includes(f.name)} onChange={() => toggleFile(f.name)} />
            <span onClick={() => f.isDirectory && fetchFiles(`${currentPath === '/' ? '' : currentPath}/${f.name}`)}>
              {f.isDirectory ? '📁' : '📄'} {f.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
