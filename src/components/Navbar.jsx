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
  MessageSquare,
  X,
  ChevronRight
} from 'lucide-react';

export const Navbar = ({ activeUser, activeTab, setActiveTab, selectedDept, setSelectedDept, theme, setTheme, onLogout }) => {
  const { showModalPopup } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isHR = activeUser?.role === 'HR';
  const isTLOrSubTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isNormalEmp = activeUser?.role === 'EMPLOYEE';

  const canSwitchDepts = isCEO || isPC || isHR;
  const canAccessChat = isCEO || isPC || activeUser?.dept === 'Project Management';

  const ACTUAL_DEPARTMENTS = [
    'Executive Management',
    'Project Management',
    'Hardware & Embedded Systems',
    'Software & AI Systems',
    'Human Resources',
    'Inventory & Logistics'
  ];

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
            title: 'Work Task Assigned',
            message: `"${w.projectName}" from ${w.workAlloter}`,
            targetTab: 'work_transfer',
            type: 'work'
          });
        });
      }

      if (isHR || isCEO) {
        const pendingLeaves = leaves.filter(l => l.status === 'Pending');
        pendingLeaves.forEach(l => {
          notifs.push({
            id: `lv-${l.id}`,
            title: 'Leave Pending Approval',
            message: `${l.name} requested ${l.noOfDays}d (${l.leaveType})`,
            targetTab: 'leaves',
            type: 'leave'
          });
        });
      }

      // 2. Timed Meeting Reminders
      meetings.forEach(mtg => {
        notifs.push({
          id: `mtg-1h-${mtg.id}`,
          title: `⏰ 1h Reminder: ${mtg.title}`,
          message: `Scheduled ${mtg.date} @ ${mtg.time}`,
          targetTab: 'dashboard',
          type: 'meeting'
        });
        notifs.push({
          id: `mtg-30m-${mtg.id}`,
          title: `⚡ 30m Reminder: ${mtg.title}`,
          message: `Starting soon @ ${mtg.time}`,
          targetTab: 'dashboard',
          type: 'meeting'
        });
      });

      setNotificationsList(notifs);
      setUnreadCount(notifs.length);
    };

    checkUpdates();
    window.addEventListener('mra_db_updated', checkUpdates);
    return () => window.removeEventListener('mra_db_updated', checkUpdates);
  }, [activeUser]);

  const handleTabChangeSilently = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
  };

  const handleNotifItemClick = (targetTab) => {
    setShowNotifDropdown(false);
    setActiveTab(targetTab);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('mra_app_theme', nextTheme);
  };

  const handleLogoutClick = () => {
    showModalPopup({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your current session?',
      iconType: 'logout',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: () => {
        onLogout();
      }
    });
  };

  return (
    <header className="navbar-container">
      {/* Top Bar */}
      <div className="navbar-top">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => handleTabChangeSilently('dashboard')}>
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
            {theme === 'light' ? <Moon className="w-5 h-5 text-amber-600" /> : <Sun className="w-5 h-5 text-sky-400" />}
          </button>

          {/* Department Selector (VISIBLE ONLY FOR CEO, FOUNDER, DIRECTOR, PC, HR) */}
          {canSwitchDepts && (
            <div className="dept-selector-wrapper">
              <Building className="w-4 h-4 text-sky-400" />
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="dept-select-styled"
              >
                {ACTUAL_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} className="dept-option-styled">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* EXCLUSIVE CEO / DIRECTOR BACKEND DATABASE SHORTCUT BUTTON */}
          {isCEO && (
            <button
              onClick={() => handleTabChangeSilently('ceo_db')}
              className={`ceo-shortcut-btn ${activeTab === 'ceo_db' ? 'active' : ''}`}
              title="Exclusive Backend Database Access for CEO / Director"
            >
              <Database className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>⚡ CEO Raw Database</span>
            </button>
          )}

          {/* Redesigned Clickable Notifications Dropdown */}
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
              <div className="absolute right-0 mt-2 w-80 notif-dropdown-card p-4 z-50 rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                  <span className="font-bold notif-header-title flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-500" /> Notifications & Reminders ({notificationsList.length})
                  </span>
                  <button onClick={() => setShowNotifDropdown(false)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notificationsList.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-2">No active notifications.</p>
                  ) : (
                    notificationsList.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifItemClick(n.targetTab)}
                        className="notif-item-card p-2.5 rounded-lg flex justify-between items-center cursor-pointer transition-all"
                      >
                        <div>
                          <div className="notif-item-title">{n.title}</div>
                          <div className="notif-item-msg text-[11px]">{n.message}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-sky-500 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="user-profile-badge" onClick={() => handleTabChangeSilently('settings')} style={{ cursor: 'pointer' }}>
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
            onClick={() => handleTabChangeSilently('dashboard')}
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </button>

          {/* Leave Application Portal */}
          <button
            onClick={() => handleTabChangeSilently('leaves')}
            className={`nav-link ${activeTab === 'leaves' ? 'active' : ''}`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Leave Application Portal</span>
          </button>

          {/* Material Request & Inventory Workflow */}
          <button
            onClick={() => handleTabChangeSilently('inventory')}
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            <Boxes className="w-4 h-4" />
            <span>Material & Inventory</span>
          </button>

          {/* Transfer Track of Work */}
          <button
            onClick={() => handleTabChangeSilently('work_transfer')}
            className={`nav-link ${activeTab === 'work_transfer' ? 'active' : ''}`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Track of Work</span>
          </button>

          {/* Employee Work Log Base */}
          <button
            onClick={() => handleTabChangeSilently('personal_log')}
            className={`nav-link ${activeTab === 'personal_log' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Personal Work Log</span>
          </button>

          {/* Team Chat (EXCLUSIVE TO PM TEAM & EXECUTIVES) */}
          {canAccessChat && (
            <button
              onClick={() => handleTabChangeSilently('chat')}
              className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>PM Team Chat</span>
            </button>
          )}

          {/* Settings Page */}
          <button
            onClick={() => handleTabChangeSilently('settings')}
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
