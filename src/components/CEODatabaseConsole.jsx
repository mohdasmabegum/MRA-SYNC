import React, { useState, useEffect } from 'react';
import {
  getLeaves,
  getMaterials,
  getWorkLogs,
  getUsers,
  exportDatabaseJSON,
  resetDatabaseToDefaults,
  deleteRecordFromSheet
} from '../services/db';
import { useToast } from '../context/ToastContext';
import { Database, Download, RefreshCw, Trash2, Search, Filter, ShieldAlert, FileSpreadsheet, Lock } from 'lucide-react';

export const CEODatabaseConsole = ({ activeUser }) => {
  const { showToast, showModalPopup } = useToast();
  const [activeSheet, setActiveSheet] = useState('leaves'); // leaves, materials, workLogs, users
  const [searchQuery, setSearchQuery] = useState('');

  const [leavesData, setLeavesData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [workLogsData, setWorkLogsData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    loadAllSheets();
    window.addEventListener('mra_db_updated', loadAllSheets);
    return () => window.removeEventListener('mra_db_updated', loadAllSheets);
  }, []);

  const loadAllSheets = () => {
    setLeavesData(getLeaves());
    setMaterialsData(getMaterials());
    setWorkLogsData(getWorkLogs());
    setUsersData(getUsers());
  };

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';

  if (!isCEO) {
    return (
      <div className="portal-page-container flex items-center justify-center min-h-[60vh]">
        <div className="glow-card p-8 text-center max-w-md">
          <Lock className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-white mb-2">Access Restricted to Executive Accounts</h3>
          <p className="text-sm text-slate-400 mb-4">
            The Raw Backend Database Console is an exclusive privilege reserved for CEO, Founder, and Director roles only.
          </p>
          <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded border border-amber-500/30">
            Please log in with Alexander Vance (CEO) to access raw database sheets.
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = (sheetKey, id) => {
    showModalPopup({
      title: 'Confirm Record Erasure',
      message: `Are you sure you want to permanently delete record ${id} from sheet database?`,
      iconType: 'warning',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteRecordFromSheet(sheetKey, id);
        showToast(`Record ${id} removed from database sheet.`, 'warning');
      }
    });
  };

  const handleReset = () => {
    showModalPopup({
      title: 'Reset Local Database to Seed Defaults',
      message: 'This will restore all default mock records and wipe custom added entries. Continue?',
      iconType: 'warning',
      confirmText: 'Reset Database',
      cancelText: 'Cancel',
      onConfirm: () => {
        resetDatabaseToDefaults();
        showToast('Database reset to defaults successfully.', 'success');
      }
    });
  };

  return (
    <div className="portal-page-container">
      {/* Header Bar */}
      <div className="portal-header-bar glow-card border-amber-500/40">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1">
            <Lock className="w-3 h-3" /> Privileged CEO / Director Backend Console
          </div>
          <h2 className="portal-title">
            <Database className="w-6 h-6 text-amber-400 inline mr-2" />
            Raw Backend Database Sheets & Logs
          </h2>
          <p className="portal-subtitle">Direct executive inspection, export, and management of raw local database tables.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={exportDatabaseJSON} className="btn-gold">
            <Download className="w-4 h-4 mr-1" /> Export DB (JSON)
          </button>
          <button onClick={handleReset} className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-1" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Sheet Selector Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSheet('leaves')}
          className={`tab-btn ${activeSheet === 'leaves' ? 'active' : ''}`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sheet 1: Leave Applications ({leavesData.length})</span>
        </button>

        <button
          onClick={() => setActiveSheet('materials')}
          className={`tab-btn ${activeSheet === 'materials' ? 'active' : ''}`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sheet 2: Material Requests ({materialsData.length})</span>
        </button>

        <button
          onClick={() => setActiveSheet('workLogs')}
          className={`tab-btn ${activeSheet === 'workLogs' ? 'active' : ''}`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sheet 3: Work Transfer Logs ({workLogsData.length})</span>
        </button>

        <button
          onClick={() => setActiveSheet('users')}
          className={`tab-btn ${activeSheet === 'users' ? 'active' : ''}`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sheet 4: User Accounts ({usersData.length})</span>
        </button>
      </div>

      {/* Raw Sheet Table Viewer */}
      <div className="glow-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-bold text-white uppercase font-mono">
            Sheet Table: {activeSheet}
          </h3>
          <div className="text-xs text-slate-400">
            Database Engine: Local Browser Persistence (100% Private)
          </div>
        </div>

        {/* Sheet 1: Leaves Table */}
        {activeSheet === 'leaves' && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>1. Emp ID</th>
                  <th>2. Name</th>
                  <th>3. Date Range</th>
                  <th>4. Contact</th>
                  <th>5. No Days</th>
                  <th>6. Type</th>
                  <th>7. Priority</th>
                  <th>8. Approved By</th>
                  <th>9. Applied Date</th>
                  <th>10. Accepted Date</th>
                  <th>11. Dept</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leavesData.map(l => (
                  <tr key={l.id}>
                    <td className="font-mono text-amber-400 text-xs">{l.empId}</td>
                    <td className="font-semibold text-white text-xs">{l.name}</td>
                    <td className="text-xs">{l.fromTo}</td>
                    <td className="text-xs">{l.contact}</td>
                    <td className="text-xs">{l.noOfDays}</td>
                    <td className="text-xs">{l.leaveType}</td>
                    <td className="text-xs">{l.requirementType}</td>
                    <td className="text-xs">{l.approvedBy}</td>
                    <td className="text-xs">{l.appliedDate}</td>
                    <td className="text-xs">{l.acceptedDate}</td>
                    <td className="text-xs">{l.dept}</td>
                    <td className="text-xs font-bold text-amber-400">{l.status}</td>
                    <td>
                      <button onClick={() => handleDelete('leaves', l.id)} className="action-btn action-reject">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sheet 2: Material Requests Table (Complete 18 Specs) */}
        {activeSheet === 'materials' && (
          <div className="table-responsive">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>1. Employee</th>
                  <th>2. ID</th>
                  <th>3. Material Needed</th>
                  <th>4. Units</th>
                  <th>5. Available?</th>
                  <th>6. Inventory Handler</th>
                  <th>7. Provided Status</th>
                  <th>8. Order Status</th>
                  <th>9. Request Date</th>
                  <th>10. Reached Date</th>
                  <th>11. Accepted Date</th>
                  <th>12. Provided Date</th>
                  <th>13. Order Placed Date</th>
                  <th>14. Order Received Date</th>
                  <th>15. Days to Order</th>
                  <th>16. Days to Provide</th>
                  <th>17. Log Updates</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materialsData.map(m => (
                  <tr key={m.id}>
                    <td className="font-mono text-cyan-400 font-bold">{m.id}</td>
                    <td>{m.empName}</td>
                    <td className="font-mono">{m.empId}</td>
                    <td>{m.materialType}</td>
                    <td>{m.noOfUnits}</td>
                    <td>{m.availableAtMoment}</td>
                    <td>{m.inventoryHandledBy}</td>
                    <td>{m.status}</td>
                    <td>{m.status.includes('Order') ? m.status : 'N/A'}</td>
                    <td>{m.requestDate}</td>
                    <td>{m.reachedDate}</td>
                    <td>{m.acceptedDate}</td>
                    <td>{m.providedDate}</td>
                    <td>{m.orderPlacedDate}</td>
                    <td>{m.orderReceivedDate}</td>
                    <td>{m.noOfDaysToReceiveOrder}</td>
                    <td>{m.noOfDaysForProvidingMaterial}</td>
                    <td className="max-w-xs truncate">{m.updates}</td>
                    <td>
                      <button onClick={() => handleDelete('materials', m.id)} className="action-btn action-reject">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sheet 3: Work Transfer Logs */}
        {activeSheet === 'workLogs' && (
          <div className="table-responsive">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Work Alloter</th>
                  <th>From Dept</th>
                  <th>To Dept</th>
                  <th>Receiver Employee</th>
                  <th>Project Name</th>
                  <th>Hardware & Doc Info</th>
                  <th>Requirement</th>
                  <th>HW & Doc Recv?</th>
                  <th>Created Date</th>
                  <th>Accepted Date</th>
                  <th>Completed Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workLogsData.map(w => (
                  <tr key={w.id}>
                    <td className="font-mono text-emerald-400 font-bold">{w.id}</td>
                    <td>{w.workAlloter} ({w.senderEmpId})</td>
                    <td>{w.fromDept}</td>
                    <td>{w.toDept}</td>
                    <td>{w.receiverName} ({w.receiverEmpId})</td>
                    <td className="font-bold">{w.projectName}</td>
                    <td className="max-w-xs truncate">{w.hardwareDocInfo}</td>
                    <td>{w.requirement}</td>
                    <td>{w.hardwareDocReceived ? 'Yes ✅' : 'No ❌'}</td>
                    <td>{w.createdDate}</td>
                    <td>{w.acceptedDate}</td>
                    <td>{w.completedDate}</td>
                    <td className="font-bold text-amber-300">{w.status}</td>
                    <td>
                      <button onClick={() => handleDelete('workLogs', w.id)} className="action-btn action-reject">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sheet 4: Users Directory */}
        {activeSheet === 'users' && (
          <div className="table-responsive">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map(u => (
                  <tr key={u.id}>
                    <td className="font-mono text-amber-400 font-bold">{u.id}</td>
                    <td className="font-bold text-white">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge-tag bg-slate-800 text-amber-300">{u.role}</span></td>
                    <td>{u.dept}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
