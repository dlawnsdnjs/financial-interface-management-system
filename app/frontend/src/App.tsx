import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Modular Components
import { Interface, Stats } from './types';
import InterfaceForm from './components/InterfaceForm';
import ResponseViewer from './components/ResponseViewer';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import InterfaceListView from './components/views/InterfaceListView';

const API_BASE_URL = 'http://localhost:8080/api/v1/interfaces';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [interfaces, setInterfaces] = useState<Interface[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingInterface, setEditingInterface] = useState<Interface | undefined>(undefined);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intfRes, statsRes] = await Promise.all([
        axios.get(API_BASE_URL),
        axios.get(`${API_BASE_URL}/stats`)
      ]);
      setInterfaces(intfRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const executeInterface = async (intfId: string) => {
    setExecuting(intfId);
    try {
      const response = await axios.post(`${API_BASE_URL}/${intfId}/execute`);
      setExecutionResult(response.data);
      await fetchData(); 
    } catch (error: any) {
      setExecutionResult({
        status: 'FAIL',
        intfId,
        msg: error.response?.data?.message || error.message,
        latency: 'N/A',
        transId: 'ERR-' + Date.now()
      });
    } finally {
      setExecuting(null);
    }
  };

  const retryTransaction = async (logId: number) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/logs/${logId}/retry`);
      setExecutionResult(response.data);
      await fetchData();
    } catch (error: any) {
      alert('Retry failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInterfaceSubmit = async (data: Interface) => {
    try {
      setLoading(true);
      if (data.id) {
        // Update
        await axios.put(`${API_BASE_URL}/${data.intfId}`, data);
      } else {
        // Create
        await axios.post(API_BASE_URL, data);
      }
      setShowFormModal(false);
      setEditingInterface(undefined);
      await fetchData();
    } catch (error: any) {
      alert('Operation failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (intf: Interface) => {
    setEditingInterface(intf);
    setShowFormModal(true);
  };

  const openCreateModal = () => {
    setEditingInterface(undefined);
    setShowFormModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} loading={loading} onRefresh={fetchData} />

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' ? (
            <DashboardView 
              stats={stats}
              interfaces={interfaces}
              executing={executing}
              onExecute={executeInterface}
              onRetry={retryTransaction}
              onNavigateToInterfaces={() => setActiveTab('interfaces')}
            />
          ) : (
            <InterfaceListView 
              interfaces={interfaces}
              executing={executing}
              onOpenCreate={openCreateModal}
              onOpenEdit={openEditModal}
              onExecute={executeInterface}
            />
          )}
        </main>
      </div>

      {showFormModal && (
        <InterfaceForm 
          initialData={editingInterface}
          loading={loading}
          onSubmit={handleInterfaceSubmit}
          onCancel={() => setShowFormModal(false)}
        />
      )}

      {executionResult && (
        <ResponseViewer 
          data={executionResult}
          onClose={() => setExecutionResult(null)}
        />
      )}
    </div>
  );
}

export default App;
