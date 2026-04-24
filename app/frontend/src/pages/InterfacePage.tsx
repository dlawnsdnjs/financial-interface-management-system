import React, { useState } from 'react';
import { PROTOCOL_SCHEMAS, ProtocolType } from '../types/protocol';
import { DynamicForm } from '../components/DynamicForm';

const InterfacePage: React.FC = () => {
  const [protocol, setProtocol] = useState<ProtocolType>('SOAP');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const payload = { name, protocolType: protocol, protocolConfig: formData };
    await fetch('/api/interfaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert('저장 완료');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">인터페이스 등록</h1>
      <input 
        className="border p-2 w-full mb-4" 
        placeholder="인터페이스 이름" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <select className="border p-2 w-full mb-4" value={protocol} onChange={(e) => setProtocol(e.target.value as ProtocolType)}>
        {Object.keys(PROTOCOL_SCHEMAS).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <DynamicForm schema={PROTOCOL_SCHEMAS[protocol]} onChange={setFormData} initialData={formData} />
      <button className="bg-blue-500 text-white p-2 mt-4 rounded" onClick={handleSubmit}>저장</button>
    </div>
  );
};

export default InterfacePage;
