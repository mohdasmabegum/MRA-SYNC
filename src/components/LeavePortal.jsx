import React, { useState, useEffect } from 'react';
import { getLeaves, addLeaveRequest, updateLeaveStatus } from '../services/db';
import { useToast } from '../context/ToastContext';
import { CalendarCheck, PlusCircle, Check, X, Clock, AlertCircle, FileText, User, Building, Phone, Calendar } from 'lucide-react';

export const LeavePortal = ({ activeUser }) => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: activeUser?.name || '',
    empId: activeUser?.id || '',
    dept: activeUser?.dept || 'Hardware & Embedded Systems',
    fromTo: '',
    purpose: '',
    leaveType: 'EL', // EL or CL
    requirementType: 'General', // Emergency / Important / General
    contact: '',
    noOfDays: 1
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
    if (!formData.fromTo || !formData.purpose || !formData.contact) {
      showToast('Please fill in all mandatory fields.', 'error', 'Validation Failure');
      return;
    }

    addLeaveRequest(formData);
    showToast('Leave application submitted successfully for review!', 'success', 'Leave Submitted');
    setShowForm(false);
    setFormData({
      name: activeUser?.name || '',
      empId: activeUser?.id || '',
      dept: activeUser?.dept || 'Hardware & Embedded Systems',
      fromTo: '',
      purpose: '',
      leaveType: 'EL',
      requirementType: 'General',
      contact: '',
      noOfDays: 1
    });
  };

  const handleStatusChange = (id, newStatus) => {
    updateLeaveStatus(id, newStatus, activeUser?.name);
    showToast(`Leave application ${id} marked as ${newStatus}`, newStatus === 'Approved' ? 'success' : 'warning');
  };

  const canApprove = activeUser?.role === 'HR' || activeUser?.role === 'CEO/FOUNDER/DIRECTOR' || activeUser?.role === 'TL';

  return (
    <div className="portal-page-container">
      {/* Header Bar */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title">
            <CalendarCheck className="w-6 h-6 text-amber-400 inline mr-2" />
            Leave Application Portal
          </h2>
          <p className="portal-subtitle">Submit, track, and manage employee leave applications with automated database sheet logging.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-5 h-5 mr-1" />
          <span>{showForm ? 'Cancel Application' : 'Apply for Leave'}</span>
        </button>
      </div>

      {/* Form Drawer / Modal */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card form-card p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
            📝 New Leave Application Form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={formData.empId} onChange={e => setFormData({ ...formData, empId: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Date Range (From - To)</label>
              <input type="text" placeholder="e.g. 2026-08-10 to 2026-08-12" value={formData.fromTo} onChange={e => setFormData({ ...formData, fromTo: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Total Number of Days</label>
              <input type="number" min="1" max="30" value={formData.noOfDays} onChange={e => setFormData({ ...formData, noOfDays: parseInt(e.target.value) || 1 })} required />
            </div>

            <div className="form-group">
              <label>Emergency Contact Number</label>
              <input type="text" placeholder="+1 555-0199" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Type of Leave</label>
              <select value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })}>
                <option value="EL">Earned Leave (EL)</option>
                <option value="CL">Casual Leave (CL)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Requirement Priority</label>
              <select value={formData.requirementType} onChange={e => setFormData({ ...formData, requirementType: e.target.value })}>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Important">Important ⚠️</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>

            <div className="form-group md:col-span-3">
              <label>Purpose of Leave</label>
              <textarea placeholder="State clear reason for leave request..." value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} required rows={2}></textarea>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Submit Leave Application</button>
          </div>
        </form>
      )}

      {/* Leave Application Records Table */}
      <div className="glow-card p-5">
        <h3 className="text-md font-bold text-slate-200 mb-4">
          Submitted Applications Sheet Log ({leaves.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Employee Details</th>
                <th>Leave Type</th>
                <th>Date Range & Days</th>
                <th>Priority</th>
                <th>Purpose</th>
                <th>Applied Date</th>
                <th>Approved By</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td className="font-mono text-amber-400 text-xs font-semibold">{l.id}</td>
                  <td>
                    <div className="font-semibold text-white">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.empId} • {l.dept}</div>
                  </td>
                  <td>
                    <span className="badge-tag bg-slate-800 text-amber-300 font-bold">{l.leaveType}</span>
                  </td>
                  <td>
                    <div className="text-xs text-white">{l.fromTo}</div>
                    <div className="text-xs text-slate-400">({l.noOfDays} Days)</div>
                  </td>
                  <td>
                    <span className={`badge-tag ${l.requirementType === 'Emergency' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                      {l.requirementType}
                    </span>
                  </td>
                  <td className="text-xs text-slate-300 max-w-xs truncate">{l.purpose}</td>
                  <td className="text-xs text-slate-400">{l.appliedDate}</td>
                  <td className="text-xs text-slate-300">{l.approvedBy}</td>
                  <td>
                    <span className={`status-pill ${
                      l.status === 'Approved' ? 'pill-active' :
                      l.status === 'Rejected' ? 'pill-leave' : 'pill-pending'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {l.status === 'Pending' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleStatusChange(l.id, 'Approved')} className="action-btn action-approve" title="Approve Leave">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(l.id, 'Rejected')} className="action-btn action-reject" title="Reject Leave">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
