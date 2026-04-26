import React, { useState } from 'react';
import { FieldConfig } from '../types/protocol';

interface DynamicFormProps {
  fields: FieldConfig[];
  onChange: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  supportsRawBody?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ fields, onChange, initialData = {}, supportsRawBody }) => {
  const [isRaw, setIsRaw] = useState(false);

  const handleChange = (name: string, value: any) => {
    onChange({ ...initialData, [name]: value });
  };

  return (
    <div className="space-y-4">
      {supportsRawBody && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRaw}
              onChange={(e) => setIsRaw(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-semibold text-gray-700">Raw 데이터 모드 사용 (SOAP XML / JSON 등)</span>
          </label>
        </div>
      )}

      {supportsRawBody && isRaw ? (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">Raw Request Body</label>
          <p className="text-xs text-gray-500 mb-2">서버로 직접 전송할 데이터를 입력하세요.</p>
          <textarea
            className="border p-3 rounded h-48 font-mono text-sm"
            placeholder="예: <soap:Envelope>...</soap:Envelope> 또는 { ... }"
            value={initialData.rawBody || ''}
            onChange={(e) => handleChange('rawBody', e.target.value)}
          />
        </div>
      ) : (
        fields
          .filter(field => {
            if (field.visibleIf) return field.visibleIf(initialData);
            if (field.visibleWhen) {
                // 간단한 조건식 평가: key.includes("value") 형태 지원
                const match = field.visibleWhen.match(/(\w+)\.includes\("(\w+)"\)/);
                if (match) {
                    const [_, key, value] = match;
                    return Array.isArray(initialData[key]) && initialData[key].includes(value);
                }
            }
            return true;
          })
          .map((field: FieldConfig) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">{field.label}</label>
            {field.helper && <p className="text-xs text-gray-500 mb-1">{field.helper}</p>}
            
            {field.type === 'select' ? (
              <select
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
                value={initialData[field.name] || field.default || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">선택하세요</option>
                {field.options?.map(opt => {
                  const label = typeof opt === 'string' ? opt : opt.label;
                  const value = typeof opt === 'string' ? opt : opt.value;
                  return <option key={value} value={value}>{label}</option>;
                })}
              </select>
            ) : field.type === 'multiselect' ? (
              <div className="flex gap-4 p-2 border rounded">
                {(field.options || []).map(opt => {
                  const label = typeof opt === 'string' ? opt : opt.label;
                  const value = typeof opt === 'string' ? opt : opt.value;
                  const selectedValues = Array.isArray(initialData[field.name]) ? initialData[field.name] : (Array.isArray(field.default) ? [...field.default] : []);
                  return (
                    <label key={value} className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedValues.includes(value)}
                        onChange={(e) => {
                          const next = e.target.checked 
                            ? [...selectedValues, value]
                            : selectedValues.filter((v: any) => v !== value);
                          handleChange(field.name, next);
                        }}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            ) : field.type === 'textarea' ? (
              <textarea
                className="border p-2 rounded h-32 focus:ring-2 focus:ring-blue-500"
                value={initialData[field.name] || field.default || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : field.type === 'file' ? (
              <div className="space-y-2 border p-3 rounded bg-white">
                {initialData[field.name]?.name && (
                  <p className="text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded">
                    📂 선택된 파일: {initialData[field.name].name}
                  </p>
                )}
                <input
                  type="file"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        handleChange(field.name, {
                          name: file.name,
                          content: base64.split(',')[1]
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            ) : (
              <input
                type={field.type}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
                value={initialData[field.name] || field.default || ''}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};
