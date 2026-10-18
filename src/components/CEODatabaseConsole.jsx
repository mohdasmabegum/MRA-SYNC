import React, { useState, useEffect } from 'react';
import {
  getUsers,
  getLeaves,
  getMaterials,
  getWorkLogs,
  getMeetings,
  exportDatabaseJSON,
  exportDatabaseExcelCSV,
  resetDatabaseToDefaults,
  getRecentlyDeleted,
  softDeleteRecord,
  restoreRecord,
  permanentlyDeleteRecord,
  clearAllRecentlyDeleted
} from '../services/db';
import { useToast } from '../context/ToastContext';
import {
  Database,
  Download,
  RefreshCw,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  FileSpreadsheet,
  Eye,
  RotateCcw,
  Archive,
  Clock,
  CheckCircle,
  ExternalLink,
  Search,
  Sparkles
} from 'lucide-react';

export const CEODatabaseConsole = ({ activeUser, onBackToDashboard }) => {
  const { showToast, showModalPopup } = useToast();
  const [activeSheet, setActiveSheet] = useState('users');
  const [inspectModalRecord, setInspectModalRecord] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [recentlyDeletedList, setRecentlyDeletedList] = useState([]);

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
    setRecentlyDeletedList(getRecentlyDeleted());
  };

  const handleSoftDelete = (sheetKey, record) => {
    const recordTitle = record.name || record.title || record.empName || record.workAlloter || record.materialType || record.id;
    showModalPopup({
      title: 'Move Record to Recently Deleted?',
      message: `Record [${record.id} - ${recordTitle}] will be moved from [${sheetKey.toUpperCase()}] to the Recently Deleted holding area.\n\n🛡️ Safe Retention: The record is stored for up to 100 days. You can restore it to the active table at any time.`,
      iconType: 'logout',
      confirmText: 'Move to Recently Deleted (100d)',
      cancelText: 'Cancel',
      onConfirm: () => {
        softDeleteRecord(sheetKey, record.id, activeUser?.name || 'Alexander Vance (CEO)');
        showToast(`Record [${record.id}] moved to Recently Deleted (100 days retention).`, 'warning');
        loadDatabase();
      }
    });
  };

  const handleRestore = (item) => {
    restoreRecord(item.deletedId);
    showToast(`Record [${item.originalId}] successfully restored to ${item.sheetLabel}!`, 'success', 'Record Restored');
    loadDatabase();
  };

  const handlePermanentDelete = (item) => {
    showModalPopup({
      title: 'Permanently Purge Record?',
      message: `Are you sure you want to PERMANENTLY purge record [${item.originalId} - ${item.primaryInfo}]?\n\n⚠️ Warning: This record will be erased completely from client storage and cannot be restored.`,
      iconType: 'logout',
      confirmText: 'Purge Permanently',
      cancelText: 'Keep in Trash',
      onConfirm: () => {
        permanentlyDeleteRecord(item.deletedId);
        showToast(`Record [${item.originalId}] permanently purged.`, 'error');
        loadDatabase();
      }
    });
  };

  const handleEmptyTrash = () => {
    if (recentlyDeletedList.length === 0) return;
    showModalPopup({
      title: 'Empty Entire Recently Deleted Trash?',
      message: `Are you sure you want to permanently erase ALL (${recentlyDeletedList.length}) records in the Recently Deleted holding area? This action cannot be reversed.`,
      iconType: 'logout',
      confirmText: 'Yes, Empty Trash',
      cancelText: 'Cancel',
      onConfirm: () => {
        clearAllRecentlyDeleted();
        showToast('All recently deleted records purged permanently.', 'error');
        loadDatabase();
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
        loadDatabase();
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

  // Filter current active sheet records
  const currentRecords = (dbData[activeSheet] || []).filter(item => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return Object.values(item).some(val => typeof val === 'string' && val.toLowerCase().includes(q));
  });

  // Filter recently deleted items
  const filteredTrash = recentlyDeletedList.filter(item => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.originalId?.toLowerCase().includes(q) ||
      item.primaryInfo?.toLowerCase().includes(q) ||
      item.secondaryInfo?.toLowerCase().includes(q) ||
      item.sheetLabel?.toLowerCase().includes(q)
    );
  });

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
            CEO Master Database Console
          </h2>
          <p className="portal-subtitle">Direct client-side database management console. Inspect records, manage active tables, export reports, or recover records up to 100 days.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

      {/* Sheets Navigation Tabs with Trash Count */}
      <div className="flex items-center justify-between pb-2 flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setActiveSheet('users'); setSearchFilter(''); }} className={`tab-btn ${activeSheet === 'users' ? 'active' : ''}`}>
            Users ({dbData.users.length})
          </button>
          <button onClick={() => { setActiveSheet('leaves'); setSearchFilter(''); }} className={`tab-btn ${activeSheet === 'leaves' ? 'active' : ''}`}>
            Leaves ({dbData.leaves.length})
          </button>
          <button onClick={() => { setActiveSheet('materials'); setSearchFilter(''); }} className={`tab-btn ${activeSheet === 'materials' ? 'active' : ''}`}>
            Materials ({dbData.materials.length})
          </button>
          <button onClick={() => { setActiveSheet('workLogs'); setSearchFilter(''); }} className={`tab-btn ${activeSheet === 'workLogs' ? 'active' : ''}`}>
            Work Logs ({dbData.workLogs.length})
          </button>
          <button onClick={() => { setActiveSheet('meetings'); setSearchFilter(''); }} className={`tab-btn ${activeSheet === 'meetings' ? 'active' : ''}`}>
            Meetings ({dbData.meetings.length})
          </button>
          <button
            onClick={() => { setActiveSheet('recently_deleted'); setSearchFilter(''); }}
            className={`tab-btn ${activeSheet === 'recently_deleted' ? 'active' : ''}`}
            style={{
              borderColor: recentlyDeletedList.length > 0 ? 'rgba(236,201,75,0.40)' : 'var(--border-subtle)',
              color: activeSheet === 'recently_deleted' ? 'white' : (recentlyDeletedList.length > 0 ? 'var(--amber)' : 'var(--text-3)')
            }}
          >
            <Archive className="w-3.5 h-3.5 mr-1" />
            Recently Deleted ({recentlyDeletedList.length})
          </button>
        </div>

        {/* Quick Search in Sheet */}
        <div className="input-with-icon" style={{ maxWidth: '240px' }}>
          <Search className="input-icon" style={{ width: '14px', height: '14px' }} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            style={{ padding: '6px 10px 6px 32px !important', fontSize: '0.75rem !important' }}
          />
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. RECENTLY DELETED HOLDING AREA (UP TO 100 DAYS RETENTION)     */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeSheet === 'recently_deleted' && (
        <div className="space-y-4">
          {/* Informative 100-Day Retention Banner */}
          <div
            className="glow-card p-4 flex items-center justify-between flex-wrap gap-3"
            style={{
              background: 'rgba(236,201,75,0.06)',
              borderColor: 'rgba(236,201,75,0.28)'
            }}
          >
            <div className="flex items-center gap-3">
              <Archive className="w-6 h-6 shrink-0" style={{ color: 'var(--amber)' }} />
              <div>
                <h4 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>
                  🛡️ 100-Day Retention Holding Area (Safe Trash)
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-3)', marginTop: '2px' }}>
                  Records deleted from any table are kept here for up to <strong>100 days</strong>. You can restore records back to their original active tables anytime, or purge them permanently.
                </p>
              </div>
            </div>

            {recentlyDeletedList.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="btn-secondary btn-xs"
                style={{ color: 'var(--rose)', borderColor: 'rgba(252,129,129,0.30)' }}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Empty All Trash ({recentlyDeletedList.length})
              </button>
            )}
          </div>

          {/* Recently Deleted Table */}
          <div className="glow-card p-5">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Original Table</th>
                    <th>Record ID</th>
                    <th>Primary Information</th>
                    <th>Department / Scope</th>
                    <th>Deleted On &amp; By</th>
                    <th>Retention Period</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrash.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 italic" style={{ color: 'var(--text-4)' }}>
                        <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No records in Recently Deleted. All deleted items are kept here for 100 days.
                      </td>
                    </tr>
                  ) : (
                    filteredTrash.map(item => (
                      <tr key={item.deletedId}>
                        <td>
                          <span
                            className="badge-tag"
                            style={{
                              background: 'rgba(99,179,237,0.12)',
                              color: 'var(--blue)',
                              border: '1px solid rgba(99,179,237,0.25)'
                            }}
                          >
                            {item.sheetLabel}
                          </span>
                        </td>
                        <td className="font-mono text-xs font-bold" style={{ color: 'var(--cyan)' }}>
                          {item.originalId}
                        </td>
                        <td className="font-semibold" style={{ color: 'var(--text-1)' }}>
                          {item.primaryInfo}
                        </td>
                        <td className="text-xs" style={{ color: 'var(--amber)' }}>
                          {item.secondaryInfo}
                        </td>
                        <td className="text-xs" style={{ color: 'var(--text-3)' }}>
                          <div>{item.deletedDateFormatted}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-4)' }}>By: {item.deletedBy}</div>
                        </td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              background: 'rgba(236,201,75,0.12)',
                              color: 'var(--amber)',
                              border: '1px solid rgba(236,201,75,0.25)'
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1 inline" />
                            {item.daysRemaining} Days Left
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestore(item)}
                              className="action-btn"
                              style={{ background: 'rgba(72,187,120,0.12)', color: 'var(--emerald)', borderColor: 'rgba(72,187,120,0.25)' }}
                              title="Restore Record to Active Table"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setInspectModalRecord({ sheet: item.sheetLabel, data: item.record })}
                              className="action-btn"
                              style={{ color: 'var(--blue)' }}
                              title="Inspect Full Record Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handlePermanentDelete(item)}
                              className="action-btn action-reject"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. ACTIVE SHEETS TABLES (NO RAW JSON - CLEAN, CLEAR COLUMNS)     */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeSheet !== 'recently_deleted' && (
        <div className="glow-card p-5">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Primary Entity / Name</th>
                  <th>Department / Role</th>
                  <th>Key Details</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 italic" style={{ color: 'var(--text-4)' }}>
                      No matching records found in [{activeSheet.toUpperCase()}].
                    </td>
                  </tr>
                ) : (
                  currentRecords.map(item => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs font-bold" style={{ color: 'var(--cyan)' }}>
                        {item.id}
                      </td>

                      {/* Primary Info - Clean Name & ID (No photo) */}
                      <td>
                        <div>
                          <div className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>
                            {item.name || item.title || item.empName || item.workAlloter || item.materialType}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="font-mono text-xs font-semibold px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(99,179,237,0.12)',
                                color: 'var(--blue)',
                                border: '1px solid rgba(99,179,237,0.25)',
                                display: 'inline-block'
                              }}
                            >
                              ID: {item.id}
                            </span>
                            {item.email && (
                              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.email}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department / Scope */}
                      <td className="text-xs" style={{ color: 'var(--amber)' }}>
                        <div>{item.dept || item.deptName || item.targetDept || item.fromDept || item.role}</div>
                        {item.toDept && (
                          <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>→ {item.toDept}</div>
                        )}
                      </td>

                      {/* Clean Details Column (Replaces raw JSON) */}
                      <td className="text-xs" style={{ color: 'var(--text-2)', maxWidth: '320px' }}>
                        {activeSheet === 'users' && (
                          <div>
                            <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{item.role}</span>
                            <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>Password: ••••••••</div>
                          </div>
                        )}

                        {activeSheet === 'leaves' && (
                          <div>
                            <div><strong>{item.leaveType}</strong> ({item.noOfDays} days): {item.fromTo}</div>
                            <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>Purpose: {item.purpose}</div>
                          </div>
                        )}

                        {activeSheet === 'materials' && (
                          <div>
                            <div><strong>{item.materialType}</strong> ({item.noOfUnits})</div>
                            <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>For: {item.forProject}</div>
                          </div>
                        )}

                        {activeSheet === 'workLogs' && (
                          <div>
                            <div><strong>{item.projectName}</strong></div>
                            <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>To: {item.receiverName} ({item.receiverEmpId})</div>
                          </div>
                        )}

                        {activeSheet === 'meetings' && (
                          <div>
                            <div><strong>{item.date} @ {item.time}</strong></div>
                            <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>Org: {item.organizer}</div>
                          </div>
                        )}
                      </td>

                      {/* Status / Category */}
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            background: item.status?.includes('Completed') || item.status === 'Approved'
                              ? 'rgba(72,187,120,0.12)'
                              : (item.status === 'Pending' ? 'rgba(236,201,75,0.12)' : 'var(--bg-hover)'),
                            color: item.status?.includes('Completed') || item.status === 'Approved'
                              ? 'var(--emerald)'
                              : (item.status === 'Pending' ? 'var(--amber)' : 'var(--text-2)'),
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {item.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectModalRecord({ sheet: activeSheet, data: item })}
                            className="action-btn"
                            style={{ color: 'var(--blue)' }}
                            title="Inspect Record Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSoftDelete(activeSheet, item)}
                            className="action-btn action-reject"
                            title="Move to Recently Deleted (100d)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 3. STRUCTURED RECORD INSPECTION MODAL (NO RAW JSON DUMPS!)       */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {inspectModalRecord && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card max-w-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" style={{ color: 'var(--blue)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
                  Record Inspection: [{inspectModalRecord.data.id}]
                </h3>
              </div>
              <button onClick={() => setInspectModalRecord(null)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-3 text-xs max-h-96 overflow-y-auto">
              <div
                className="p-3 rounded-lg flex items-center justify-between"
                style={{ background: 'rgba(99,179,237,0.08)', border: '1px solid var(--border)' }}
              >
                <div>
                  <span className="font-bold text-sm" style={{ color: 'var(--blue)' }}>
                    {inspectModalRecord.data.name || inspectModalRecord.data.title || inspectModalRecord.data.projectName || inspectModalRecord.data.id}
                  </span>
                  <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>
                    Table: {inspectModalRecord.sheet}
                  </div>
                </div>
                <span className="badge-tag" style={{ background: 'var(--bg-hover)', color: 'var(--text-1)' }}>
                  ID: {inspectModalRecord.data.id}
                </span>
              </div>

              {/* Formatted Key-Value Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {Object.entries(inspectModalRecord.data).map(([key, val]) => {
                  if (key === 'avatar') return null;
                  let displayVal = val;
                  if (typeof val === 'boolean') displayVal = val ? 'Yes / Confirmed' : 'No';
                  if (Array.isArray(val)) displayVal = val.join(', ');
                  if (typeof val === 'object' && val !== null) displayVal = JSON.stringify(val);

                  const isLink = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));

                  return (
                    <div key={key} className="settings-field-box">
                      <div className="settings-field-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      </div>
                      <div className="settings-field-value" style={{ wordBreak: 'break-word' }}>
                        {isLink ? (
                          <a
                            href={val}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 underline"
                            style={{ color: 'var(--blue)' }}
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          String(displayVal || '—')
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setInspectModalRecord(null)} className="btn-gold w-full">
                Close Record Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
