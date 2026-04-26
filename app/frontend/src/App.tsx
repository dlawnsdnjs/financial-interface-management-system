import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InterfacePage from './pages/InterfacePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<InterfacePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
          <footer className="p-8 text-center text-gray-500 text-xs border-t border-gray-200 bg-white">
            &copy; 2026 FIMS v2. All rights reserved. | Built with modern architecture and design.
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
