import React from 'react';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  help?: string;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, placeholder, defaultValue, type = 'text', help, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder={placeholder}
      defaultValue={defaultValue}
    />
    {help && <p className="text-xs text-gray-400">{help}</p>}
  </div>
);

interface SelectFieldProps {
  label: string;
  options: string[];
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, options }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
