export type ProtocolType = 'SOAP' | 'FILE' | 'MQ' | 'REST';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select' | 'textarea' | 'file';
  required?: boolean;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  helpText?: string;
  visibleIf?: (data: Record<string, any>) => boolean;
}

export interface ProtocolSchema {
  protocolType: ProtocolType;
  configFields: FieldConfig[]; 
  argFields: FieldConfig[];    
  supportsRawBody?: boolean;
}

export const PROTOCOL_SCHEMAS: Record<ProtocolType, ProtocolSchema> = {
  SOAP: {
    protocolType: 'SOAP',
    configFields: [
      { name: 'wsdlUrl', label: 'Endpoint URL', type: 'text', required: true, placeholder: 'https://example.com/service.wso' },
      { name: 'soapAction', label: 'SOAPAction Header', type: 'text', required: false, placeholder: 'http://tempuri.org/OperationName' },
      { name: 'operation', label: 'Operation (Optional)', type: 'text', required: false },
      { name: 'namespace', label: 'Namespace (Optional)', type: 'text', required: false }
    ],
    argFields: [
      { name: 'input', label: 'Input Data', type: 'text', required: true }
    ],
    supportsRawBody: true
  },

  FILE: {
    protocolType: 'FILE',
    configFields: [
      { name: 'protocol', label: '프로토콜', type: 'select', required: true, options: [
          { label: 'SFTP', value: 'SFTP' },
          { label: 'FTP', value: 'FTP' }
        ]},
      { name: 'mode', label: '전송 모드', type: 'select', required: true, options: [
          { label: 'Upload (전송)', value: 'UPLOAD' },
          { label: 'Download (수신)', value: 'DOWNLOAD' }
        ]},
      { name: 'host', label: 'Host', type: 'text', required: true },
      { name: 'port', label: 'Port', type: 'number', required: true },
      { name: 'username', label: 'Username', type: 'text', required: true },
      {
        name: 'authType',
        label: '인증 방식',
        type: 'select',
        options: [
          { label: 'Password', value: 'PASSWORD' },
          { label: 'SSH Key', value: 'SSH_KEY' }
        ],
        visibleIf: (data) => data.protocol === 'SFTP'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: false,
        visibleIf: (data) => data.protocol === 'FTP' || (data.protocol === 'SFTP' && data.authType === 'PASSWORD')
      },
      {
        name: 'sshKeyType',
        label: 'SSH Key 입력 방식',
        type: 'select',
        options: [
          { label: '파일 선택 (Upload)', value: 'FILE' },
          { label: '직접 입력 (Text)', value: 'DIRECT' }
        ],
        visibleIf: (data) => data.protocol === 'SFTP' && data.authType === 'SSH_KEY'
      },
      {
        name: 'privateKeyFile',
        label: 'SSH Key 파일 선택',
        type: 'file',
        required: false,
        visibleIf: (data) => data.protocol === 'SFTP' && data.authType === 'SSH_KEY' && data.sshKeyType === 'FILE'
      },
      {
        name: 'privateKey',
        label: 'SSH Key 직접 입력',
        type: 'textarea',
        required: false,
        visibleIf: (data) => data.protocol === 'SFTP' && data.authType === 'SSH_KEY' && data.sshKeyType === 'DIRECT'
      },
      { name: 'remoteDir', label: '원격 디렉토리', type: 'text', required: false },
      { name: 'fileName', label: '파일명', type: 'text', required: false }
    ],
    argFields: [
      {
        name: 'file',
        label: '업로드할 파일 선택',
        type: 'file',
        required: false,
        visibleIf: (data) => data.mode === 'UPLOAD'
      }
    ]
  },

  MQ: {
    protocolType: 'MQ',
    configFields: [
      { name: 'mode', label: '모드', type: 'select', required: true, options: [{label: 'Subscriber (SUB)', value: 'SUB'}, {label: 'Publisher (PUB)', value: 'PUB'}] },
      { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '5672' },
      { name: 'vhost', label: 'VHost', type: 'text', required: false, placeholder: '/' },
      { name: 'username', label: 'Username', type: 'text', required: false },
      { name: 'password', label: 'Password', type: 'password', required: false },
      { name: 'queueName', label: 'Queue Name', type: 'text', required: true },
      // SUB 전용 필드
      { name: 'bindingKey', label: 'Binding Key', type: 'text', required: false, visibleIf: (d) => d.mode === 'SUB' },
      { name: 'ackMode', label: 'ACK 방식', type: 'select', options: [{label:'Manual', value:'manual'}, {label:'Auto', value:'auto'}], visibleIf: (d) => d.mode === 'SUB' },
      { name: 'prefetchCount', label: 'Prefetch Count', type: 'number', visibleIf: (d) => d.mode === 'SUB' },
      { name: 'dlqName', label: 'DLQ Name', type: 'text', visibleIf: (d) => d.mode === 'SUB' },
      // PUB 전용 필드
      { name: 'routingKey', label: 'Routing Key', type: 'text', required: false, visibleIf: (d) => d.mode === 'PUB' }
    ],
    argFields: [
      { name: 'message', label: 'Message Body', type: 'textarea', visibleIf: (d) => d.mode === 'PUB' }
    ]
  },

  REST: {
    protocolType: 'REST',
    configFields: [
      { name: 'url', label: '기본 URL (Base URL)', type: 'text', required: true,
        placeholder: 'https://api.example.com/v1/resource' },
      { name: 'method', label: 'HTTP 메서드', type: 'select', required: true,
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ]
      }
    ],
    argFields: [
      { name: 'params', label: '요청 데이터 (JSON)', type: 'textarea',
        placeholder: '{"key1": "value1", "key2": "value2"}' }
    ],
    supportsRawBody: true
  }
};