import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Sun, Moon, LogOut, User, ShieldCheck, Mail, Database, Palette, Settings as SettingsIcon, ArrowLeft, BellRing, Smartphone, CheckCircle } from 'lucide-react';
import { exportDatabaseExcelCSV, exportDatabaseJSON } from '../services/db';

export const Settings = ({ activeUser, theme, setTheme, onLogout, onBackToDashboard }) => {
  const { showToast, showModalPopup } = useToast();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushToken, setPushToken] = useState(`MRA-PUSH-TOK-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    localStorage.setItem('mra_app_theme', newTheme);
    showToast(`Switched to ${newTheme === 'light' ? 'Professional Light' : 'Luxury Dark'} Theme`, 'info');
  };

  const handleTogglePush = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    if (nextState) {
      showToast('Real-time push notifications activated for desktop & mobile!', 'success', 'Notifications Active');
    } else {
      showToast('Push notifications paused.', 'warning');
    }
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

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';

  return (
    <div className="portal-page-container">
      {/* Top Left Symbol Back Button */}
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Header Bar */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-amber-400" />
            Portal Settings & Preferences
          </h2>
          <p className="portal-subtitle">Customize theme appearance, view profile online status, and configure push notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. User Account Profile Details with DP & Online Status */}
        <div className="glow-card p-6">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-sky-400" />
            Profile DP & Account Details
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="relative">
                <img src={activeUser?.avatar} alt={activeUser?.name} className="w-16 h-16 rounded-full border-2 border-amber-400" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online Active"></span>
              </div>

              <div>
                <div className="font-bold text-white text-base">{activeUser?.name}</div>
                <div className="text-amber-400 font-mono text-xs">ID: {activeUser?.id} • <span className="text-emerald-400 font-semibold">🟢 Online</span></div>
                <div className="text-slate-400 text-xs mt-0.5">{activeUser?.dept}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Role Designation</span>
                <span className="font-bold text-amber-300">{activeUser?.role}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Assigned Dept</span>
                <span className="font-bold text-white">{activeUser?.dept}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">Corporate Email Address</span>
                <span className="font-semibold text-white">{activeUser?.email}</span>
              </div>
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* 2. Theme & Appearance Settings */}
        <div className="glow-card p-6">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-amber-400" />
            Appearance & Color Theme
          </h3>

          <div className="space-y-4">
            <p className="text-xs text-slate-400">Choose your preferred visual theme for the MRA SYNC portal:</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Dark Theme Option */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Moon className="w-6 h-6 text-amber-400" />
                  {theme === 'dark' && <span className="badge-tag bg-amber-500/20 text-amber-300">Active</span>}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Luxury Dark Theme</div>
                  <div className="text-[11px] text-slate-400">Obsidian black & gold metallic contrast</div>
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                  theme === 'light'
                    ? 'bg-slate-100 border-amber-500 shadow-lg shadow-amber-500/10 text-slate-900'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Sun className="w-6 h-6 text-amber-500" />
                  {theme === 'light' && <span className="badge-tag bg-amber-500/20 text-amber-700">Active</span>}
                </div>
                <div>
                  <div className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Professional Light</div>
                  <div className="text-[11px] text-slate-400">Clean alabaster white & slate design</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Push Notification Token & Mobile Preferences */}
        <div className="glow-card p-6 md:col-span-2">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <BellRing className="w-5 h-5 text-cyan-400" />
            Real-time Background Push Notification Token
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
            <div className="md:col-span-2 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Device Notification Token (PC & Mobile)
              </div>
              <p className="text-slate-400">This token enables real-time background meeting reminders and work transfer notifications across mobile and web.</p>
              <div className="font-mono bg-slate-900/80 p-2 rounded border border-cyan-500/30 text-cyan-300 select-all">
                {pushToken}
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleTogglePush}
                className={`btn-lg w-full font-bold ${pushEnabled ? 'btn-gold' : 'btn-secondary'}`}
              >
                {pushEnabled ? '🟢 Push Notifications Active' : '⚪ Push Notifications Paused'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Session & Data Management */}
        <div className="glow-card p-6 md:col-span-2">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Session Security & Data Export
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white text-sm">Active Session Control & Excel Data Export</div>
              <div className="text-xs text-slate-400">Sign out safely or export complete backend logs (Excel / CSV).</div>
            </div>

            <div className="flex gap-3">
              {isCEO && (
                <>
                  <button onClick={exportDatabaseExcelCSV} className="btn-gold font-bold">
                    <Database className="w-4 h-4 mr-1" /> Export Excel Logs (.CSV)
                  </button>
                  <button onClick={exportDatabaseJSON} className="btn-secondary">
                    Export JSON
                  </button>
                </>
              )}
              <button onClick={handleLogoutClick} className="btn-secondary text-rose-400 border-rose-500/30 hover:bg-rose-500/10">
                <LogOut className="w-4 h-4 mr-1" /> Logout Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
