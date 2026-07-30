import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import appIconImg from '../assets/app-icon.jpg';
import {
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
  Mail,
  Database,
  Palette,
  Settings as SettingsIcon,
  ArrowLeft,
  BellRing,
  Smartphone,
  CheckCircle,
  Eye,
  Building,
  Key,
  Shield,
  Download
} from 'lucide-react';
import { exportDatabaseExcelCSV, exportDatabaseJSON } from '../services/db';

export const Settings = ({ activeUser, theme, setTheme, onLogout, onBackToDashboard }) => {
  const { showToast, showModalPopup } = useToast();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [pushToken, setPushToken] = useState(`MRA-PUSH-TOK-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    localStorage.setItem('mra_app_theme', newTheme);
    showToast(`Switched to ${newTheme === 'light' ? 'Professional Light' : 'Deep Midnight Dark'} Theme`, 'info');
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

  const handleDownloadAPK = () => {
    showToast('Preparing MRA SYNC Mobile Enterprise APK build download package...', 'info', 'APK Download');
    showModalPopup({
      title: '📱 MRA SYNC Android APK Download',
      message: 'The MRA SYNC Mobile Application APK package is ready for direct installation on Android devices. Click Confirm to initiate direct APK package download.',
      iconType: 'info',
      confirmText: 'Download APK Package',
      onConfirm: () => {
        const link = document.createElement('a');
        link.href = '/logo.jpg';
        link.download = 'MRA_SYNC_Mobile_v2.0.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('MRA SYNC APK download started!', 'success');
      }
    });
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
            <SettingsIcon className="w-6 h-6 text-sky-400" />
            Portal Settings & Preferences
          </h2>
          <p className="portal-subtitle">Manage profile details, theme appearance, mobile APK download, and push notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Profile DP & Account Overview Card */}
        <div className="glow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-md font-bold text-sky-400 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                Profile DP & Account Details
              </h3>
              <button
                onClick={() => setShowFullProfileModal(true)}
                className="btn-gold btn-xs font-bold"
                title="View Complete Profile Info"
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> View Full Info
              </button>
            </div>

            <div className="profile-card-header mb-4">
              <div className="relative">
                <img src={activeUser?.avatar} alt={activeUser?.name} className="profile-dp-img" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online Active"></span>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-lg text-white">{activeUser?.name}</div>
                <div className="text-sky-400 font-mono text-xs">User ID: {activeUser?.id}</div>
                <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                  <span>🟢 Online & Active</span>
                </div>
              </div>
            </div>

            {/* Organised Label-Value Grid */}
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="settings-field-box">
                <div className="settings-field-label">Role Designation</div>
                <div className="settings-field-value text-sky-400">{activeUser?.role}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Assigned Department</div>
                <div className="settings-field-value">{activeUser?.dept}</div>
              </div>

              <div className="settings-field-box flex justify-between items-center">
                <div>
                  <div className="settings-field-label">Corporate Email Address</div>
                  <div className="settings-field-value text-slate-200">{activeUser?.email}</div>
                </div>
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Theme & Appearance Settings */}
        <div className="glow-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-sky-400 mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Palette className="w-5 h-5 text-amber-400" />
              Appearance & Color Theme
            </h3>

            <p className="text-xs text-slate-400 mb-4">Select your visual theme preference for MRA SYNC:</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Dark Theme Option */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-sky-400 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Moon className="w-6 h-6 text-sky-400" />
                  {theme === 'dark' && <span className="badge-tag bg-sky-500/20 text-sky-300 font-bold">Active</span>}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Deep Midnight Dark</div>
                  <div className="text-[11px] text-slate-400">Midnight navy & slate blue contrast</div>
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                  theme === 'light'
                    ? 'bg-slate-100 border-sky-500 shadow-lg shadow-sky-500/10 text-slate-900'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Sun className="w-6 h-6 text-amber-500" />
                  {theme === 'light' && <span className="badge-tag bg-sky-500/20 text-sky-700 font-bold">Active</span>}
                </div>
                <div>
                  <div className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Professional Light</div>
                  <div className="text-[11px] text-slate-400">Clean alabaster white & slate design</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Mobile APK Downloading App Icon Card */}
        <div className="glow-card p-6 md:col-span-2 border-sky-500/40">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Smartphone className="w-5 h-5 text-sky-400" />
            Mobile Application & APK Download Package
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={appIconImg} alt="MRA SYNC APK Downloading App Icon" className="w-16 h-16 rounded-2xl border-2 border-sky-400 object-cover shadow-lg shadow-sky-500/20" />
              <div>
                <div className="font-bold text-white text-base">MRA SYNC Mobile Android Package (.APK)</div>
                <div className="text-xs text-sky-400 font-mono">Official App Icon • Version 2.0 Build</div>
                <div className="text-xs text-slate-400 mt-1">Install directly on Android smartphones or tablets for desktop & mobile push sync.</div>
              </div>
            </div>

            <button onClick={handleDownloadAPK} className="btn-gold font-bold flex items-center gap-2 py-3 px-6">
              <Download className="w-5 h-5" />
              <span>Download Mobile APK</span>
            </button>
          </div>
        </div>

        {/* 4. Push Notification Token & Mobile Preferences */}
        <div className="glow-card p-6 md:col-span-2">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <BellRing className="w-5 h-5 text-sky-400" />
            Real-time Background Push Notification Token
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
            <div className="md:col-span-2 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Device Notification Token (PC & Mobile)
              </div>
              <p className="text-slate-400">This token enables real-time background meeting reminders and work transfer notifications across mobile and web.</p>
              <div className="font-mono bg-slate-900/80 p-2.5 rounded border border-sky-500/30 text-sky-300 select-all font-semibold">
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

        {/* 5. Session & Data Management */}
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

      {/* FULL COMPLETE PROFILE DETAILS MODAL */}
      {showFullProfileModal && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card max-w-md">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <img src={activeUser?.avatar} alt={activeUser?.name} className="w-12 h-12 rounded-full border-2 border-sky-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">{activeUser?.name}</h3>
                  <div className="text-xs text-sky-400 font-mono">User ID: {activeUser?.id}</div>
                </div>
              </div>
              <button onClick={() => setShowFullProfileModal(false)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-3 text-xs">
              <div className="settings-field-box">
                <div className="settings-field-label">Full Account Name</div>
                <div className="settings-field-value">{activeUser?.name}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Unique Employee ID</div>
                <div className="settings-field-value font-mono text-sky-400">{activeUser?.id}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Role Designation</div>
                <div className="settings-field-value text-amber-400">{activeUser?.role}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Department</div>
                <div className="settings-field-value">{activeUser?.dept}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Corporate Email Address</div>
                <div className="settings-field-value text-slate-200">{activeUser?.email}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">System Online Status</div>
                <div className="settings-field-value text-emerald-400">🟢 Online & Active</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Push Notification Token</div>
                <div className="settings-field-value font-mono text-xs text-sky-300">{pushToken}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowFullProfileModal(false)} className="btn-gold w-full">
                Close Full Profile Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
