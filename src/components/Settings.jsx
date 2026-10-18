import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
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
  Eye,
  Building,
} from 'lucide-react';
import { exportDatabaseExcelCSV, exportDatabaseJSON } from '../services/db';

export const Settings = ({ activeUser, theme, setTheme, onLogout, onBackToDashboard }) => {
  const { showToast, showModalPopup } = useToast();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [pushToken] = useState(`MRA-PUSH-TOK-2026-${Math.floor(100000 + Math.random() * 900000)}`);

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

  /* ── reusable inline style helpers ─────────────────────── */
  const cardBorder = { borderBottom: '1px solid var(--border)' };

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
            <SettingsIcon className="w-6 h-6" style={{ color: 'var(--blue)' }} />
            Portal Settings &amp; Preferences
          </h2>
          <p className="portal-subtitle">Manage profile details, theme appearance, online status, and push notification tokens.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Profile DP & Account Overview Card */}
        <div className="glow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 mb-4" style={cardBorder}>
              <h3 className="text-md font-bold flex items-center gap-2" style={{ color: 'var(--blue)' }}>
                <User className="w-5 h-5" style={{ color: 'var(--blue)' }} />
                Profile DP &amp; Account Details
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
                <span
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full"
                  style={{ background: 'var(--emerald)', border: '2px solid var(--bg-surface)' }}
                  title="Online Active"
                />
              </div>

              <div className="space-y-1">
                <div className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>{activeUser?.name}</div>
                <div className="font-mono text-xs" style={{ color: 'var(--blue)' }}>User ID: {activeUser?.id}</div>
                <div className="font-semibold text-xs flex items-center gap-1" style={{ color: 'var(--emerald)' }}>
                  <span>🟢 Online &amp; Active</span>
                </div>
              </div>
            </div>

            {/* Organised Label-Value Grid */}
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="settings-field-box">
                <div className="settings-field-label">Role Designation</div>
                <div className="settings-field-value" style={{ color: 'var(--blue)' }}>{activeUser?.role}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label"><Building className="w-3 h-3 inline mr-1" />Assigned Department</div>
                <div className="settings-field-value">{activeUser?.dept}</div>
              </div>

              <div className="settings-field-box flex justify-between items-center">
                <div>
                  <div className="settings-field-label">Corporate Email Address</div>
                  <div className="settings-field-value" style={{ color: 'var(--text-1)' }}>{activeUser?.email}</div>
                </div>
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--blue)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Theme & Appearance Settings */}
        <div className="glow-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold mb-4 flex items-center gap-2 pb-3" style={{ color: 'var(--blue)', ...cardBorder }}>
              <Palette className="w-5 h-5" style={{ color: 'var(--amber)' }} />
              Appearance &amp; Color Theme
            </h3>

            <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Select your visual theme preference for MRA SYNC:</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Dark Theme Option */}
              <button
                onClick={() => handleThemeChange('dark')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--r-xl)',
                  border: theme === 'dark' ? '2px solid var(--blue)' : '1px solid var(--border)',
                  background: theme === 'dark' ? 'rgba(99,179,237,0.08)' : 'var(--bg-hover)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '128px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: theme === 'dark' ? '0 4px 16px rgba(99,179,237,0.15)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                <div className="flex justify-between items-center">
                  <Moon className="w-6 h-6" style={{ color: 'var(--blue)' }} />
                  {theme === 'dark' && (
                    <span className="badge-tag" style={{ background: 'rgba(99,179,237,0.15)', color: 'var(--blue)', fontWeight: 700 }}>Active</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Deep Midnight Dark</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Midnight navy &amp; slate blue contrast</div>
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                onClick={() => handleThemeChange('light')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--r-xl)',
                  border: theme === 'light' ? '2px solid var(--blue)' : '1px solid var(--border)',
                  background: theme === 'light' ? 'rgba(43,108,176,0.06)' : 'var(--bg-hover)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '128px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: theme === 'light' ? '0 4px 16px rgba(43,108,176,0.12)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                <div className="flex justify-between items-center">
                  <Sun className="w-6 h-6" style={{ color: 'var(--amber)' }} />
                  {theme === 'light' && (
                    <span className="badge-tag" style={{ background: 'rgba(43,108,176,0.12)', color: 'var(--blue)', fontWeight: 700 }}>Active</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Professional Light</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Clean alabaster white &amp; slate design</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Push Notification Token & Mobile Preferences */}
        <div className="glow-card p-6 md:col-span-2">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2 pb-3" style={{ color: 'var(--text-1)', ...cardBorder }}>
            <BellRing className="w-5 h-5" style={{ color: 'var(--blue)' }} />
            Real-time Background Push Notification Token
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
            <div className="md:col-span-2 space-y-1">
              <div className="font-bold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                <Smartphone className="w-4 h-4" style={{ color: 'var(--emerald)' }} /> Device Notification Token (PC &amp; Mobile)
              </div>
              <p style={{ color: 'var(--text-3)' }}>This token enables real-time background meeting reminders and work transfer notifications across mobile and web.</p>
              <div
                className="font-mono p-2.5 rounded select-all font-semibold"
                style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-input)',
                  color: 'var(--cyan)',
                  borderRadius: 'var(--r-md)',
                }}
              >
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
          <h3 className="text-md font-bold mb-4 flex items-center gap-2 pb-3" style={{ color: 'var(--text-1)', ...cardBorder }}>
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
            Session Security &amp; Data Export
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Active Session Control &amp; Excel Data Export</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>Sign out safely or export complete backend logs (Excel / CSV).</div>
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
              <button
                onClick={handleLogoutClick}
                className="btn-secondary"
                style={{ color: 'var(--rose)', borderColor: 'rgba(252,129,129,0.30)' }}
              >
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
                <img
                  src={activeUser?.avatar}
                  alt={activeUser?.name}
                  className="w-12 h-12 rounded-full"
                  style={{ border: '2px solid var(--blue)' }}
                />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{activeUser?.name}</h3>
                  <div className="text-xs font-mono" style={{ color: 'var(--blue)' }}>User ID: {activeUser?.id}</div>
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
                <div className="settings-field-value font-mono" style={{ color: 'var(--blue)' }}>{activeUser?.id}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Role Designation</div>
                <div className="settings-field-value" style={{ color: 'var(--amber)' }}>{activeUser?.role}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Department</div>
                <div className="settings-field-value">{activeUser?.dept}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Corporate Email Address</div>
                <div className="settings-field-value" style={{ color: 'var(--text-1)' }}>{activeUser?.email}</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">System Online Status</div>
                <div className="settings-field-value" style={{ color: 'var(--emerald)' }}>🟢 Online &amp; Active</div>
              </div>

              <div className="settings-field-box">
                <div className="settings-field-label">Push Notification Token</div>
                <div className="settings-field-value font-mono text-xs" style={{ color: 'var(--cyan)' }}>{pushToken}</div>
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
