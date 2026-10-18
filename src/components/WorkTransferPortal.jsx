import React, { useState, useEffect } from 'react';
import { getUsers, getWorkLogs, addWorkLog, updateWorkLogStatus } from '../services/db';
import { useToast } from '../context/ToastContext';
import { ArrowRightLeft, PlusCircle, FileCheck, HardDrive, Boxes, ArrowLeft } from 'lucide-react';

const TH = { color:'var(--text-3)', fontSize:'0.71rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px', padding:'11px 14px', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' };
const TD = { padding:'12px 14px', borderBottom:'1px solid var(--border-subtle)', color:'var(--text-2)', fontSize:'0.83rem', verticalAlign:'middle' };
const EMPTY = { color:'var(--text-3)', fontStyle:'italic', textAlign:'center', padding:'24px' };

const PriorityTag = ({ val }) => {
  const isEmergency = val === 'Emergency';
  return (
    <span style={{
      background: isEmergency ? 'rgba(252,129,129,0.10)' : 'var(--bg-hover)',
      color: isEmergency ? 'var(--rose)' : 'var(--text-2)',
      border: `1px solid ${isEmergency ? 'rgba(252,129,129,0.25)' : 'var(--border-subtle)'}`,
      padding:'2px 9px', borderRadius:'12px', fontSize:'0.68rem', fontWeight:600, display:'inline-flex'
    }}>{val}</span>
  );
};

export const WorkTransferPortal = ({ activeUser, onNavigateToInventory, onBackToDashboard }) => {
  const { showToast, showModalPopup } = useToast();
  const [workLogs,   setWorkLogs]   = useState([]);
  const [usersList,  setUsersList]  = useState([]);
  const [showForm,   setShowForm]   = useState(false);

  const isCEO      = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC       = activeUser?.role === 'PROJECT_COORDINATOR';
  const isTLOrSubTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isNormalEmp = activeUser?.role === 'EMPLOYEE';

  const [formData, setFormData] = useState({
    workAlloter: activeUser?.name || '', senderEmpId: activeUser?.id || '',
    fromDept: activeUser?.dept || 'Hardware & Embedded Systems',
    toDept: 'Software & AI Systems', receiverEmpId: '', receiverName: '',
    projectName: '', hardwareDocInfo: '', requirement: 'Quick'
  });

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, []);

  const loadData = () => { setWorkLogs(getWorkLogs()); setUsersList(getUsers()); };

  const handleReceiverSelect = (empId) => {
    const sel = usersList.find(u => u.id === empId);
    if (sel) setFormData({...formData, receiverEmpId:sel.id, receiverName:sel.name, toDept:sel.dept});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hardwareDocInfo || formData.hardwareDocInfo.trim().length < 10) {
      showToast('Hardware & Document details are MANDATORY! Please specify schematic versions, documentation, and hardware condition.', 'error', 'Verification Failed');
      return;
    }
    if (!formData.receiverEmpId || !formData.projectName) { showToast('Please select a target employee and project name.', 'error'); return; }
    const newLog = addWorkLog(formData);
    showToast(`Work transfer #${newLog.id} sent to ${formData.receiverName}!`, 'success', 'Request Created');
    showModalPopup({ title:'Work Request Dispatched', message:`"${formData.projectName}" assigned to ${formData.receiverName} (${formData.toDept}).`, iconType:'info', confirmText:'Acknowledged' });
    setShowForm(false);
    setFormData({ workAlloter:activeUser?.name||'', senderEmpId:activeUser?.id||'', fromDept:activeUser?.dept||'Hardware & Embedded Systems', toDept:'Software & AI Systems', receiverEmpId:'', receiverName:'', projectName:'', hardwareDocInfo:'', requirement:'Quick' });
  };

  const handleAcceptTask   = (id, hwDoc) => { if (!hwDoc) { showToast('Verify hardware & documentation received first!', 'warning'); return; } updateWorkLogStatus(id, 'Accepted / In Progress', {hardwareDocReceived:true}); showToast(`Task ${id} accepted!`, 'success'); };
  const handleRejectTask   = (id) => { const r = prompt('Enter rejection reason:'); if (r !== null) { updateWorkLogStatus(id, 'Rejected', {rejectionReason:r}); showToast(`Task ${id} rejected.`, 'warning'); } };
  const handleMarkComplete = (id) => {
    const task = workLogs.find(w => w.id === id);
    updateWorkLogStatus(id, 'Completed ✅');
    showToast(`Task #${id} COMPLETED!`, 'success', 'Task Complete!');
    showModalPopup({ title:'✅ Task Completed', message:`"${task.projectName}" marked completed by ${task.receiverName}.`, iconType:'info', confirmText:'Great!' });
  };

  const displayed = workLogs.filter(w => {
    if (isNormalEmp)  return w.receiverEmpId === activeUser?.id || w.senderEmpId === activeUser?.id;
    if (isTLOrSubTL) return w.fromDept === activeUser?.dept || w.toDept === activeUser?.dept;
    return true;
  });

  return (
    <div className="portal-page-container">
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" /><span>Return to Dashboard</span>
      </button>

      {/* Header */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <ArrowRightLeft style={{color:'var(--emerald)'}} className="w-6 h-6" />
            Transfer Track of Work
          </h2>
          <p className="portal-subtitle">Cross-departmental task delegation with mandatory hardware & documentation verification.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Allot Work Task'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card" style={{padding:'24px'}}>
          <h3 style={{fontWeight:700, color:'var(--text-1)', fontSize:'1rem', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border-subtle)'}}>
            🔄 Create Work Transfer Task
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Work Alloter (Sender)</label>
              <input type="text" value={formData.workAlloter} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>From Department</label>
              <input type="text" value={formData.fromDept} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Target Receiver <span style={{color:'var(--rose)'}}>*</span></label>
              <select value={formData.receiverEmpId} onChange={e => handleReceiverSelect(e.target.value)} required>
                <option value="">Select Employee...</option>
                {usersList.filter(u => u.id !== activeUser?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.dept} – {u.id})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{gridColumn:'span 2'}}>
              <label>Project Name <span style={{color:'var(--rose)'}}>*</span></label>
              <input type="text" placeholder="e.g. Telemetry Gateway Module v3" value={formData.projectName} onChange={e => setFormData({...formData,projectName:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <select value={formData.requirement} onChange={e => setFormData({...formData,requirement:e.target.value})}>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Quick">Quick ⚡</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label style={{color:'var(--amber)', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px'}}>
                <HardDrive className="w-4 h-4" />
                Hardware & Document Info (MANDATORY) <span style={{color:'var(--rose)'}}>*</span>
              </label>
              <textarea
                placeholder="Detail hardware specs, PCB versions, pinouts, test code repos, and attached physical document copies..."
                value={formData.hardwareDocInfo}
                onChange={e => setFormData({...formData,hardwareDocInfo:e.target.value})}
                required rows={3}
              />
              <span style={{fontSize:'0.72rem', color:'var(--text-3)', marginTop:'4px', display:'block'}}>
                Receiver can only accept if hardware & docs are confirmed delivered.
              </span>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'16px'}}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Create & Dispatch Request</button>
          </div>
        </form>
      )}

      {/* Work Logs Table */}
      <div className="glow-card" style={{padding:'24px'}}>
        <div style={{fontWeight:700, color:'var(--text-1)', fontSize:'0.92rem', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border-subtle)'}}>
          <span>Transfer Track of Work — Log Sheet ({displayed.length})</span>
          {isNormalEmp && <span style={{fontSize:'0.72rem', color:'var(--amber)', fontWeight:500}}>Scope: Personal Logs Only</span>}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {['Task ID','Project','Alloter','Receiver','HW & Doc Info','Priority','Dates','Status','Actions'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan="9" style={EMPTY}>No work transfer logs found for your account scope.</td></tr>
              ) : displayed.map(w => {
                const isReceiver = w.receiverEmpId === activeUser?.id;
                return (
                  <tr key={w.id} style={isReceiver ? {background:'rgba(236,201,75,0.03)'} : {}}>
                    <td style={{...TD, fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', fontWeight:600, color:'var(--emerald)'}}>{w.id}</td>
                    <td style={TD}>
                      <div style={{fontWeight:700, color:'var(--text-1)'}}>{w.projectName}</div>
                      <div style={{fontSize:'0.72rem', color:'var(--text-3)'}}>{w.fromDept} → {w.toDept}</div>
                    </td>
                    <td style={{...TD, fontSize:'0.80rem'}}>{w.workAlloter}</td>
                    <td style={{...TD, color:'var(--amber)', fontWeight:600}}>{w.receiverName} <span style={{color:'var(--text-3)', fontWeight:400, fontSize:'0.72rem'}}>({w.receiverEmpId})</span></td>
                    <td style={{...TD, fontSize:'0.75rem', maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={w.hardwareDocInfo}>
                      <FileCheck style={{width:'12px',height:'12px',display:'inline',marginRight:'4px',color:'var(--blue)'}} />
                      {w.hardwareDocInfo}
                    </td>
                    <td style={TD}><PriorityTag val={w.requirement} /></td>
                    <td style={{...TD, fontSize:'0.72rem', color:'var(--text-3)'}}>
                      <div>Created: {w.createdDate}</div>
                      <div>Done: {w.completedDate}</div>
                    </td>
                    <td style={TD}>
                      <span className={`status-pill ${w.status.includes('Completed')?'pill-active':w.status.includes('Accepted')?'pill-pending':'pill-leave'}`}>{w.status}</span>
                    </td>
                    <td style={TD}>
                      <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                        {isReceiver && w.status === 'Pending Acceptance' && (
                          <div style={{display:'flex',gap:'5px'}}>
                            <button onClick={() => handleAcceptTask(w.id, true)} className="btn-emerald btn-xs">Accept</button>
                            <button onClick={() => handleRejectTask(w.id)} className="btn-amber btn-xs">Reject</button>
                          </div>
                        )}
                        {isReceiver && w.status.includes('Accepted') && (
                          <div style={{display:'flex',gap:'5px'}}>
                            <button onClick={() => handleMarkComplete(w.id)} className="btn-gold btn-xs">Mark Complete ✅</button>
                            <button onClick={onNavigateToInventory} className="btn-secondary btn-xs">
                              <Boxes className="w-3 h-3" /> Material
                            </button>
                          </div>
                        )}
                        {w.status.includes('Completed') && <span style={{fontSize:'0.72rem', color:'var(--emerald)', fontWeight:600}}>✓ Verified Complete</span>}
                        {w.status === 'Rejected' && <span style={{fontSize:'0.72rem', color:'var(--rose)', fontStyle:'italic'}}>Reason: {w.rejectionReason}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
