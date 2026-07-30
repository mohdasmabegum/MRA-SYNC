import React from 'react';
import { useToast } from '../context/ToastContext';
import { Sun, Moon, LogOut, User, ShieldCheck, Mail, Database, Palette, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { exportDatabaseJSON } from '../services/db';

export const Settings = ({ activeUser, theme, setTheme, onLogout }) => {
  const { showToast, showModalPopup } = useToast();

  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    localStorage.setItem('mra_app_theme', newTheme);
    showToast(`Switched to ${newTheme === 'light' ? 'Professional Light' : 'Luxury Dark'} Theme`, 'info');
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
      {/* Universal Back Button */}
      <button onClick={() => window.history.back()} className="btn-back">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header Bar */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-amber-400" />
            Portal Settings & Preferences
          </h2>
          <p className="portal-subtitle">Customize theme appearance, view account security details, and manage portal session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Theme & Appearance Settings */}
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

        {/* 2. User Account Profile Details */}
        <div className="glow-card p-6">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-sky-400" />
            Account Profile & Role Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <img src={activeUser?.avatar} alt={activeUser?.name} className="w-12 h-12 rounded-full border border-amber-400" />
              <div>
                <div className="font-bold text-white text-sm">{activeUser?.name}</div>
                <div className="text-amber-400 font-mono">ID: {activeUser?.id}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Role Designation</span>
                <span className="font-bold text-amber-300">{activeUser?.role}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-bold text-white">{activeUser?.dept}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-white">{activeUser?.email}</span>
              </div>
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* 3. Session & Data Management */}
        <div className="glow-card p-6 md:col-span-2">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Session Security & Data Management
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white text-sm">Active Session Control</div>
              <div className="text-xs text-slate-400">Sign out of your active session safely on this browser.</div>
            </div>

            <div className="flex gap-3">
              {isCEO && (
                <button onClick={exportDatabaseJSON} className="btn-gold">
                  <Database className="w-4 h-4 mr-1" /> Backup Database (JSON)
                </button>
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
