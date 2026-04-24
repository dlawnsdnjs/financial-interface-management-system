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
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRaw}
            onChange={(e) => setIsRaw(e.target.checked)}
            id="raw-toggle"
          />
          <label htmlFor="raw-toggle" className="text-sm">Raw 모드 (직접 입력)</label>
        </div>
      )}

      {isRaw ? (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Raw Request Body</label>
          <p className="text-xs text-gray-500 mb-2">SOAP Envelope을 포함한 전체 XML 전문을 입력하세요.</p>
          <textarea
            className="border p-2 rounded h-40 font-mono"
            placeholder="<soap:Envelope ...> ... </soap:Envelope>"
            value={initialData.rawBody || ''}
            onChange={(e) => handleChange('rawBody', e.target.value)}
          />
        </div>
      ) : (
        fields.map((field: FieldConfig) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-sm font-medium mb-1">{field.label}</label>
            {field.type === 'select' ? (
              <select
                className="border p-2 rounded"
                value={initialData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">선택하세요</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                className="border p-2 rounded h-40"
                value={initialData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : (
              <input
                type={field.type}
                className="border p-2 rounded"
                value={initialData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};
