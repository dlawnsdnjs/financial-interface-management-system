import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface InterfaceEntity {
  id?: number;
  name: string;
  protocolType: string;
  description?: string;
  enabled: boolean;
  protocolConfig: any;
  defaultArguments?: any;
}

export interface MessageLog {
  id: number;
  interfaceId: number;
  protocol: string;
  payload: string;
  response: string;
  status: 'SUCCESS' | 'FAIL';
  errorMessage: string;
  createdAt: string;
}

export const getInterfaces = async () => {
  const response = await axios.get(`${API_BASE_URL}/interfaces`);
  return response.data;
};

export const getInterfaceById = async (id: number) => {
  const response = await axios.get(`${API_BASE_URL}/interfaces/${id}`);
  return response.data;
};

export const createInterface = async (entity: InterfaceEntity) => {
  const response = await axios.post(`${API_BASE_URL}/interfaces`, entity);
  return response.data;
};

export const updateInterface = async (id: number, entity: InterfaceEntity) => {
  const response = await axios.put(`${API_BASE_URL}/interfaces/${id}`, entity);
  return response.data;
};

export const deleteInterface = async (id: number) => {
  const response = await axios.delete(`${API_BASE_URL}/interfaces/${id}`);
  return response.data;
};

export const getInterfaceLogs = async (interfaceId: number) => {
  const response = await axios.get(`${API_BASE_URL}/monitor/logs/${interfaceId}`);
  return response.data;
};

export const getInterfaceStats = async (interfaceId: number) => {
  const response = await axios.get(`${API_BASE_URL}/monitor/stats/${interfaceId}`);
  return response.data;
};

export const getRecentLogs = async () => {
  const response = await axios.get(`${API_BASE_URL}/monitor/recent-logs`);
  return response.data;
};

export const retryInterface = async (logId: number) => {
  const response = await axios.post(`${API_BASE_URL}/monitor/retry/${logId}`);
  return response.data;
};

export const executeInterface = async (id: number) => {
  const response = await axios.get(`${API_BASE_URL}/interfaces/${id}/execute`);
  return response.data;
};

export const apiService = {
  post: async (path: string, data: any) => {
    const response = await axios.post(`${API_BASE_URL}${path}`, data);
    return response.data;
  }
};
