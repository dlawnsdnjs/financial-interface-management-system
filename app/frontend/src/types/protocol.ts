export type ProtocolType = 'SOAP' | 'FILE' | 'MQ' | 'REST' | 'BATCH';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select' | 'textarea' | 'file' | 'multiselect';
  required?: boolean;
  options?: ({ label: string; value: string | number } | string)[];
  placeholder?: string;
  helper?: string;
  visibleIf?: (data: Record<string, any>) => boolean;
  default?: any;
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
  },

  BATCH: {
    protocolType: 'BATCH',
    configFields: [
      // 기존
      { name: 'jobName', label: 'Batch Job Name', type: 'text', required: true, placeholder: 'StandardSettlementJob' },
      { name: 'cron', label: 'Cron Expression', type: 'text', required: true, placeholder: '0 0 0 * * ?',
        helper: '다음 실행: {cronPreview}' },  // cron 입력 시 다음 실행시각 실시간 표시
      { name: 'timezone', label: 'Timezone', type: 'select', required: true,
        options: ['Asia/Seoul', 'UTC'], default: 'Asia/Seoul' },
      { name: 'description', label: 'Job Description', type: 'text' },

      // 입출력 설정
      { name: 'inputPath',    label: 'Input Path',    type: 'text', required: false, placeholder: '/data/input/settlement/' },
      { name: 'outputPath',   label: 'Output Path',   type: 'text', required: false, placeholder: '/data/output/settlement/' },
      { name: 'filePattern',  label: 'File Pattern',  type: 'text', required: false, placeholder: 'STTL_yyyyMMdd_*.csv' },
      { name: 'encoding',     label: 'File Encoding', type: 'select',
        options: ['UTF-8', 'EUC-KR', 'CP949'], default: 'UTF-8' },

      // 처리 설정
      { name: 'chunkSize',   label: 'Chunk Size',      type: 'number', required: true, default: 1000,
        helper: '한 트랜잭션에서 처리할 건수' },
      { name: 'retryLimit',  label: 'Retry Limit',     type: 'number', required: true, default: 3 },
      { name: 'skipLimit',   label: 'Skip Limit',      type: 'number', required: true, default: 10,
        helper: '허용 오류 건수 초과 시 Job 실패 처리' },
      { name: 'timeoutMin',  label: 'Timeout (분)',    type: 'number', required: true, default: 60 },

      // 실패 알림
      { name: 'onFailNotify', label: '실패 알림 채널', type: 'multiselect',
        options: ['email', 'slack', 'sms'], default: ['email'] },

// 추가
      { name: 'notifyEmail', label: '알림 이메일', type: 'text',
        placeholder: 'ops-team@company.com',
        visibleWhen: 'onFailNotify.includes("email")',  // email 선택 시에만 표시
        required: true },

      { name: 'notifySlackWebhook', label: 'Slack Webhook URL', type: 'text',
        placeholder: 'https://hooks.slack.com/services/...',
        visibleWhen: 'onFailNotify.includes("slack")',
        required: true },

      { name: 'notifySmsPhone', label: '알림 수신 번호', type: 'text',
        placeholder: '010-1234-5678',
        visibleWhen: 'onFailNotify.includes("sms")',
        required: true },
    ],

    argFields: [
      // 기존
      { name: 'targetDate', label: 'Target Date (YYYYMMDD)', type: 'text', required: false,
        placeholder: '비워두면 실행일 자동 적용' },

      // 추가
      { name: 'rerunYn',    label: '재실행 여부', type: 'select',
        options: ['N', 'Y'], default: 'N',
        helper: '동일 targetDate 재실행 허용 여부' },
      { name: 'dryRunYn',   label: 'Dry Run',    type: 'select',
        options: ['N', 'Y'], default: 'N',
        helper: 'Y 시 실제 저장 없이 처리 결과만 확인' },
    ]
  }
};