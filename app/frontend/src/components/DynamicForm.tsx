import React from 'react';
import { FieldConfig, ProtocolSchema } from '../types/protocol';

interface DynamicFormProps {
  schema: ProtocolSchema;
  onChange: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onChange, initialData = {} }) => {
  const handleChange = (name: string, value: any) => {
    onChange({ ...initialData, [name]: value });
  };

  return (
    <div className="space-y-4">
      {schema.fields.map((field: FieldConfig) => (
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
          ) : (
            <input
              type={field.type}
              className="border p-2 rounded"
              value={initialData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
