import React, { useState, useEffect } from 'react';
import { getUsers, getWorkLogs, addWorkLog, updateWorkLogStatus } from '../services/db';
import { useToast } from '../context/ToastContext';
import { ArrowRightLeft, PlusCircle, FileCheck, HardDrive, Boxes, ArrowLeft } from 'lucide-react';

export const WorkTransferPortal = ({ activeUser, onNavigateToInventory }) => {
  const { showToast, showModalPopup } = useToast();
  const [workLogs, setWorkLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isTLOrSubTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isNormalEmp = activeUser?.role === 'EMPLOYEE';

  const [formData, setFormData] = useState({
    workAlloter: activeUser?.name || '',
    senderEmpId: activeUser?.id || '',
    fromDept: activeUser?.dept || 'Hardware & Embedded Systems',
    toDept: 'Software & AI Systems',
    receiverEmpId: '',
    receiverName: '',
    projectName: '',
    hardwareDocInfo: '',
    requirement: 'Quick'
  });

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, []);

  const loadData = () => {
    setWorkLogs(getWorkLogs());
    setUsersList(getUsers());
  };

  const handleReceiverSelect = (empId) => {
    const selected = usersList.find(u => u.id === empId);
    if (selected) {
      setFormData({
        ...formData,
        receiverEmpId: selected.id,
        receiverName: selected.name,
        toDept: selected.dept
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.hardwareDocInfo || formData.hardwareDocInfo.trim().length < 10) {
      showToast('Hardware & Document details are MANDATORY! Please specify schematic versions, documentation, and hardware condition.', 'error', 'Mandatory Verification Failed');
      return;
    }

    if (!formData.receiverEmpId || !formData.projectName) {
      showToast('Please select a target employee and project name.', 'error');
      return;
    }

    const newLog = addWorkLog(formData);
    showToast(`Work transfer request #${newLog.id} created! Sent to ${formData.receiverName}'s account inbox.`, 'success', 'Request Created');

    showModalPopup({
      title: 'Work Request Created & Dispatched',
      message: `Work request for "${formData.projectName}" has been successfully assigned to ${formData.receiverName} (${formData.toDept}). A notification pop-up will appear in their account.`,
      iconType: 'info',
      confirmText: 'Acknowledged'
    });

    setShowForm(false);
    setFormData({
      workAlloter: activeUser?.name || '',
      senderEmpId: activeUser?.id || '',
      fromDept: activeUser?.dept || 'Hardware & Embedded Systems',
      toDept: 'Software & AI Systems',
      receiverEmpId: '',
      receiverName: '',
      projectName: '',
      hardwareDocInfo: '',
      requirement: 'Quick'
    });
  };

  const handleAcceptTask = (id, hwDocReceived) => {
    if (!hwDocReceived) {
      showToast('CANNOT ACCEPT TASK: You must verify and check that Hardware & Documentation have been physically received!', 'warning', 'Verification Mandatory');
      return;
    }

    updateWorkLogStatus(id, 'Accepted / In Progress', { hardwareDocReceived: true });
    showToast(`Task ${id} accepted! Status updated to In Progress.`, 'success');
  };

  const handleRejectTask = (id) => {
    const reason = prompt('Please enter rejection reason (e.g. Currently working on another emergency task):');
    if (reason !== null) {
      updateWorkLogStatus(id, 'Rejected', { rejectionReason: reason });
      showToast(`Task ${id} rejected. Sender notified.`, 'warning');
    }
  };

  const handleMarkComplete = (id) => {
    const task = workLogs.find(w => w.id === id);
    updateWorkLogStatus(id, 'Completed ✅');

    showToast(`Work request #${id} marked as COMPLETED ✅! Alert popped up to sender (${task.workAlloter}).`, 'success', 'Task Complete!');

    showModalPopup({
      title: '✅ Work Task Completed Notification',
      message: `Requested work for "${task.projectName}" has been marked COMPLETED by ${task.receiverName}. Database work logs updated.`,
      iconType: 'info',
      confirmText: 'Great!'
    });
  };

  const displayedWorkLogs = workLogs.filter(w => {
    if (isNormalEmp) return w.receiverEmpId === activeUser?.id || w.senderEmpId === activeUser?.id;
    if (isTLOrSubTL) return w.fromDept === activeUser?.dept || w.toDept === activeUser?.dept;
    return true;
  });

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
          <h2 className="portal-title">
            <ArrowRightLeft className="w-6 h-6 text-emerald-400 inline mr-2" />
            Transfer Track of Work
          </h2>
          <p className="portal-subtitle">Cross-departmental task delegation with mandatory hardware & documentation verification.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-5 h-5 mr-1" />
          <span>{showForm ? 'Cancel Transfer' : 'Allot Work Task'}</span>
        </button>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card form-card p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
            🔄 Create Work Transfer Task
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Work Alloter (Sender)</label>
              <input type="text" value={formData.workAlloter} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>From Department</label>
              <input type="text" value={formData.fromDept} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Target Receiver Employee <span className="text-rose-400">*</span></label>
              <select
                value={formData.receiverEmpId}
                onChange={e => handleReceiverSelect(e.target.value)}
                required
              >
                <option value="">Select Target Employee...</option>
                {usersList.filter(u => u.id !== activeUser?.id).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.dept} - {u.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group md:col-span-2">
              <label>Project Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. Telemetry Gateway Module v3"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Requirement Urgency</label>
              <select
                value={formData.requirement}
                onChange={e => setFormData({ ...formData, requirement: e.target.value })}
              >
                <option value="Emergency">Emergency 🚨</option>
                <option value="Quick">Quick ⚡</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>

            <div className="form-group md:col-span-3">
              <label className="text-amber-400 font-semibold flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                Hardware & Document Related Info (MANDATORY) <span className="text-rose-400">*</span>
              </label>
              <textarea
                placeholder="Detail hardware specs, PCB versions, pinouts, test code repos, and attached physical document copies..."
                value={formData.hardwareDocInfo}
                onChange={e => setFormData({ ...formData, hardwareDocInfo: e.target.value })}
                required
                rows={3}
                className="border-amber-500/40 focus:border-amber-400"
              ></textarea>
              <span className="text-xs text-slate-400">Receiver can ONLY accept task if hardware & docs are confirmed delivered.</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Create & Dispatch Work Request</button>
          </div>
        </form>
      )}

      {/* Work Logs Master Table */}
      <div className="glow-card p-5">
        <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Transfer Track of Work Log Sheet ({displayedWorkLogs.length})</span>
          {isNormalEmp && <span className="text-xs text-amber-400 font-mono">Scope: Account Owner Personal Logs</span>}
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Project Name</th>
                <th>Work Alloter (Sender)</th>
                <th>Target Receiver</th>
                <th>Hardware & Doc Info</th>
                <th>Priority</th>
                <th>Created / Completed</th>
                <th>Status</th>
                <th>Receiver Controls</th>
              </tr>
            </thead>
            <tbody>
              {displayedWorkLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-slate-500 italic">No work transfer logs found for your account scope.</td>
                </tr>
              ) : (
                displayedWorkLogs.map(w => {
                  const isReceiver = w.receiverEmpId === activeUser?.id;

                  return (
                    <tr key={w.id} className={isReceiver ? 'bg-amber-500/5' : ''}>
                      <td className="font-mono text-emerald-400 text-xs font-semibold">{w.id}</td>
                      <td>
                        <div className="font-bold text-white">{w.projectName}</div>
                        <div className="text-xs text-slate-400">{w.fromDept} → {w.toDept}</div>
                      </td>
                      <td className="text-xs text-slate-300">{w.workAlloter}</td>
                      <td className="text-xs font-medium text-amber-300">{w.receiverName} ({w.receiverEmpId})</td>
                      <td className="text-xs text-slate-300 max-w-xs truncate" title={w.hardwareDocInfo}>
                        <FileCheck className="w-3 h-3 text-cyan-400 inline mr-1" />
                        {w.hardwareDocInfo}
                      </td>
                      <td>
                        <span className={`badge-tag ${w.requirement === 'Emergency' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                          {w.requirement}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">
                        <div>Created: {w.createdDate}</div>
                        <div>Done: {w.completedDate}</div>
                      </td>
                      <td>
                        <span className={`status-pill ${
                          w.status.includes('Completed') ? 'pill-active' :
                          w.status.includes('Accepted') ? 'pill-pending' : 'pill-leave'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {isReceiver && w.status === 'Pending Acceptance' && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleAcceptTask(w.id, true)} className="btn-emerald btn-xs">
                                Accept (HW Recv)
                              </button>
                              <button onClick={() => handleRejectTask(w.id)} className="btn-amber btn-xs">
                                Reject
                              </button>
                            </div>
                          )}

                          {isReceiver && w.status.includes('Accepted') && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleMarkComplete(w.id)} className="btn-gold btn-xs font-bold">
                                Mark Complete ✅
                              </button>
                              <button onClick={onNavigateToInventory} className="btn-secondary btn-xs" title="Request Material from Inventory">
                                <Boxes className="w-3 h-3 inline mr-1" /> Req Material
                              </button>
                            </div>
                          )}

                          {w.status.includes('Completed') && (
                            <span className="text-xs text-emerald-400 font-semibold">Verified Complete ✅</span>
                          )}

                          {w.status === 'Rejected' && (
                            <span className="text-xs text-rose-400 italic">Reason: {w.rejectionReason}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
