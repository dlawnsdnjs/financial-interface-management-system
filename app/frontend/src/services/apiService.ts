import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface InterfaceEntity {
  id?: number;
  name: string;
  protocolType: string;
  description?: string;
  enabled: boolean;
  protocolConfig: any;
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

export const executeInterface = async (id: number, payload?: any) => {
  const response = await axios.post(`${API_BASE_URL}/interfaces/${id}/execute`, payload || {}, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const apiService = {
  post: async (path: string, data: any) => {
    const response = await axios.post(`${API_BASE_URL}${path}`, data);
    return response.data;
  }
};
