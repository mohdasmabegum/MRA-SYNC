import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.jpg';
import { useToast } from '../context/ToastContext';
import { getWorkLogs, getLeaves } from '../services/db';
import {
  LayoutDashboard,
  CalendarCheck,
  Boxes,
  ArrowRightLeft,
  FileText,
  Database,
  LogOut,
  Bell,
  ShieldCheck,
  Building,
  User,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ activeUser, activeTab, setActiveTab, selectedDept, setSelectedDept, onLogout }) => {
  const { showToast, showModalPopup } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  const DEPARTMENTS = [
    'ALL DEPARTMENTS',
    'Executive Management',
    'Project Management',
    'Hardware & Embedded Systems',
    'Software & AI Systems',
    'Human Resources',
    'Inventory & Logistics'
  ];

  // Check unread updates for logged user
  useEffect(() => {
    const checkUpdates = () => {
      const logs = getWorkLogs();
      const leaves = getLeaves();
      let count = 0;

      // Pending work transfers for user
      if (activeUser?.role === 'EMPLOYEE' || activeUser?.role === 'TL') {
        const pendingWork = logs.filter(w => w.receiverEmpId === activeUser.id && w.status === 'Pending Acceptance');
        count += pendingWork.length;
      }
      // Pending leaves for HR or CEO
      if (activeUser?.role === 'HR' || activeUser?.role === 'CEO/FOUNDER/DIRECTOR') {
        const pendingLeaves = leaves.filter(l => l.status === 'Pending');
        count += pendingLeaves.length;
      }

      setUnreadCount(count);
    };

    checkUpdates();
    window.addEventListener('mra_db_updated', checkUpdates);
    return () => window.removeEventListener('mra_db_updated', checkUpdates);
  }, [activeUser]);

  const handleTabChange = (tabId, tabName) => {
    if (tabId === activeTab) return;
    showToast(`Navigating to ${tabName}...`, 'redirect', 'Internal Page Redirect');
    setActiveTab(tabId);
  };

  const handleLogoutClick = () => {
    showModalPopup({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your current portal session? All local database changes remain saved.',
      iconType: 'logout',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: () => {
        showToast('Logged out successfully.', 'logout', 'Session Closed');
        onLogout();
      }
    });
  };

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isHR = activeUser?.role === 'HR';
  const isTL = activeUser?.role === 'TL';

  return (
    <header className="navbar-container">
      {/* Top Bar */}
      <div className="navbar-top">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => handleTabChange('dashboard', 'Executive Dashboard')}>
          <img src={logoImg} alt="MRA SYND Logo" className="nav-logo-img" />
          <div className="nav-brand-text">
            <h1 className="nav-title">
              <span className="text-gradient-gold">MRA</span> <span className="text-gradient-silver">SYND</span>
            </h1>
            <span className="nav-tagline">CONNECT • COORDINATE • COMPLETE</span>
          </div>
        </div>

        {/* Global Controls & CEO Shortcut */}
        <div className="nav-right-controls">
          {/* Department Filter (Visible for CEO, PC, HR) */}
          {(isCEO || isPC || isHR) && (
            <div className="dept-selector-wrapper">
              <Building className="w-4 h-4 text-amber-400" />
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="dept-select"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          {/* EXCLUSIVE CEO / DIRECTOR BACKEND DATABASE SHORTCUT BUTTON */}
          {isCEO && (
            <button
              onClick={() => handleTabChange('ceo_db', 'CEO Raw Backend Database Console')}
              className={`ceo-shortcut-btn ${activeTab === 'ceo_db' ? 'active' : ''}`}
              title="Exclusive Backend Database Access for CEO / Director"
            >
              <Database className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>⚡ CEO Raw Database</span>
            </button>
          )}

          {/* Notifications */}
          <div className="nav-icon-btn" title={`${unreadCount} pending items requiring action`}>
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          {/* User Profile Card */}
          <div className="user-profile-badge">
            <img src={activeUser?.avatar} alt={activeUser?.name} className="user-avatar" />
            <div className="user-info-text">
              <span className="user-name">{activeUser?.name}</span>
              <span className="user-role">{activeUser?.role}</span>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogoutClick} className="btn-logout" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar Links */}
      <nav className="navbar-links-row">
        <div className="nav-links-group">
          {/* Dashboard */}
          <button
            onClick={() => handleTabChange('dashboard', 'Executive Dashboard')}
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </button>

          {/* Leave Application Portal (All users) */}
          <button
            onClick={() => handleTabChange('leaves', 'Leave Application Portal')}
            className={`nav-link ${activeTab === 'leaves' ? 'active' : ''}`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Leave Application Portal</span>
          </button>

          {/* Material Request Form & Inventory Workflow */}
          {(isCEO || isPC || isTL || activeUser?.dept === 'Inventory & Logistics' || activeUser?.role === 'EMPLOYEE') && (
            <button
              onClick={() => handleTabChange('inventory', 'Material & Inventory Portal')}
              className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            >
              <Boxes className="w-4 h-4" />
              <span>Material & Inventory</span>
            </button>
          )}

          {/* Transfer Track of Work */}
          <button
            onClick={() => handleTabChange('work_transfer', 'Transfer Track of Work')}
            className={`nav-link ${activeTab === 'work_transfer' ? 'active' : ''}`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Track of Work</span>
          </button>

          {/* Employee Work Log Base */}
          <button
            onClick={() => handleTabChange('personal_log', 'Personal Work Logs')}
            className={`nav-link ${activeTab === 'personal_log' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Personal Work Log</span>
          </button>
        </div>

        <div className="nav-status-indicator">
          <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1" />
          <span>Local Engine Active</span>
        </div>
      </nav>
    </header>
  );
};
