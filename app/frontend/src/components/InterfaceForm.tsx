import React, { useState, useEffect } from 'react';
import { XCircle, Database, ExternalLink, Send } from 'lucide-react';
import { Interface } from '../types';

interface InterfaceFormProps {
  initialData?: Interface;
  onSubmit: (data: Interface) => void;
  onCancel: () => void;
  loading: boolean;
}

const InterfaceForm: React.FC<InterfaceFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<Interface>({
    intfId: '',
    intfName: '',
    protType: 'REST',
    endPoint: '',
    parameters: [],
    status: 'ACTIVE'
  });

  const [protocolConfig, setProtocolConfig] = useState<any>({});

  // 프로토콜 변경 시 설정 초기화 및 동적 렌더링을 위한 설정
  const renderProtocolFields = () => {
    switch (formData.protType) {
      case 'REST':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Base URL / Path</label>
              <input type="text" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                     value={protocolConfig.baseUrl || ''} 
                     onChange={e => setProtocolConfig({...protocolConfig, baseUrl: e.target.value})} />
            </div>
          </>
        );
      case 'SOAP':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">WSDL URL</label>
              <input type="text" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                     value={protocolConfig.wsdlUrl || ''} 
                     onChange={e => setProtocolConfig({...protocolConfig, wsdlUrl: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Operation Name</label>
              <input type="text" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                     value={protocolConfig.operationName || ''} 
                     onChange={e => setProtocolConfig({...protocolConfig, operationName: e.target.value})} />
            </div>
          </>
        );
      case 'SFTP':
        return (
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Host:Port</label>
                <input type="text" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    value={protocolConfig.host || ''}
                    onChange={e => setProtocolConfig({...protocolConfig, host: e.target.value})} />
            </div>
        );
      default:
        return null;
    }
  };

  const addParameter = () => {
    setFormData({ ...formData, parameters: [...formData.parameters, { key: '', value: '' }] });
  };

  const removeParameter = (index: number) => {
    setFormData({ ...formData, parameters: formData.parameters.filter((_, i) => i !== index) });
  };

  const updateParameter = (index: number, field: 'key' | 'value', value: string) => {
    const newParameters = [...formData.parameters];
    newParameters[index][field] = value;
    setFormData({ ...formData, parameters: newParameters });
  };

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.parameters.some(p => !p.key.trim())) {
      alert("Parameter key cannot be empty.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{isEdit ? 'Update Interface' : 'New Interface'}</h3>
              <p className="text-xs text-slate-500">{isEdit ? `Modifying ${formData.intfId}` : 'Configure connection settings.'}</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Interface ID</label>
              <input 
                type="text" 
                placeholder="e.g., INTF-001"
                className={`p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
                disabled={isEdit}
                value={formData.intfId}
                onChange={e => setFormData({...formData, intfId: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Protocol</label>
              <select 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.protType}
                onChange={e => setFormData({...formData, protType: e.target.value})}
              >
                <option value="REST">REST API</option>
                <option value="SOAP">SOAP (XML)</option>
                <option value="MQ">MQ (Message)</option>
                <option value="SFTP">SFTP (File)</option>
                <option value="BATCH">Batch Job</option>
              </select>
            </div>
          </div>
          {renderProtocolFields()}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Interface Name</label>
            <input 
              type="text" 
              placeholder="Enter descriptive name"
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              value={formData.intfName}
              onChange={e => setFormData({...formData, intfName: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Endpoint / URL</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="https://api.provider.com/service"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
                value={formData.endPoint}
                onChange={e => setFormData({...formData, endPoint: e.target.value})}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Parameters</label>
              <button type="button" onClick={addParameter} className="text-xs text-blue-600 font-bold hover:underline">+ Add Parameter</button>
            </div>
            {formData.parameters.map((param, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" placeholder="Key" className="w-1/3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={param.key} onChange={e => updateParameter(index, 'key', e.target.value)}
                />
                <input 
                  type="text" placeholder="Value" className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={param.value} onChange={e => updateParameter(index, 'value', e.target.value)}
                />
                <button type="button" onClick={() => removeParameter(index)} className="text-red-500 font-bold px-2">×</button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Send size={16} /> {loading ? 'Processing...' : (isEdit ? 'Update Interface' : 'Register Interface')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterfaceForm;
