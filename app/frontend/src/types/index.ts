export interface Interface {
  id?: number;
  intfId: string;
  intfName: string;
  protType: string;
  endPoint: string;
  authInfo: string;
  status: string;
}

export interface TransactionLog {
  id: number;
  transId: string;
  intfId: string;
  protType: string;
  status: string;
  resultCode: string;
  latencyMs: number;
  startTime: string;
  httpMethod?: string;
  retryOf?: string;
  requestPayload?: string;
  responsePayload?: string;
}

export interface Stats {
  successRate: number;
  totalCount: number;
  errorCount: number;
  avgLatency: number;
  protocolStats: Record<string, number>;
  recentLogs: TransactionLog[];
}
