import React, { useState, useEffect } from 'react';
import { getLeaves, addLeaveRequest, updateLeaveStatus } from '../services/db';
import { useToast } from '../context/ToastContext';
import { CalendarCheck, PlusCircle, CheckCircle, XCircle, UserX, ArrowLeft, Users, Clock } from 'lucide-react';

const S = {
  th: { color: 'var(--text-3)', fontSize: '0.71rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', padding: '11px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-2)', fontSize: '0.83rem', verticalAlign: 'middle' },
  id: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)' },
  name: { fontWeight: 700, color: 'var(--text-1)' },
  muted: { color: 'var(--text-3)', fontSize: '0.75rem' },
  amber: { color: 'var(--amber)', fontWeight: 600 },
  empty: { color: 'var(--text-3)', fontStyle: 'italic', textAlign: 'center', padding: '24px' },
  sectionHead: { fontWeight: 700, color: 'var(--text-1)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' },
  formHead: { fontWeight: 700, color: 'var(--text-1)', fontSize: '1rem', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' },
  badgePill: (color) => ({ background: `rgba(${color},0.10)`, border: `1px solid rgba(${color},0.25)`, padding: '2px 9px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 600 }),
  tag: { background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', padding: '2px 9px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-2)' },
};

export const LeavePortal = ({ activeUser, onBackToDashboard }) => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTabSubView, setActiveTabSubView] = useState('on_leave_first');

  const isHR = activeUser?.role === 'HR';
  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';

  const [formData, setFormData] = useState({
    empId: activeUser?.id || '',
    name: activeUser?.name || '',
    dept: activeUser?.dept || 'Hardware & Embedded Systems',
    fromTo: '',
    contact: '',
    noOfDays: 1,
    purpose: '',
    leaveType: 'EL',
    requirementType: 'Quick'
  });

  useEffect(() => {
    loadLeaves();
    window.addEventListener('mra_db_updated', loadLeaves);
    return () => window.removeEventListener('mra_db_updated', loadLeaves);
  }, []);

  const loadLeaves = () => setLeaves(getLeaves());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fromTo || !formData.purpose) { showToast('Please enter leave dates and purpose.', 'error'); return; }
    addLeaveRequest(formData);
    showToast('Leave application submitted successfully!', 'success', 'Application Pending');
    setShowForm(false);
    setFormData({ empId: activeUser?.id || '', name: activeUser?.name || '', dept: activeUser?.dept || 'Hardware & Embedded Systems', fromTo: '', contact: '', noOfDays: 1, purpose: '', leaveType: 'EL', requirementType: 'Quick' });
  };

  const handleApprove = (id) => { updateLeaveStatus(id, 'Approved', `${activeUser?.name} (${activeUser?.role})`); showToast(`Leave ${id} APPROVED!`, 'success'); };
  const handleReject  = (id) => { updateLeaveStatus(id, 'Rejected', `${activeUser?.name} (${activeUser?.role})`); showToast(`Leave ${id} REJECTED.`, 'warning'); };

  const currentlyOnLeave = leaves.filter(l => l.status === 'Approved');
  const myLeaves         = leaves.filter(l => l.empId === activeUser?.id);
  const pendingLeaves    = leaves.filter(l => l.status === 'Pending');

  return (
    <div className="portal-page-container">
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" /><span>Return to Dashboard</span>
      </button>

      {/* Header */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <CalendarCheck style={{color:'var(--amber)'}} className="w-6 h-6" />
            Leave Application Portal
          </h2>
          <p className="portal-subtitle">On-leave employees shown first. Apply for leave or manage approvals below.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'New Leave Application'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card" style={{padding:'24px'}}>
          <h3 style={S.formHead}>📝 New Leave Application</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={formData.name} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={formData.empId} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" value={formData.dept} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Leave Dates (From – To) <span style={{color:'var(--rose)'}}>*</span></label>
              <input type="text" placeholder="e.g. 2026-08-01 to 2026-08-03" value={formData.fromTo} onChange={e => setFormData({...formData,fromTo:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input type="text" placeholder="+1 555-0192" value={formData.contact} onChange={e => setFormData({...formData,contact:e.target.value})} />
            </div>
            <div className="form-group">
              <label>Number of Days</label>
              <input type="number" min="1" value={formData.noOfDays} onChange={e => setFormData({...formData,noOfDays:parseInt(e.target.value)||1})} required />
            </div>
            <div className="form-group">
              <label>Leave Type</label>
              <select value={formData.leaveType} onChange={e => setFormData({...formData,leaveType:e.target.value})}>
                <option value="EL">Earned Leave (EL)</option>
                <option value="CL">Casual Leave (CL)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <select value={formData.requirementType} onChange={e => setFormData({...formData,requirementType:e.target.value})}>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Quick">Quick ⚡</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>
            <div className="form-group md:col-span-3" style={{gridColumn:'1/-1'}}>
              <label>Detailed Purpose <span style={{color:'var(--rose)'}}>*</span></label>
              <textarea placeholder="State the reason for your leave application..." value={formData.purpose} onChange={e => setFormData({...formData,purpose:e.target.value})} required rows={2} />
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'16px'}}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Submit Leave Application</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
        <button onClick={() => setActiveTabSubView('on_leave_first')} className={`tab-btn ${activeTabSubView==='on_leave_first'?'active':''}`}>
          <UserX className="w-3.5 h-3.5" /> On-Leave Now ({currentlyOnLeave.length})
        </button>
        <button onClick={() => setActiveTabSubView('my_leaves')} className={`tab-btn ${activeTabSubView==='my_leaves'?'active':''}`}>
          <Clock className="w-3.5 h-3.5" /> My Leave History ({myLeaves.length})
        </button>
      </div>

      {/* Tab 1: Currently On Leave */}
      {activeTabSubView === 'on_leave_first' && (
        <div className="glow-card" style={{padding:'24px'}}>
          <h3 style={S.sectionHead}>
            <UserX style={{width:'18px',height:'18px',color:'var(--rose)'}} />
            Currently On-Leave – Approved Roster ({currentlyOnLeave.length})
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {['Leave ID','Employee','Employee ID','Department','Type','Dates','Purpose','Approved By','Status'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentlyOnLeave.length === 0 ? (
                  <tr><td colSpan="9" style={S.empty}>No employees currently on approved leave.</td></tr>
                ) : currentlyOnLeave.map(l => (
                  <tr key={l.id}>
                    <td style={{...S.td,...S.id}}>{l.id}</td>
                    <td style={{...S.td,...S.name}}>{l.name}</td>
                    <td style={{...S.td,...S.muted}}>{l.empId}</td>
                    <td style={{...S.td,...S.amber}}>{l.dept}</td>
                    <td style={S.td}><span style={{...S.badgePill('252,129,129'),color:'var(--rose)'}}>{l.leaveType}</span></td>
                    <td style={{...S.td,...S.muted}}>{l.fromTo}</td>
                    <td style={{...S.td,maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.purpose}</td>
                    <td style={{...S.td,...S.muted}}>{l.approvedBy}</td>
                    <td style={S.td}><span className="status-pill pill-leave">On Leave</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: My Personal Leaves */}
      {activeTabSubView === 'my_leaves' && (
        <div className="glow-card" style={{padding:'24px'}}>
          <h3 style={S.sectionHead}>
            <CalendarCheck style={{width:'18px',height:'18px',color:'var(--amber)'}} />
            My Leave Applications ({myLeaves.length})
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {['Leave ID','Type','Dates','Days','Purpose','Applied On','Status','Approver'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr><td colSpan="8" style={S.empty}>No leave applications found for your account.</td></tr>
                ) : myLeaves.map(l => (
                  <tr key={l.id}>
                    <td style={{...S.td,...S.id}}>{l.id}</td>
                    <td style={S.td}><span style={{...S.badgePill('236,201,75'),color:'var(--amber)'}}>{l.leaveType}</span></td>
                    <td style={{...S.td,...S.muted}}>{l.fromTo}</td>
                    <td style={{...S.td,...S.amber}}>{l.noOfDays}</td>
                    <td style={S.td}>{l.purpose}</td>
                    <td style={{...S.td,...S.muted}}>{l.appliedDate}</td>
                    <td style={S.td}>
                      <span className={`status-pill ${l.status==='Approved'?'pill-leave':l.status==='Pending'?'pill-pending':'pill-active'}`}>{l.status}</span>
                    </td>
                    <td style={{...S.td,...S.muted}}>{l.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HR & CEO Approvals */}
      {(isHR || isCEO) && (
        <div className="glow-card" style={{padding:'24px'}}>
          <h3 style={S.sectionHead}>
            <Users style={{width:'18px',height:'18px',color:'var(--blue)'}} />
            Pending Approvals Matrix ({pendingLeaves.length})
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {['Leave ID','Employee','Department','Type','Dates','Days','Purpose','Action'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.length === 0 ? (
                  <tr><td colSpan="8" style={S.empty}>No pending leave applications requiring approval.</td></tr>
                ) : pendingLeaves.map(l => (
                  <tr key={l.id}>
                    <td style={{...S.td,...S.id}}>{l.id}</td>
                    <td style={S.td}>
                      <div style={S.name}>{l.name}</div>
                      <div style={S.muted}>{l.empId}</div>
                    </td>
                    <td style={{...S.td,...S.amber}}>{l.dept}</td>
                    <td style={S.td}><span style={{...S.badgePill('236,201,75'),color:'var(--amber)'}}>{l.leaveType}</span></td>
                    <td style={{...S.td,...S.muted}}>{l.fromTo}</td>
                    <td style={{...S.td,...S.amber}}>{l.noOfDays}</td>
                    <td style={S.td}>{l.purpose}</td>
                    <td style={S.td}>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={() => handleApprove(l.id)} className="btn-emerald btn-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleReject(l.id)} className="btn-amber btn-xs">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
