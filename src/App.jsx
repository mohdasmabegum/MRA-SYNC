import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { SplashScreen } from './components/SplashScreen';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LeavePortal } from './components/LeavePortal';
import { InventoryPortal } from './components/InventoryPortal';
import { WorkTransferPortal } from './components/WorkTransferPortal';
import { EmployeeWorkLog } from './components/EmployeeWorkLog';
import { CEODatabaseConsole } from './components/CEODatabaseConsole';
import { initDatabase } from './services/db';

export function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDept, setSelectedDept] = useState('ALL DEPARTMENTS');

  useEffect(() => {
    initDatabase();
    const savedUser = localStorage.getItem('mra_db_active_session');
    if (savedUser) {
      try {
        setActiveUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mra_db_active_session');
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setActiveUser(user);
    localStorage.setItem('mra_db_active_session', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('mra_db_active_session');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!activeUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        activeUser={activeUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        onLogout={handleLogout}
      />

      <main className="app-main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            activeUser={activeUser}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'leaves' && (
          <LeavePortal activeUser={activeUser} />
        )}

        {activeTab === 'inventory' && (
          <InventoryPortal
            activeUser={activeUser}
            selectedDept={selectedDept}
          />
        )}

        {activeTab === 'work_transfer' && (
          <WorkTransferPortal
            activeUser={activeUser}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'personal_log' && (
          <EmployeeWorkLog activeUser={activeUser} />
        )}

        {activeTab === 'ceo_db' && (
          <CEODatabaseConsole activeUser={activeUser} />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>MRA SYNC © 2026 — Corporate Enterprise Workflow Portal</span>
          <span className="footer-tag">CONNECT • COORDINATE • COMPLETE</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
