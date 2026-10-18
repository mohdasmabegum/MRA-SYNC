import React, { useState, useEffect } from 'react';
import { getUsers, getLeaves, getMaterials, getWorkLogs, getMeetings, addMeetingLog, softDeleteRecord } from '../services/db';
import { useToast } from '../context/ToastContext';
import {
  Users,
  CalendarCheck,
  ArrowRightLeft,
  Building,
  UserX,
  Sparkles,
  Calendar,
  Clock,
  PlusCircle,
  Video,
  ChevronRight,
  User,
  Link,
  Check,
  Home,
  Trash2
} from 'lucide-react';

export const Dashboard = ({ activeUser, selectedDept, setSelectedDept, onNavigate }) => {
  const { showModalPopup, showToast } = useToast();
  const [usersList, setUsersList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [workLogsList, setWorkLogsList] = useState([]);
  const [meetingsList, setMeetingsList] = useState([]);

  const [selectedEmpModal, setSelectedEmpModal] = useState(null);
  const [selectedMeetingModal, setSelectedMeetingModal] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activeTabSubView, setActiveTabSubView] = useState('roster');

  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    organizer: activeUser?.name || '',
    organizerId: activeUser?.id || '',
    targetDept: selectedDept || (activeUser?.dept || 'Hardware & Embedded Systems'),
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    agenda: '',
    teamsLink: '',
    participants: [activeUser?.name]
  });

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isHR = activeUser?.role === 'HR';
  const isTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isNormalEmp = activeUser?.role === 'EMPLOYEE';
  const isPMTeam = activeUser?.dept === 'Project Management';

  const isViewingOtherDept = selectedDept && selectedDept !== activeUser?.dept;

  useEffect(() => {
    fetchData();
    window.addEventListener('mra_db_updated', fetchData);
    return () => window.removeEventListener('mra_db_updated', fetchData);
  }, []);

  useEffect(() => {
    if ((isCEO || isPC || isTL || isPMTeam) && meetingsList.length > 0) {
      const popupShown = sessionStorage.getItem(`mra_mtg_popup_shown_${activeUser.id}`);
      if (!popupShown) {
        sessionStorage.setItem(`mra_mtg_popup_shown_${activeUser.id}`, 'true');

        const structuredAlertContent = (
          <div className="space-y-3 my-2">
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>You have {meetingsList.length} upcoming scheduled meetings:</p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {meetingsList.map(m => (
                <div key={m.id} className="meeting-alert-card">
                  <div className="meeting-alert-title">{m.title}</div>
                  <div className="meeting-alert-time">📅 {m.date} @ {m.time}</div>
                  <div className="meeting-alert-by">Organized by {m.organizer} ({m.targetDept})</div>
                  {m.teamsLink && (
                    <div className="font-mono flex items-center gap-1 mt-1" style={{ fontSize: '11px', color: 'var(--cyan)' }}>
                      <Link className="w-3 h-3" /> {m.teamsLink}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

        showModalPopup({
          title: `📅 Scheduled Meetings Alert (${meetingsList.length})`,
          message: structuredAlertContent,
          iconType: 'meeting',
          confirmText: 'View Dashboard'
        });
      }
    }
  }, [meetingsList, activeUser]);

  const fetchData = () => {
    setUsersList(getUsers());
    setLeavesList(getLeaves());
    setMaterialsList(getMaterials());
    setWorkLogsList(getWorkLogs());
    setMeetingsList(getMeetings());
  };

  const filterByDept = (dept) => {
    if (!selectedDept) return true;
    return dept === selectedDept;
  };

  const getVisibleUsers = () => {
    if (isNormalEmp) return [];
    if (isTL) return usersList.filter(u => u.dept === activeUser?.dept);
    return usersList.filter(u => filterByDept(u.dept));
  };

  const visibleUsers = getVisibleUsers();

  const filteredLeaves = leavesList.filter(l => isNormalEmp ? l.empId === activeUser.id : filterByDept(l.dept));
  const filteredWorkLogs = workLogsList.filter(w => isNormalEmp ? (w.receiverEmpId === activeUser.id || w.senderEmpId === activeUser.id) : (filterByDept(w.fromDept) || filterByDept(w.toDept)));

  // MEETINGS FILTERING & VISIBILITY RULE (REQUIREMENT SPECIFIC):
  // - Normal employees outside PM team: Show ONLY meetings where they are EXPLICITLY INCLUDED as participants!
  // - Executives, PC, PM Team, TL, Sub-TL: Show meetings for selected dept or target.
  const filteredMeetings = meetingsList.filter(m => {
    if (isNormalEmp && !isPMTeam) {
      return m.participants?.some(p => p.toLowerCase().includes(activeUser?.name.toLowerCase()) || p.includes(activeUser?.id));
    }
    return filterByDept(m.targetDept);
  });

  const shouldShowMeetingsSection = (isCEO || isPC || isTL || isPMTeam || filteredMeetings.length > 0);

  const todayOnLeaveList = leavesList.filter(l => l.status === 'Approved' && filterByDept(l.dept));

  const getEmployeeDetailedStats = (empId) => {
    const activeTasks = workLogsList.filter(w => w.receiverEmpId === empId && w.status === 'Pending Acceptance');
    const acceptedTasks = workLogsList.filter(w => w.receiverEmpId === empId && w.status.includes('Accepted'));
    const completedTasks = workLogsList.filter(w => w.receiverEmpId === empId && w.status.includes('Completed'));

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pastWeekCompleted = completedTasks.filter(w => {
      if (!w.completedDate || w.completedDate === 'Pending') return false;
      const d = new Date(w.completedDate);
      return !isNaN(d.getTime()) && d >= oneWeekAgo;
    });

    const empLeaves = leavesList.filter(l => l.empId === empId);
    const isOnLeaveToday = empLeaves.some(l => l.status === 'Approved');
    const upcomingLeaves = empLeaves.filter(l => l.status === 'Pending' || l.status === 'Approved');

    return {
      activeCount: activeTasks.length,
      acceptedCount: acceptedTasks.length,
      completedCount: completedTasks.length,
      pastWeekCompletedCount: pastWeekCompleted.length,
      acceptedTasksList: acceptedTasks,
      completedTasksList: completedTasks,
      isOnLeaveToday,
      upcomingLeaves
    };
  };

  const handleScheduleMeetingSubmit = (e) => {
    e.preventDefault();
    if (!meetingFormData.title || !meetingFormData.agenda) {
      showToast('Please provide a meeting title and agenda.', 'error');
      return;
    }

    addMeetingLog(meetingFormData);
    showToast(`Meeting "${meetingFormData.title}" scheduled successfully!`, 'success', 'Meeting Scheduled');
    setShowScheduleForm(false);
    setMeetingFormData({
      title: '',
      organizer: activeUser?.name || '',
      organizerId: activeUser?.id || '',
      targetDept: selectedDept || (activeUser?.dept || 'Hardware & Embedded Systems'),
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      agenda: '',
      teamsLink: '',
    });
  };

  const handleDeleteMeeting = (meetingId) => {
    showModalPopup({
      title: 'Move Meeting to Recently Deleted?',
      message: 'This scheduled meeting will be moved to Recently Deleted and retained for up to 100 days. You can restore it at any time from the CEO Database Console.',
      iconType: 'meeting',
      confirmText: 'Move to Recently Deleted',
      cancelText: 'Keep Meeting',
      onConfirm: () => {
        softDeleteRecord('meetings', meetingId, activeUser?.name);
        showToast('Meeting moved to Recently Deleted (100 days retention).', 'warning');
        setSelectedMeetingModal(null);
      }
    });
  };

  /* ── reusable inline label style ──────────────────────── */
  const fLabel = { color: 'var(--text-3)', display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600 };

  return (
    <div className="portal-page-container">
      {/* Return to Primary Home Dashboard Button (When viewing another department) */}
      {isViewingOtherDept && (
        <button onClick={() => setSelectedDept(activeUser?.dept)} className="nav-back-symbol-btn">
          <Home className="w-4 h-4" style={{ color: 'var(--amber)' }} />
          <span>← Return to My Home Dashboard ({activeUser?.dept})</span>
        </button>
      )}

      {/* Hero Welcome Banner */}
      <div className="dash-hero-card glow-card">
        <div className="dash-hero-content">
          <div className="hero-badge">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--amber)' }} />
            <span>Role Console: {activeUser?.role} ({selectedDept})</span>
          </div>
          <h2 className="hero-title">
            Welcome back, <span className="text-gradient-gold">{activeUser?.name}</span>
          </h2>
          <p className="hero-subtitle">
            {isPC && 'Project Coordinator Overview: Personal logs and department team view active.'}
            {isCEO && 'CEO Executive Control: Overview of leaves, employee roster, and scheduled meetings.'}
            {isTL && `Team Lead Dashboard for ${activeUser?.dept}: Team tracking and leave applications.`}
            {isNormalEmp && 'Employee Console: View your personal work transfer tasks and leave applications.'}
          </p>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card glow-card" onClick={() => onNavigate('leaves')}>
          <div className="metric-icon-box" style={{ background: 'rgba(236,201,75,0.10)', color: 'var(--amber)' }}>
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Leave Applications</span>
            <span className="metric-value">{filteredLeaves.filter(l => l.status === 'Pending').length} Pending</span>
            <span className="metric-sub">{filteredLeaves.filter(l => l.status === 'Approved').length} Approved ({selectedDept})</span>
          </div>
        </div>

        <div className="metric-card glow-card" onClick={() => onNavigate('work_transfer')}>
          <div className="metric-icon-box" style={{ background: 'rgba(72,187,120,0.10)', color: 'var(--emerald)' }}>
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">My Work Transfers</span>
            <span className="metric-value">{filteredWorkLogs.filter(w => !w.status.includes('Completed')).length} Active Tasks</span>
            <span className="metric-sub">{filteredWorkLogs.filter(w => w.status.includes('Completed')).length} Completed ({selectedDept})</span>
          </div>
        </div>

        <div className="metric-card glow-card">
          <div className="metric-icon-box" style={{ background: 'rgba(183,148,244,0.10)', color: 'var(--purple)' }}>
            <Users className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Department Members</span>
            <span className="metric-value">{visibleUsers.length} Employees</span>
            <span className="metric-sub">{selectedDept}</span>
          </div>
        </div>
      </div>

      {/* SCHEDULED MEETINGS SECTION (EXPLICIT USER INCLUSION FILTERING) */}
      {shouldShowMeetingsSection && (
        <div className="glow-card p-5 mb-6" style={{ borderColor: 'rgba(79,209,199,0.25)' }}>
          <div className="card-section-header">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
              <h3>Upcoming Scheduled Meetings &amp; Syncs ({filteredMeetings.length})</h3>
            </div>
            {(isCEO || isPC || isTL || isPMTeam) && (
              <button onClick={() => setShowScheduleForm(!showScheduleForm)} className="btn-gold btn-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Schedule / Import Meeting Link
              </button>
            )}
          </div>

          {/* Schedule / Import Meeting Form */}
          {showScheduleForm && (
            <form onSubmit={handleScheduleMeetingSubmit} className="meeting-form-container">
              <h4>🗓️ Schedule / Import MS Teams / Meeting Link</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <label style={fLabel}>Meeting Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Hardware Integration Sync"
                    value={meetingFormData.title}
                    onChange={e => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={fLabel}>Target Department</label>
                  <select
                    value={meetingFormData.targetDept}
                    onChange={e => setMeetingFormData({ ...meetingFormData, targetDept: e.target.value })}
                  >
                    <option value="Hardware & Embedded Systems">Hardware &amp; Embedded Systems</option>
                    <option value="Software & AI Systems">Software &amp; AI Systems</option>
                    <option value="Inventory & Logistics">Inventory &amp; Logistics</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label style={fLabel}>Meeting Date &amp; Time *</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={meetingFormData.date}
                      onChange={e => setMeetingFormData({ ...meetingFormData, date: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={meetingFormData.time}
                      onChange={e => setMeetingFormData({ ...meetingFormData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label style={{ ...fLabel, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Link className="w-3.5 h-3.5" /> MS Teams / Google Meet Link (Paste / Import Link)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://teams.microsoft.com/l/meetup-join/..."
                    value={meetingFormData.teamsLink}
                    onChange={e => setMeetingFormData({ ...meetingFormData, teamsLink: e.target.value })}
                  />
                </div>
                <div className="md:col-span-3">
                  <label style={fLabel}>Agenda &amp; Brief *</label>
                  <textarea
                    placeholder="Enter meeting agenda..."
                    value={meetingFormData.agenda}
                    onChange={e => setMeetingFormData({ ...meetingFormData, agenda: e.target.value })}
                    rows={2}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowScheduleForm(false)} className="btn-secondary btn-xs">Cancel</button>
                <button type="submit" className="btn-gold btn-xs">Confirm Schedule</button>
              </div>
            </form>
          )}

          {/* Clean Redesigned Meetings Cards Grid */}
          <div className="meetings-grid-container">
            {filteredMeetings.length === 0 ? (
              <p className="text-xs italic col-span-full" style={{ color: 'var(--text-4)' }}>
                No upcoming meetings scheduled where you are included.
              </p>
            ) : (
              filteredMeetings.map(mtg => (
                <div key={mtg.id} className="meeting-card-item">
                  <div className="meeting-card-header">
                    <div className="flex items-start gap-2">
                      <Video className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--cyan)' }} />
                      <div className="meeting-title-text">{mtg.title}</div>
                    </div>
                    <span className="meeting-dept-badge">{mtg.targetDept}</span>
                  </div>

                  <div className="meeting-meta-row">
                    <div className="meta-item">
                      <User className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} />
                      <span className="meta-label">Created By:</span>
                      <span className="meta-val-gold">{mtg.organizer}</span>
                    </div>

                    <div className="meta-item">
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                      <span className="meta-label">Date &amp; Time:</span>
                      <span className="meta-val-time">{mtg.date} @ {mtg.time}</span>
                    </div>

                    {mtg.teamsLink && (
                      <div className="meta-item font-mono truncate" style={{ fontSize: '0.75rem', color: 'var(--cyan)' }} title={mtg.teamsLink}>
                        <Link className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                        <a
                          href={mtg.teamsLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--cyan)', textDecoration: 'underline' }}
                        >
                          {mtg.teamsLink}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="meeting-card-footer">
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-3)' }}>ID: {mtg.id}</span>
                    <button onClick={() => setSelectedMeetingModal(mtg)} className="btn-view-meeting">
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DEPARTMENT-WISE EMPLOYEE ROSTER & TODAY ON LEAVE TAB SYSTEM */}
      {!isNormalEmp && (
        <div className="glow-card p-5">
          <div className="card-section-header">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: 'var(--amber)' }} />
              <h3 className="text-md font-bold" style={{ color: 'var(--text-1)' }}>
                Department Employee Roster ({selectedDept})
              </h3>
            </div>

            {/* Sub-view Tab Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTabSubView('roster')}
                className={`tab-btn ${activeTabSubView === 'roster' ? 'active' : ''}`}
              >
                <Users className="w-3.5 h-3.5" /> Employee Roster ({visibleUsers.length})
              </button>

              <button
                onClick={() => setActiveTabSubView('on_leave')}
                className={`tab-btn ${activeTabSubView === 'on_leave' ? 'active' : ''}`}
              >
                <UserX className="w-3.5 h-3.5" style={{ color: activeTabSubView === 'on_leave' ? 'white' : 'var(--rose)' }} />
                Today On Leave ({todayOnLeaveList.length})
              </button>
            </div>
          </div>

          {/* Sub-view 1: Employee Cards Grid with Active, Accepted, Completed Counts */}
          {activeTabSubView === 'roster' && (
            <div className="emp-roster-grid">
              {visibleUsers.map(emp => {
                const stats = getEmployeeDetailedStats(emp.id);

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpModal(emp)}
                    className="emp-roster-item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={emp.avatar} alt={emp.name} className="emp-avatar-sm" />
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                          style={{
                            background: stats.isOnLeaveToday ? 'var(--rose)' : 'var(--emerald)',
                            border: '2px solid var(--bg-surface)'
                          }}
                          title={stats.isOnLeaveToday ? 'On Leave' : 'Active Working'}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{emp.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{emp.id} • {emp.role}</div>
                        <div style={{ fontSize: '11px', color: 'var(--amber)' }}>{emp.dept}</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 shrink-0" style={{ fontSize: '11px' }}>
                      <span className={`status-pill ${stats.isOnLeaveToday ? 'pill-leave' : 'pill-active'}`}>
                        {stats.isOnLeaveToday ? 'On Leave' : 'Active Working'}
                      </span>
                      <div className="font-mono" style={{ color: 'var(--text-2)' }}>
                        <span style={{ color: 'var(--amber)' }}>{stats.activeCount} Active</span>
                        {' • '}
                        <span style={{ color: 'var(--cyan)' }}>{stats.acceptedCount} Accepted</span>
                      </div>
                      <div className="font-mono" style={{ color: 'var(--emerald)' }}>{stats.completedCount} Completed Tasks</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-view 2: Today On Leave List */}
          {activeTabSubView === 'on_leave' && (
            <div className="space-y-3">
              <p className="text-xs italic" style={{ color: 'var(--text-3)' }}>
                Approved employees currently on leave for {selectedDept}:
              </p>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayOnLeaveList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 italic" style={{ color: 'var(--text-4)' }}>
                          No employees on leave today for {selectedDept}.
                        </td>
                      </tr>
                    ) : (
                      todayOnLeaveList.map(l => (
                        <tr key={l.id}>
                          <td className="font-bold" style={{ color: 'var(--text-1)' }}>{l.name}</td>
                          <td className="font-mono" style={{ color: 'var(--cyan)' }}>{l.empId}</td>
                          <td style={{ color: 'var(--amber)' }}>{l.dept}</td>
                          <td>
                            <span
                              className="badge-tag"
                              style={{ background: 'rgba(252,129,129,0.15)', color: 'var(--rose)', border: '1px solid rgba(252,129,129,0.25)' }}
                            >
                              {l.leaveType}
                            </span>
                          </td>
                          <td className="font-mono text-xs">{l.fromTo}</td>
                          <td style={{ color: 'var(--text-2)' }}>{l.purpose}</td>
                          <td><span className="status-pill pill-leave">Approved On Leave</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Meeting Info Modal */}
      {selectedMeetingModal && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Video className="w-6 h-6" style={{ color: 'var(--cyan)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{selectedMeetingModal.title}</h3>
              </div>
              <button onClick={() => setSelectedMeetingModal(null)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-3 text-xs">
              <div className="settings-field-box space-y-2">
                <div><strong style={{ color: 'var(--amber)' }}>Created By:</strong> {selectedMeetingModal.organizer} ({selectedMeetingModal.organizerId})</div>
                <div><strong style={{ color: 'var(--blue)' }}>Day &amp; Time:</strong> {selectedMeetingModal.date} at {selectedMeetingModal.time}</div>
                <div><strong style={{ color: 'var(--text-2)' }}>Target Department:</strong> {selectedMeetingModal.targetDept}</div>
                {selectedMeetingModal.teamsLink && (
                  <div>
                    <strong style={{ color: 'var(--blue)' }}>Meeting URL:</strong>{' '}
                    <a href={selectedMeetingModal.teamsLink} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>
                      {selectedMeetingModal.teamsLink}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>Agenda &amp; Meeting Brief:</h4>
                <p className="settings-field-box" style={{ color: 'var(--text-2)' }}>
                  {selectedMeetingModal.agenda}
                </p>
              </div>
            </div>

            <div className="modal-footer flex items-center justify-between gap-3">
              {(isCEO || selectedMeetingModal.organizerId === activeUser?.id) ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDeleteMeeting(selectedMeetingModal.id)}
                    className="btn-secondary"
                    style={{ color: 'var(--rose)', borderColor: 'rgba(252,129,129,0.30)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Move to Recently Deleted
                  </button>
                  <button onClick={() => setSelectedMeetingModal(null)} className="btn-gold">
                    Close Details
                  </button>
                </>
              ) : (
                <button onClick={() => setSelectedMeetingModal(null)} className="btn-gold w-full">
                  Close Meeting Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED EMPLOYEE PROFILE DRAWER MODAL */}
      {selectedEmpModal && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card emp-detail-modal max-w-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmpModal.avatar}
                  alt={selectedEmpModal.name}
                  className="w-12 h-12 rounded-full"
                  style={{ border: '2px solid rgba(236,201,75,0.50)' }}
                />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{selectedEmpModal.name}</h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--amber)' }}>
                    ID: {selectedEmpModal.id} • {selectedEmpModal.role} ({selectedEmpModal.dept})
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedEmpModal(null)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-4 text-xs">
              {(() => {
                const stats = getEmployeeDetailedStats(selectedEmpModal.id);

                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div style={{ background: 'rgba(236,201,75,0.08)', border: '1px solid rgba(236,201,75,0.20)', padding: '14px', borderRadius: 'var(--r-md)' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--amber)', display: 'block' }}>{stats.acceptedCount}</span>
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-3)' }}>Accepted Tasks</span>
                      </div>
                      <div style={{ background: 'rgba(72,187,120,0.08)', border: '1px solid rgba(72,187,120,0.20)', padding: '14px', borderRadius: 'var(--r-md)' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald)', display: 'block' }}>{stats.completedCount}</span>
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-3)' }}>Total Completed</span>
                      </div>
                      <div style={{ background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.20)', padding: '14px', borderRadius: 'var(--r-md)' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--blue)', display: 'block' }}>{stats.pastWeekCompletedCount}</span>
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-3)' }}>Past 7 Days</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 style={{ fontWeight: 700, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <ArrowRightLeft style={{ width: '14px', height: '14px' }} /> Current / Accepted Tasks ({stats.acceptedTasksList.length})
                      </h4>
                      {stats.acceptedTasksList.length === 0 ? (
                        <p className="settings-field-box" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No current active tasks.</p>
                      ) : (
                        stats.acceptedTasksList.map(t => (
                          <div key={t.id} className="settings-field-box">
                            <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '2px' }}>
                              {t.projectName} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({t.id})</span>
                            </div>
                            <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>Allotted by: {t.workAlloter} ({t.fromDept})</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 style={{ fontWeight: 700, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <Check style={{ width: '14px', height: '14px' }} /> Completed Tasks ({stats.completedTasksList.length})
                      </h4>
                      {stats.completedTasksList.length === 0 ? (
                        <p className="settings-field-box" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No completed tasks recorded.</p>
                      ) : (
                        stats.completedTasksList.map(t => (
                          <div key={t.id} className="settings-field-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{t.projectName}</div>
                              <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>Done: {t.completedDate}</div>
                            </div>
                            <span style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '0.75rem' }}>✓ Completed</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 style={{ fontWeight: 700, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <CalendarCheck style={{ width: '14px', height: '14px' }} /> Leave Status &amp; Upcoming Leaves
                      </h4>
                      {stats.upcomingLeaves.length === 0 ? (
                        <p className="settings-field-box" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No upcoming leave applications.</p>
                      ) : (
                        stats.upcomingLeaves.map(l => (
                          <div key={l.id} className="settings-field-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{l.leaveType} ({l.noOfDays} days): {l.purpose}</div>
                              <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>Dates: {l.fromTo}</div>
                            </div>
                            <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.75rem' }}>{l.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedEmpModal(null)} className="btn-gold w-full">
                Close Profile Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
