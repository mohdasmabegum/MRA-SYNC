import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.jpg';
import { useToast } from '../context/ToastContext';
import { getWorkLogs, getLeaves, getMeetings } from '../services/db';
import {
  LayoutDashboard,
  CalendarCheck,
  Boxes,
  ArrowRightLeft,
  FileText,
  Database,
  LogOut,
  Bell,
  Building,
  ShieldCheck,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Clock,
  Video,
  X
} from 'lucide-react';

export const Navbar = ({ activeUser, activeTab, setActiveTab, selectedDept, setSelectedDept, theme, setTheme, onLogout }) => {
  const { showToast, showModalPopup } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isTLOrSubTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isNormalEmp = activeUser?.role === 'EMPLOYEE';

  const DEPARTMENTS = isCEO || isPC ? [
    'ALL DEPARTMENTS',
    'Executive Management',
    'Project Management',
    'Hardware & Embedded Systems',
    'Software & AI Systems',
    'Human Resources',
    'Inventory & Logistics'
  ] : [activeUser?.dept || 'Hardware & Embedded Systems'];

  useEffect(() => {
    const checkUpdates = () => {
      const logs = getWorkLogs();
      const leaves = getLeaves();
      const meetings = getMeetings();
      const notifs = [];

      // 1. Work & Leave Action Items
      if (isNormalEmp || isTLOrSubTL) {
        const pendingWork = logs.filter(w => w.receiverEmpId === activeUser.id && w.status === 'Pending Acceptance');
        pendingWork.forEach(w => {
          notifs.push({
            id: `wrk-${w.id}`,
            title: 'New Work Task Assigned',
            message: `"${w.projectName}" assigned by ${w.workAlloter}`,
            time: w.createdDate,
            type: 'work'
          });
        });
      }

      if (activeUser?.role === 'HR' || isCEO) {
        const pendingLeaves = leaves.filter(l => l.status === 'Pending');
        pendingLeaves.forEach(l => {
          notifs.push({
            id: `lv-${l.id}`,
            title: 'Leave Application Pending',
            message: `${l.name} requested ${l.noOfDays} days (${l.leaveType})`,
            time: l.appliedDate,
            type: 'leave'
          });
        });
      }

      // 2. TIMED MEETING REMINDERS (1 Hour, 30 Min, 20 Min, 10 Min Reminders)
      meetings.forEach(mtg => {
        notifs.push({
          id: `mtg-1h-${mtg.id}`,
          title: `⏰ 1 Hour Meeting Reminder: "${mtg.title}"`,
          message: `Scheduled for ${mtg.date} @ ${mtg.time} (${mtg.targetDept})`,
          time: 'Remind 60m before',
          type: 'meeting_reminder'
        });
        notifs.push({
          id: `mtg-30m-${mtg.id}`,
          title: `⚡ 30 Minute Meeting Reminder: "${mtg.title}"`,
          message: `Starting in 30 mins! Join link attached.`,
          time: 'Remind 30m before',
          type: 'meeting_reminder'
        });
        notifs.push({
          id: `mtg-20m-${mtg.id}`,
          title: `🚨 20 Minute Warning: "${mtg.title}"`,
          message: `Starting in 20 mins with ${mtg.organizer}`,
          time: 'Remind 20m before',
          type: 'meeting_reminder'
        });
        notifs.push({
          id: `mtg-10m-${mtg.id}`,
          title: `🔔 10 Minute Final Call: "${mtg.title}"`,
          message: `Starting in 10 mins @ ${mtg.time}`,
          time: 'Remind 10m before',
          type: 'meeting_reminder'
        });
      });

      setNotificationsList(notifs);
      setUnreadCount(notifs.length);
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

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('mra_app_theme', nextTheme);
    showToast(`Theme changed to ${nextTheme === 'light' ? 'Professional Light' : 'Luxury Dark'}`, 'info');
  };

  const handleLogoutClick = () => {
    showModalPopup({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your current session?',
      iconType: 'logout',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: () => {
        showToast('Logged out successfully.', 'logout', 'Session Closed');
        onLogout();
      }
    });
  };

  return (
    <header className="navbar-container">
      {/* Top Bar */}
      <div className="navbar-top">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => handleTabChange('dashboard', 'Overview Dashboard')}>
          <img src={logoImg} alt="MRA SYNC Logo" className="nav-logo-img" />
          <div className="nav-brand-text">
            <h1 className="nav-title">
              <span className="text-gradient-gold">MRA</span> <span className="text-gradient-silver">SYNC</span>
            </h1>
            <span className="nav-tagline">CONNECT • COORDINATE • COMPLETE</span>
          </div>
        </div>

        {/* Global Controls & CEO Shortcut */}
        <div className="nav-right-controls">
          {/* Theme Quick Switcher Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="nav-icon-btn"
            title={`Switch to ${theme === 'light' ? 'Luxury Dark' : 'Professional Light'} Theme`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-amber-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Department Selector */}
          <div className="dept-selector-wrapper">
            <Building className="w-4 h-4 text-amber-400" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="dept-select-styled"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept} className="dept-option-styled">
                  {dept}
                </option>
              ))}
            </select>
          </div>

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

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="nav-icon-btn"
              title={`${unreadCount} notifications & meeting reminders`}
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 glow-card p-4 z-50 border border-cyan-500/40 shadow-2xl text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-400" /> Meeting Reminders & Alerts ({notificationsList.length})
                  </span>
                  <button onClick={() => setShowNotifDropdown(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notificationsList.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-2">No active reminders.</p>
                  ) : (
                    notificationsList.map(n => (
                      <div key={n.id} className="bg-slate-900/80 p-2 rounded border border-slate-800 space-y-0.5">
                        <div className="font-bold text-cyan-300">{n.title}</div>
                        <div className="text-slate-300 text-[11px]">{n.message}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="user-profile-badge" onClick={() => handleTabChange('settings', 'Portal Settings')} style={{ cursor: 'pointer' }}>
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

      {/* Main Navigation Links */}
      <nav className="navbar-links-row">
        <div className="nav-links-group">
          {/* Dashboard */}
          <button
            onClick={() => handleTabChange('dashboard', 'Overview Dashboard')}
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </button>

          {/* Leave Application Portal */}
          <button
            onClick={() => handleTabChange('leaves', 'Leave Application Portal')}
            className={`nav-link ${activeTab === 'leaves' ? 'active' : ''}`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Leave Application Portal</span>
          </button>

          {/* Material Request & Inventory Workflow */}
          <button
            onClick={() => handleTabChange('inventory', 'Material & Inventory Portal')}
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            <Boxes className="w-4 h-4" />
            <span>Material & Inventory</span>
          </button>

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

          {/* Settings Page */}
          <button
            onClick={() => handleTabChange('settings', 'Portal Settings')}
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        <div className="nav-status-indicator">
          <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1" />
          <span>MRA SYNC Active ({theme.toUpperCase()})</span>
        </div>
      </nav>
    </header>
  );
};
