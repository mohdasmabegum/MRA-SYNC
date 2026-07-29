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
    { value: 'TL', label: 'Team Lead (TL - Team Scope & Inventory Track)' },
    { value: 'HR', label: 'HR Manager (Leave Approvals & Work Completion Time Ranges)' },
    { value: 'EMPLOYEE', label: 'Employee (Personal Work Log & Task Portal)' }
  ];

  const handleQuickDemoLogin = (email, roleLabel) => {
    const users = getUsers();
    const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      showToast(`Logged in as ${targetUser.name} (${targetUser.role})`, 'login', 'Authentication Successful');
      showModalPopup({
        title: 'Authentication Successful',
        message: `Welcome back, ${targetUser.name}! You are currently logged in with privileges for: [${targetUser.role}]. Local database ready.`,
        iconType: 'login',
        confirmText: 'Enter Dashboard'
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
        setErrorMsg('Invalid email or password. Try a demo account below.');
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
            <img src={logoImg} alt="MRA Logo" className="auth-logo-img" />
          </div>
          <h2 className="brand-title">
            <span className="text-gradient-gold">MRA</span> <span className="text-gradient-silver">SYND</span>
          </h2>
          <p className="brand-subtitle">CONNECT • COORDINATE • COMPLETE</p>

          <div className="brand-features-list">
            <div className="feature-item">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span><strong>100% Local Browser Database</strong> - Zero 3rd-party data leaks</span>
            </div>
            <div className="feature-item">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span><strong>CEO Special Console</strong> - Direct shortcut to backend sheets</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
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
              <div className="error-alert">
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
                    placeholder="e.g. ceo@mrasynd.com"
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
                <span>{isLogin ? 'Sign In to Portal' : 'Create Local Account'}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>

            {/* Quick Demo Login Switcher */}
            <div className="demo-accounts-section">
              <div className="demo-header">
                <span>⚡ 1-Click Quick Role Switch (For Testing & Review)</span>
              </div>
              <div className="demo-grid">
                <button
                  onClick={() => handleQuickDemoLogin('ceo@mrasynd.com', 'CEO')}
                  className="demo-btn demo-ceo"
                >
                  <span className="demo-role-badge">CEO / DIRECTOR</span>
                  <span className="demo-name">Alexander Vance</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('pc@mrasynd.com', 'Project Coordinator')}
                  className="demo-btn demo-pc"
                >
                  <span className="demo-role-badge">PROJECT COORD</span>
                  <span className="demo-name">Sarah Connor</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('tl@mrasynd.com', 'TL')}
                  className="demo-btn demo-tl"
                >
                  <span className="demo-role-badge">TEAM LEAD (TL)</span>
                  <span className="demo-name">Michael Scott</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('hr@mrasynd.com', 'HR')}
                  className="demo-btn demo-hr"
                >
                  <span className="demo-role-badge">HR MANAGER</span>
                  <span className="demo-name">Pam Beesly</span>
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('john@mrasynd.com', 'Employee')}
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
