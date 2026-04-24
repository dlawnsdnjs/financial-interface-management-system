export type ProtocolType = 'SOAP' | 'SFTP' | 'MQ' | 'REST';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select';
  required?: boolean;
  options?: { label: string; value: string | number }[];
}

export interface ProtocolSchema {
  protocolType: ProtocolType;
  fields: FieldConfig[];
}

// 프로토콜별 설정 정의
export const PROTOCOL_SCHEMAS: Record<ProtocolType, ProtocolSchema> = {
  SOAP: {
    protocolType: 'SOAP',
    fields: [
      { name: 'wsdlUrl', label: 'WSDL URL', type: 'text', required: true },
      { name: 'operation', label: 'Operation', type: 'text', required: true }
    ]
  },
  SFTP: {
    protocolType: 'SFTP',
    fields: [
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true }
    ]
  },
  MQ: {
    protocolType: 'MQ',
    fields: [
      { name: 'queueName', label: 'Queue Name', type: 'text', required: true }
    ]
  },
  REST: {
    protocolType: 'REST',
    fields: [
      { name: 'url', label: 'URL', type: 'text', required: true },
      { name: 'method', label: 'Method', type: 'select', options: [{label: 'GET', value: 'GET'}, {label: 'POST', value: 'POST'}], required: true }
    ]
  }
};
