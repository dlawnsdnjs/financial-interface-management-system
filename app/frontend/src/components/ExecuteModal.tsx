import React, { useState } from 'react';
import { ProtocolSchema } from '../types/protocol';
import { DynamicForm } from './DynamicForm';

interface ExecuteModalProps {
  schema: ProtocolSchema;
  onExecute: (data: Record<string, any>) => void;
  onClose: () => void;
}

export const ExecuteModal: React.FC<ExecuteModalProps> = ({ schema, onExecute, onClose }) => {
  const [args, setArgs] = useState<Record<string, any>>({});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-lg font-bold mb-4">인터페이스 실행 ({schema.protocolType})</h2>
        <DynamicForm 
          fields={schema.argFields} 
          onChange={setArgs} 
          initialData={args} 
          supportsRawBody={schema.supportsRawBody} 
        />
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 border rounded hover:bg-gray-100" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => onExecute(args)}>실행</button>
        </div>
      </div>
    </div>
  );
};
