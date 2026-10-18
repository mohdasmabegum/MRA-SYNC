import React, { useState, useEffect } from 'react';
import { getUsers, getLeaves, getMaterials, getWorkLogs, getMeetings, deleteRecordFromSheet, exportDatabaseJSON, exportDatabaseExcelCSV, resetDatabaseToDefaults } from '../services/db';
import { useToast } from '../context/ToastContext';
import { Database, Download, RefreshCw, Trash2, ShieldAlert, ArrowLeft, FileSpreadsheet } from 'lucide-react';

export const CEODatabaseConsole = ({ activeUser, onBackToDashboard }) => {
  const { showToast, showModalPopup } = useToast();
  const [activeSheet, setActiveSheet] = useState('users');
  const [dbData, setDbData] = useState({
    users: [],
    leaves: [],
    materials: [],
    workLogs: [],
    meetings: []
  });

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';

  useEffect(() => {
    loadDatabase();
    window.addEventListener('mra_db_updated', loadDatabase);
    return () => window.removeEventListener('mra_db_updated', loadDatabase);
  }, []);

  const loadDatabase = () => {
    setDbData({
      users: getUsers(),
      leaves: getLeaves(),
      materials: getMaterials(),
      workLogs: getWorkLogs(),
      meetings: getMeetings()
    });
  };

  const handleDeleteRecord = (sheetKey, recordId) => {
    showModalPopup({
      title: 'Confirm Database Record Deletion',
      message: `Are you sure you want to permanently delete record [${recordId}] from [${sheetKey.toUpperCase()}] table? This action cannot be undone.`,
      iconType: 'logout',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteRecordFromSheet(sheetKey, recordId);
        showToast(`Record ${recordId} deleted from database.`, 'warning');
      }
    });
  };

  const handleResetDatabase = () => {
    showModalPopup({
      title: 'Reset Local Database to Seed Defaults',
      message: 'Are you sure you want to purge all local changes and restore original seed records for users, leaves, inventory, work logs, and meetings?',
      iconType: 'logout',
      confirmText: 'Yes, Reset Database',
      cancelText: 'Cancel',
      onConfirm: () => {
        resetDatabaseToDefaults();
        showToast('Database reset to factory default state.', 'success');
      }
    });
  };

  if (!isCEO) {
    return (
      <div className="portal-page-container">
        <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="glow-card p-8 text-center" style={{ borderColor: 'rgba(252,129,129,0.30)' }}>
          <ShieldAlert className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--rose)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-1)' }}>ACCESS RESTRICTED: CEO / DIRECTOR ONLY</h3>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>The Raw Database Console is strictly reserved for CEO / Founder / Director accounts.</p>
        </div>
      </div>
    );
  }

  const currentRecords = dbData[activeSheet] || [];

  return (
    <div className="portal-page-container">
      {/* Top Left Symbol Back Button */}
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Header Bar */}
      <div className="portal-header-bar glow-card" style={{ borderColor: 'rgba(236,201,75,0.30)' }}>
        <div>
          <h2 className="portal-title flex items-center gap-2">
            <Database className="w-6 h-6 animate-pulse" style={{ color: 'var(--amber)' }} />
            CEO Raw Local Database Sheets Manager
          </h2>
          <p className="portal-subtitle">Direct client-side database management console. Inspect, export Excel logs, or manage raw JSON sheets.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={exportDatabaseExcelCSV} className="btn-gold font-bold">
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Export Excel Logs (.CSV)
          </button>
          <button onClick={exportDatabaseJSON} className="btn-secondary">
            <Download className="w-4 h-4 mr-1" /> JSON
          </button>
          <button
            onClick={handleResetDatabase}
            className="btn-secondary"
            style={{ color: 'var(--rose)', borderColor: 'rgba(252,129,129,0.30)' }}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Reset DB
          </button>
        </div>
      </div>

      {/* Sheets Navigation Tabs */}
      <div className="flex gap-2 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setActiveSheet('users')} className={`tab-btn ${activeSheet === 'users' ? 'active' : ''}`}>
          Users ({dbData.users.length})
        </button>
        <button onClick={() => setActiveSheet('leaves')} className={`tab-btn ${activeSheet === 'leaves' ? 'active' : ''}`}>
          Leaves ({dbData.leaves.length})
        </button>
        <button onClick={() => setActiveSheet('materials')} className={`tab-btn ${activeSheet === 'materials' ? 'active' : ''}`}>
          Materials ({dbData.materials.length})
        </button>
        <button onClick={() => setActiveSheet('workLogs')} className={`tab-btn ${activeSheet === 'workLogs' ? 'active' : ''}`}>
          Work Logs ({dbData.workLogs.length})
        </button>
        <button onClick={() => setActiveSheet('meetings')} className={`tab-btn ${activeSheet === 'meetings' ? 'active' : ''}`}>
          Meetings ({dbData.meetings.length})
        </button>
      </div>

      {/* Raw Data Sheet Table */}
      <div className="glow-card p-5">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Primary Info / Name</th>
                <th>Department / Role</th>
                <th>Status / Category</th>
                <th>Raw JSON Payload</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 italic" style={{ color: 'var(--text-4)' }}>
                    No records in this database table.
                  </td>
                </tr>
              ) : (
                currentRecords.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs font-bold" style={{ color: 'var(--cyan)' }}>{item.id}</td>
                    <td className="font-semibold" style={{ color: 'var(--text-1)' }}>
                      {item.name || item.title || item.empName || item.workAlloter}
                    </td>
                    <td className="text-xs" style={{ color: 'var(--amber)' }}>
                      {item.dept || item.deptName || item.targetDept || item.role}
                    </td>
                    <td>
                      <span
                        className="badge-tag"
                        style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border-subtle)' }}
                      >
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td
                      className="font-mono max-w-md truncate"
                      style={{ fontSize: '10px', color: 'var(--text-3)' }}
                      title={JSON.stringify(item)}
                    >
                      {JSON.stringify(item)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteRecord(activeSheet, item.id)}
                        className="action-btn action-reject"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
