import React, { useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { getUsers, registerUser } from '../services/db';
import { useToast } from '../context/ToastContext';
import { LogIn, UserPlus, ShieldCheck, Lock, Mail, User, Building, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    dept: 'Hardware & Embedded Systems'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast, showModalPopup } = useToast();

  const DEPARTMENTS = [
    'Executive Management',
    'Project Management',
    'Hardware & Embedded Systems',
    'Software & AI Systems',
    'Human Resources',
    'Inventory & Logistics'
  ];

  const ROLES = [
    { value: 'CEO/FOUNDER/DIRECTOR', label: 'CEO / Founder / Director (Full Access + CEO Database Console)' },
    { value: 'PROJECT_COORDINATOR', label: 'Project Coordinator (All Depts + Team Analytics)' },
    { value: 'TL', label: 'Team Lead (TL - Team Scope & Material Approvals)' },
    { value: 'SUB_TL', label: 'Sub-TL (Assistant Team Lead)' },
    { value: 'HR', label: 'HR Manager (Leave Approvals & Work Completion Reports)' },
    { value: 'EMPLOYEE', label: 'Employee (Personal Work Log & Task Portal)' }
  ];

  const handleQuickDemoLogin = (email) => {
    const users = getUsers();
    const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      showToast(`Logged in as ${targetUser.name} (${targetUser.role})`, 'login', 'Authentication Successful');
      showModalPopup({
        title: 'Authentication Successful',
        message: `Welcome back, ${targetUser.name}! You are currently logged in under [${targetUser.role}] role privileges.`,
        iconType: 'login',
        confirmText: 'Enter MRA SYNC Portal'
      });
      onLoginSuccess(targetUser);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
      if (!user) {
        setErrorMsg('Invalid email or password. Select a demo role below.');
        return;
      }
      showToast(`Welcome back ${user.name}!`, 'login', 'Login Successful');
      onLoginSuccess(user);
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.id) {
        setErrorMsg('Please fill in all required registration fields.');
        return;
      }
      try {
        const newUser = registerUser(formData);
        showToast('Registration complete! Please login with your credentials.', 'success', 'Account Created');
        setIsLogin(true);
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background ambient light */}
      <div className="auth-glow glow-gold"></div>
      <div className="auth-glow glow-silver"></div>

      <div className="auth-layout">
        {/* Left Branding Panel */}
        <div className="auth-brand-side">
          <div className="brand-logo-frame">
            <img src={logoImg} alt="MRA SYNC Logo" className="auth-logo-img" />
          </div>
          <h2 className="brand-title">
            <span className="text-gradient-gold">MRA</span> <span className="text-gradient-silver">SYNC</span>
          </h2>
          <p className="brand-subtitle">CONNECT • COORDINATE • COMPLETE</p>

          <div className="brand-features-list">
            <div className="feature-item">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span><strong>Leave Applications Portal</strong> with HR & Executive approvals</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span><strong>Material Requisitions</strong> routed to TL / Sub-TL & Inventory</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span><strong>Transfer Track of Work</strong> with mandatory hardware & doc checks</span>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-side">
          <div className="auth-card glow-card">
            {/* Tab Switches */}
            <div className="auth-tab-switch">
              <button
                className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                <span>Account Login</span>
              </button>
              <button
                className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                <span>Register User</span>
              </button>
            </div>

            {errorMsg && (
              <div className="error-alert mb-4 text-xs text-rose-400 bg-rose-500/10 p-3 rounded border border-rose-500/30">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Employee ID <span className="text-rose-400">*</span></label>
                    <div className="input-with-icon">
                      <Lock className="input-icon" />
                      <input
                        type="text"
                        placeholder="e.g. EMP109"
                        value={formData.id}
                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Name <span className="text-rose-400">*</span></label>
                    <div className="input-with-icon">
                      <User className="input-icon" />
                      <input
                        type="text"
                        placeholder="e.g. David Vance"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Corporate Email <span className="text-rose-400">*</span></label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    placeholder="e.g. ceo@mrasync.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password <span className="text-rose-400">*</span></label>
                <div className="input-with-icon">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Assigned Department</label>
                    <div className="input-with-icon">
                      <Building className="input-icon" />
                      <select
                        value={formData.dept}
                        onChange={e => setFormData({ ...formData, dept: e.target.value })}
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Role Designation</label>
                    <div className="input-with-icon">
                      <ShieldCheck className="input-icon" />
                      <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        {ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn-gold w-full btn-lg mt-2">
                <span>{isLogin ? 'Sign In to Portal' : 'Create Account'}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>

            {/* Quick Demo Login Switcher */}
            <div className="demo-accounts-section">
              <div className="demo-header">
                <span>⚡ 1-Click Demo Role Switcher</span>
              </div>
              <div className="demo-grid">
                <button
                  onClick={() => handleQuickDemoLogin('ceo@mrasync.com')}
                  className="demo-btn demo-ceo"
                >
                  <span className="demo-role-badge">CEO / DIRECTOR</span>
                  <span className="demo-name">Alexander Vance</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('pc@mrasync.com')}
                  className="demo-btn demo-pc"
                >
                  <span className="demo-role-badge">PROJECT COORD</span>
                  <span className="demo-name">Sarah Connor</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('tl@mrasync.com')}
                  className="demo-btn demo-tl"
                >
                  <span className="demo-role-badge">TEAM LEAD (TL)</span>
                  <span className="demo-name">Michael Scott</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('subtl@mrasync.com')}
                  className="demo-btn demo-subtl"
                >
                  <span className="demo-role-badge">SUB-TL</span>
                  <span className="demo-name">Jim Halpert</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('hr@mrasync.com')}
                  className="demo-btn demo-hr"
                >
                  <span className="demo-role-badge">HR MANAGER</span>
                  <span className="demo-name">Pam Beesly</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('john@mrasync.com')}
                  className="demo-btn demo-emp"
                >
                  <span className="demo-role-badge">EMPLOYEE</span>
                  <span className="demo-name">John Doe</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
