import React, { useState, useEffect } from 'react';
import { getLeaves, addLeaveRequest, updateLeaveStatus } from '../services/db';
import { useToast } from '../context/ToastContext';
import { CalendarCheck, PlusCircle, CheckCircle, XCircle, UserX, ArrowLeft, Users } from 'lucide-react';

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

  const loadLeaves = () => {
    setLeaves(getLeaves());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fromTo || !formData.purpose) {
      showToast('Please enter leave dates and purpose.', 'error');
      return;
    }

    addLeaveRequest(formData);
    showToast('Leave application submitted successfully!', 'success', 'Application Pending');
    setShowForm(false);
    setFormData({
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
  };

  const handleApprove = (id) => {
    updateLeaveStatus(id, 'Approved', `${activeUser?.name} (${activeUser?.role})`);
    showToast(`Leave application ${id} APPROVED!`, 'success');
  };

  const handleReject = (id) => {
    updateLeaveStatus(id, 'Rejected', `${activeUser?.name} (${activeUser?.role})`);
    showToast(`Leave application ${id} REJECTED.`, 'warning');
  };

  const currentlyOnLeaveMembers = leaves.filter(l => l.status === 'Approved');
  const myPersonalLeaves = leaves.filter(l => l.empId === activeUser?.id);

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
            <CalendarCheck className="w-6 h-6 text-amber-400" />
            Leave Application Portal
          </h2>
          <p className="portal-subtitle">Currently on-leave employees shown first. Apply for leaves or manage approvals.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-5 h-5 mr-1" />
          <span>{showForm ? 'Cancel Application' : 'New Leave Application'}</span>
        </button>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card form-card p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
            📝 New Leave Application Form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={formData.name} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={formData.empId} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" value={formData.dept} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Leave Dates (From - To) <span className="text-rose-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. 2026-08-01 to 2026-08-03"
                value={formData.fromTo}
                onChange={e => setFormData({ ...formData, fromTo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact No.</label>
              <input
                type="text"
                placeholder="+1 555-0192"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Number of Days</label>
              <input
                type="number"
                min="1"
                value={formData.noOfDays}
                onChange={e => setFormData({ ...formData, noOfDays: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="form-group">
              <label>Type of Leave</label>
              <select value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })}>
                <option value="EL">Earned Leave (EL)</option>
                <option value="CL">Casual Leave (CL)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Urgency / Requirement</label>
              <select value={formData.requirementType} onChange={e => setFormData({ ...formData, requirementType: e.target.value })}>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Quick">Quick ⚡</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>

            <div className="form-group md:col-span-3">
              <label>Detailed Purpose <span className="text-rose-400">*</span></label>
              <textarea
                placeholder="State the reason for your leave application..."
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                required
                rows={2}
              ></textarea>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Submit Leave Application</button>
          </div>
        </form>
      )}

      {/* Sub-view Tab Switcher */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setActiveTabSubView('on_leave_first')}
          className={`tab-btn ${activeTabSubView === 'on_leave_first' ? 'active' : ''}`}
        >
          <UserX className="w-3.5 h-3.5 text-rose-400" /> Currently On-Leave Members FIRST ({currentlyOnLeaveMembers.length})
        </button>

        <button
          onClick={() => setActiveTabSubView('my_leaves')}
          className={`tab-btn ${activeTabSubView === 'my_leaves' ? 'active' : ''}`}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-amber-400" /> My Leave History ({myPersonalLeaves.length})
        </button>
      </div>

      {/* SUB-VIEW 1: CURRENTLY ON-LEAVE MEMBERS SHOWN FIRST */}
      {activeTabSubView === 'on_leave_first' && (
        <div className="glow-card p-5 border-rose-500/30">
          <h3 className="text-md font-bold text-rose-400 mb-4 flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-400" />
            Currently On-Leave Approved Roster ({currentlyOnLeaveMembers.length})
          </h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Purpose</th>
                  <th>Approved By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentlyOnLeaveMembers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-slate-500 italic">No employees currently on approved leave.</td>
                  </tr>
                ) : (
                  currentlyOnLeaveMembers.map(l => (
                    <tr key={l.id}>
                      <td className="font-mono text-cyan-400 text-xs font-semibold">{l.id}</td>
                      <td className="font-bold text-white">{l.name}</td>
                      <td className="font-mono text-xs text-slate-400">{l.empId}</td>
                      <td className="text-amber-400">{l.dept}</td>
                      <td><span className="badge-tag bg-rose-500/20 text-rose-300">{l.leaveType}</span></td>
                      <td className="font-mono text-xs">{l.fromTo}</td>
                      <td className="text-slate-300 max-w-xs truncate">{l.purpose}</td>
                      <td className="text-xs text-slate-400">{l.approvedBy}</td>
                      <td><span className="status-pill pill-leave">On Leave</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MY PERSONAL LEAVE HISTORY */}
      {activeTabSubView === 'my_leaves' && (
        <div className="glow-card p-5 border-amber-500/30">
          <h3 className="text-md font-bold text-amber-400 mb-4">
            My Personal Leave Applications ({myPersonalLeaves.length})
          </h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Purpose</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Approver</th>
                </tr>
              </thead>
              <tbody>
                {myPersonalLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-slate-500 italic">No leave applications found for your account.</td>
                  </tr>
                ) : (
                  myPersonalLeaves.map(l => (
                    <tr key={l.id}>
                      <td className="font-mono text-cyan-400 text-xs font-semibold">{l.id}</td>
                      <td><span className="badge-tag bg-amber-500/20 text-amber-300">{l.leaveType}</span></td>
                      <td className="font-mono text-xs">{l.fromTo}</td>
                      <td className="font-mono text-amber-300">{l.noOfDays}</td>
                      <td className="text-slate-300">{l.purpose}</td>
                      <td className="text-xs text-slate-400">{l.appliedDate}</td>
                      <td>
                        <span className={`status-pill ${l.status === 'Approved' ? 'pill-leave' : l.status === 'Pending' ? 'pill-pending' : 'pill-active'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">{l.approvedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HR & CEO Pending Approvals Matrix */}
      {(isHR || isCEO) && (
        <div className="glow-card p-5 mt-6 border-cyan-500/30">
          <h3 className="text-md font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            HR & Executive Pending Approvals Matrix ({leaves.filter(l => l.status === 'Pending').length})
          </h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Purpose</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.filter(l => l.status === 'Pending').length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-slate-500 italic">No pending leave applications requiring approval.</td>
                  </tr>
                ) : (
                  leaves.filter(l => l.status === 'Pending').map(l => (
                    <tr key={l.id}>
                      <td className="font-mono text-cyan-400 text-xs font-semibold">{l.id}</td>
                      <td>
                        <div className="font-bold text-white">{l.name}</div>
                        <div className="text-xs text-slate-400">{l.empId}</div>
                      </td>
                      <td className="text-amber-400">{l.dept}</td>
                      <td><span className="badge-tag bg-amber-500/20 text-amber-300">{l.leaveType}</span></td>
                      <td className="font-mono text-xs">{l.fromTo}</td>
                      <td className="font-mono text-amber-300">{l.noOfDays}</td>
                      <td className="text-slate-300">{l.purpose}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(l.id)} className="btn-emerald btn-xs">
                            <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Approve
                          </button>
                          <button onClick={() => handleReject(l.id)} className="btn-amber btn-xs">
                            <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
