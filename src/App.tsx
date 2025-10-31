import { useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');

  return (
    <>
      {currentPage === 'landing' ? (
        <Landing onLaunch={() => setCurrentPage('dashboard')} />
      ) : (
        <Dashboard onBack={() => setCurrentPage('landing')} />
      )}
    </>
  );
}

export default App;
