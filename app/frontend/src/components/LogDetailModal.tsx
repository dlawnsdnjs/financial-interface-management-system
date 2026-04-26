import React from 'react';
import { X, Terminal } from 'lucide-react';

interface LogDetailModalProps {
  log: any;
  onClose: () => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
  
  const formatData = (data: string | null) => {
    if (!data) return 'N/A';
    try {
      const trimmed = data.trim();
      // JSON
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      // XML (간단한 포맷터)
      if (trimmed.startsWith('<')) {
        let formatted = '';
        let indent = '';
        trimmed.split(/>\s*</).forEach(node => {
          if (node.match(/^\/\w/)) indent = indent.substring(2);
          formatted += indent + '<' + node + '>\n';
          if (node.match(/^<?\w[^>]*[^\/]$/)) indent += '  ';
        });
        return formatted.substring(1, formatted.length - 3);
      }
    } catch (e) { return data; }
    return data;
  };

  const copyToClipboard = (data: string | null) => {
    if (data) navigator.clipboard.writeText(data);
    alert('클립보드에 복사되었습니다.');
  };

  const payloadContent = formatData(log.payload);
  const responseContent = formatData(log.response);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <Terminal size={20} className="text-gray-500" />
            <h3 className="font-bold text-gray-900">상세 데이터 뷰어</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payload</p>
              <button onClick={() => copyToClipboard(log.payload)} className="text-xs text-blue-600 hover:underline">복사</button>
            </div>
            <pre className="p-3 bg-gray-900 text-green-400 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">{payloadContent}</pre>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Response</p>
              <button onClick={() => copyToClipboard(log.response)} className="text-xs text-blue-600 hover:underline">복사</button>
            </div>
            <pre className={`p-3 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap ${log.status === 'SUCCESS' ? 'bg-gray-100 text-gray-800' : 'bg-red-50 text-red-900'}`}>{responseContent}</pre>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-gray-800">닫기</button>
        </div>
      </div>
    </div>
  );
};
