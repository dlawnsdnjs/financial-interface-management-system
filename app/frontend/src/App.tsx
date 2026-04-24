import React from 'react';
import InterfacePage from './pages/InterfacePage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-xl font-bold text-blue-600">FIMS v2</span>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto bg-white shadow rounded-lg">
        <InterfacePage />
      </main>
    </div>
  );
}

export default App;
