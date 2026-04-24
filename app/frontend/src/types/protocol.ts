export type ProtocolType = 'SOAP' | 'SFTP' | 'MQ' | 'REST';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select' | 'textarea';
  required?: boolean;
  options?: { label: string; value: string | number }[];
}

export interface ProtocolSchema {
  protocolType: ProtocolType;
  configFields: FieldConfig[]; // 인터페이스 등록 시 설정
  argFields: FieldConfig[];    // 실행 시 입력할 인자
  supportsRawBody?: boolean;
}

// 프로토콜별 설정 정의
export const PROTOCOL_SCHEMAS: Record<ProtocolType, ProtocolSchema> = {
  SOAP: {
    protocolType: 'SOAP',
    configFields: [
      { name: 'wsdlUrl', label: 'WSDL URL', type: 'text', required: true },
      { name: 'operation', label: 'Operation', type: 'text', required: true },
      { name: 'namespace', label: 'Namespace (Optional)', type: 'text', required: false }
    ],
    argFields: [
      { name: 'input', label: 'Input Data', type: 'text', required: true }
    ],
    supportsRawBody: true
  },
  SFTP: {
    protocolType: 'SFTP',
    configFields: [
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'remoteDir', label: 'Remote Directory', type: 'text', required: false },
      { name: 'fileName', label: 'File Name', type: 'text', required: false }
    ],
    argFields: [
      { name: 'content', label: 'File Content', type: 'text', required: true }
    ]
  },
  MQ: {
    protocolType: 'MQ',
    configFields: [
      { name: 'queueName', label: 'Queue Name', type: 'text', required: true }
    ],
    argFields: [
      { name: 'message', label: 'Message Body', type: 'text', required: true }
    ]
  },
  REST: {
    protocolType: 'REST',
    configFields: [
      { name: 'url', label: 'URL', type: 'text', required: true },
      { name: 'method', label: 'Method', type: 'select', options: [{label: 'GET', value: 'GET'}, {label: 'POST', value: 'POST'}], required: true }
    ],
    argFields: [
      { name: 'body', label: 'Request Body (JSON)', type: 'text', required: false }
    ],
    supportsRawBody: true
  }
};
