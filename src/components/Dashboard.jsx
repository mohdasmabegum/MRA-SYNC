import React, { useState, useEffect } from 'react';
import { getUsers, getLeaves, getMaterials, getWorkLogs, getMeetings, addMeetingLog } from '../services/db';
import { useToast } from '../context/ToastContext';
import {
  Users,
  CalendarCheck,
  ArrowRightLeft,
  Award,
  Building,
  UserCheck,
  UserX,
  Sparkles,
  Calendar,
  Clock,
  PlusCircle,
  Video,
  ChevronRight,
  User,
  ArrowLeft,
  Link,
  Check,
  Home
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

  const isViewingOtherDept = selectedDept && selectedDept !== activeUser?.dept;

  useEffect(() => {
    fetchData();
    window.addEventListener('mra_db_updated', fetchData);
    return () => window.removeEventListener('mra_db_updated', fetchData);
  }, []);

  useEffect(() => {
    if ((isCEO || isPC || isTL) && meetingsList.length > 0) {
      const popupShown = sessionStorage.getItem(`mra_mtg_popup_shown_${activeUser.id}`);
      if (!popupShown) {
        sessionStorage.setItem(`mra_mtg_popup_shown_${activeUser.id}`, 'true');

        const structuredAlertContent = (
          <div className="space-y-3 my-2">
            <p className="text-xs text-slate-300">You have {meetingsList.length} upcoming scheduled meetings:</p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {meetingsList.map(m => (
                <div key={m.id} className="meeting-alert-card">
                  <div className="meeting-alert-title">{m.title}</div>
                  <div className="meeting-alert-time">📅 {m.date} @ {m.time}</div>
                  <div className="meeting-alert-by">Organized by {m.organizer} ({m.targetDept})</div>
                  {m.teamsLink && (
                    <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-1">
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
  const filteredMeetings = meetingsList.filter(m => isNormalEmp ? m.targetDept === activeUser.dept : filterByDept(m.targetDept));

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
      participants: [activeUser?.name]
    });
  };

  return (
    <div className="portal-page-container">
      {/* Return to Primary Home Dashboard Button (When viewing another department) */}
      {isViewingOtherDept && (
        <button onClick={() => setSelectedDept(activeUser?.dept)} className="nav-back-symbol-btn">
          <Home className="w-4 h-4 text-amber-400" />
          <span>← Return to My Home Dashboard ({activeUser?.dept})</span>
        </button>
      )}

      {/* Hero Welcome Banner */}
      <div className="dash-hero-card glow-card">
        <div className="dash-hero-content">
          <div className="hero-badge">
            <Sparkles className="w-4 h-4 text-amber-400" />
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
          <div className="metric-icon-box bg-gold-500/10 text-amber-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Leave Applications</span>
            <span className="metric-value">{filteredLeaves.filter(l => l.status === 'Pending').length} Pending</span>
            <span className="metric-sub">{filteredLeaves.filter(l => l.status === 'Approved').length} Approved ({selectedDept})</span>
          </div>
        </div>

        <div className="metric-card glow-card" onClick={() => onNavigate('work_transfer')}>
          <div className="metric-icon-box bg-emerald-500/10 text-emerald-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">My Work Transfers</span>
            <span className="metric-value">{filteredWorkLogs.filter(w => !w.status.includes('Completed')).length} Active Tasks</span>
            <span className="metric-sub">{filteredWorkLogs.filter(w => w.status.includes('Completed')).length} Completed ({selectedDept})</span>
          </div>
        </div>

        <div className="metric-card glow-card">
          <div className="metric-icon-box bg-purple-500/10 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Department Members</span>
            <span className="metric-value">{visibleUsers.length} Employees</span>
            <span className="metric-sub">{selectedDept}</span>
          </div>
        </div>
      </div>

      {/* PROMINENT SCHEDULED MEETINGS SECTION WITH MS TEAMS IMPORT LINK */}
      {(isCEO || isPC || isTL || isNormalEmp) && (
        <div className="glow-card p-5 mb-6 border-cyan-500/30">
          <div className="card-section-header justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3>📅 Upcoming Scheduled Meetings & Syncs ({filteredMeetings.length})</h3>
            </div>
            {(isCEO || isPC || isTL) && (
              <button onClick={() => setShowScheduleForm(!showScheduleForm)} className="btn-gold btn-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Schedule / Import Meeting Link
              </button>
            )}
          </div>

          {/* Schedule / Import Meeting Form */}
          {showScheduleForm && (
            <form onSubmit={handleScheduleMeetingSubmit} className="bg-slate-900/90 p-4 rounded-lg border border-cyan-500/40 mb-4">
              <h4 className="text-sm font-bold text-cyan-300 mb-3">🗓️ Schedule / Import MS Teams / Meeting Link</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <label className="text-slate-400 block mb-1">Meeting Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Hardware Integration Sync"
                    value={meetingFormData.title}
                    onChange={e => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Department</label>
                  <select
                    value={meetingFormData.targetDept}
                    onChange={e => setMeetingFormData({ ...meetingFormData, targetDept: e.target.value })}
                  >
                    <option value="Hardware & Embedded Systems">Hardware & Embedded Systems</option>
                    <option value="Software & AI Systems">Software & AI Systems</option>
                    <option value="Inventory & Logistics">Inventory & Logistics</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Meeting Date & Time *</label>
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
                  <label className="text-cyan-400 block mb-1 flex items-center gap-1">
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
                  <label className="text-slate-400 block mb-1">Agenda & Brief *</label>
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
              <p className="text-xs text-slate-500 italic col-span-full">No upcoming meetings scheduled.</p>
            ) : (
              filteredMeetings.map(mtg => (
                <div key={mtg.id} className="meeting-card-item">
                  <div className="meeting-card-header">
                    <div className="flex items-start gap-2">
                      <Video className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="meeting-title-text">{mtg.title}</div>
                    </div>
                    <span className="meeting-dept-badge">{mtg.targetDept}</span>
                  </div>

                  <div className="meeting-meta-row">
                    <div className="meta-item">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span className="meta-label">Created By:</span>
                      <span className="meta-val-gold">{mtg.organizer}</span>
                    </div>

                    <div className="meta-item">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="meta-label">Date & Time:</span>
                      <span className="meta-val-time">{mtg.date} @ {mtg.time}</span>
                    </div>

                    {mtg.teamsLink && (
                      <div className="meta-item text-xs text-cyan-400 font-mono truncate" title={mtg.teamsLink}>
                        <Link className="w-3.5 h-3.5 text-cyan-400" />
                        <a href={mtg.teamsLink} target="_blank" rel="noreferrer" className="underline hover:text-cyan-300">
                          {mtg.teamsLink}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="meeting-card-footer">
                    <span className="text-[11px] text-slate-400 font-mono">ID: {mtg.id}</span>
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
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-md font-bold text-white">
                Department Employee Roster ({selectedDept})
              </h3>
            </div>

            {/* Sub-view Tab Switcher */}
            <div className="flex gap-2">
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
                <UserX className="w-3.5 h-3.5 text-rose-400" /> Today On Leave ({todayOnLeaveList.length})
              </button>
            </div>
          </div>

          {/* Sub-view 1: Employee Cards Grid with Active, Accepted, Completed Counts */}
          {activeTabSubView === 'roster' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleUsers.map(emp => {
                const stats = getEmployeeDetailedStats(emp.id);

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpModal(emp)}
                    className="emp-roster-item justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="emp-avatar-sm" />
                      <div>
                        <div className="font-bold text-white text-xs">{emp.name}</div>
                        <div className="text-[11px] text-slate-400">{emp.id} • {emp.role}</div>
                        <div className="text-[11px] text-amber-400">{emp.dept}</div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] space-y-1">
                      <span className={`status-pill ${stats.isOnLeaveToday ? 'pill-leave' : 'pill-active'}`}>
                        {stats.isOnLeaveToday ? 'On Leave' : 'Active Working'}
                      </span>
                      <div className="font-mono text-slate-300">
                        <span className="text-amber-400">{stats.activeCount} Active</span> • <span className="text-cyan-400">{stats.acceptedCount} Accepted</span>
                      </div>
                      <div className="font-mono text-emerald-400">{stats.completedCount} Completed Tasks</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-view 2: Today On Leave List */}
          {activeTabSubView === 'on_leave' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 italic">Approved employees currently on leave for {selectedDept}:</p>
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
                        <td colSpan="7" className="text-center py-4 text-slate-500 italic">No employees on leave today for {selectedDept}.</td>
                      </tr>
                    ) : (
                      todayOnLeaveList.map(l => (
                        <tr key={l.id}>
                          <td className="font-bold text-white">{l.name}</td>
                          <td className="font-mono text-cyan-400">{l.empId}</td>
                          <td className="text-amber-400">{l.dept}</td>
                          <td><span className="badge-tag bg-rose-500/20 text-rose-300">{l.leaveType}</span></td>
                          <td className="font-mono text-xs">{l.fromTo}</td>
                          <td className="text-slate-300">{l.purpose}</td>
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
                <Video className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">{selectedMeetingModal.title}</h3>
              </div>
              <button onClick={() => setSelectedMeetingModal(null)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div><strong className="text-amber-400">Created By:</strong> {selectedMeetingModal.organizer} ({selectedMeetingModal.organizerId})</div>
                <div><strong className="text-cyan-400">Day & Time:</strong> {selectedMeetingModal.date} at {selectedMeetingModal.time}</div>
                <div><strong className="text-slate-300">Target Department:</strong> {selectedMeetingModal.targetDept}</div>
                {selectedMeetingModal.teamsLink && (
                  <div>
                    <strong className="text-cyan-400">Imported Meeting URL:</strong>{' '}
                    <a href={selectedMeetingModal.teamsLink} target="_blank" rel="noreferrer" className="underline text-cyan-300">
                      {selectedMeetingModal.teamsLink}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Agenda & Meeting Brief:</h4>
                <p className="bg-slate-900/40 p-3 rounded border border-slate-800 text-slate-300">
                  {selectedMeetingModal.agenda}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedMeetingModal(null)} className="btn-gold w-full">
                Close Meeting Details
              </button>
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
                <img src={selectedEmpModal.avatar} alt={selectedEmpModal.name} className="w-12 h-12 rounded-full border-2 border-amber-400/50" />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEmpModal.name}</h3>
                  <span className="text-xs text-amber-400 font-mono">ID: {selectedEmpModal.id} • {selectedEmpModal.role} ({selectedEmpModal.dept})</span>
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
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                        <span className="text-lg font-bold text-amber-400 block">{stats.acceptedCount}</span>
                        <span className="text-[11px] text-slate-300">Current Accepted Tasks</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                        <span className="text-lg font-bold text-emerald-400 block">{stats.completedCount}</span>
                        <span className="text-[11px] text-slate-300">Total Completed Tasks</span>
                      </div>
                      <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-lg">
                        <span className="text-lg font-bold text-cyan-400 block">{stats.pastWeekCompletedCount}</span>
                        <span className="text-[11px] text-slate-300">Past 1-Week Completed</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1">
                        <ArrowRightLeft className="w-4 h-4" /> SECTION 1: Current Working / Accepted Tasks ({stats.acceptedTasksList.length})
                      </h4>
                      {stats.acceptedTasksList.length === 0 ? (
                        <p className="text-slate-500 italic bg-slate-900/40 p-2 rounded">No current active tasks.</p>
                      ) : (
                        stats.acceptedTasksList.map(t => (
                          <div key={t.id} className="bg-slate-900/60 p-2 rounded border border-amber-500/30">
                            <div className="font-bold text-white">{t.projectName} ({t.id})</div>
                            <div className="text-slate-400">Allotted by: {t.workAlloter} ({t.fromDept})</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> SECTION 2: Completed Tasks ({stats.completedTasksList.length})
                      </h4>
                      {stats.completedTasksList.length === 0 ? (
                        <p className="text-slate-500 italic bg-slate-900/40 p-2 rounded">No completed tasks recorded.</p>
                      ) : (
                        stats.completedTasksList.map(t => (
                          <div key={t.id} className="bg-slate-900/60 p-2 rounded border border-emerald-500/30 flex justify-between">
                            <div>
                              <div className="font-bold text-white">{t.projectName}</div>
                              <div className="text-slate-400">Done: {t.completedDate}</div>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold">Completed ✅</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-purple-400 flex items-center gap-1">
                        <CalendarCheck className="w-4 h-4" /> SECTION 3: Employee Leave Status & Upcoming Leaves
                      </h4>
                      {stats.upcomingLeaves.length === 0 ? (
                        <p className="text-slate-500 italic bg-slate-900/40 p-2 rounded">No upcoming leave applications for this employee.</p>
                      ) : (
                        stats.upcomingLeaves.map(l => (
                          <div key={l.id} className="bg-slate-900/60 p-2 rounded border border-purple-500/30 flex justify-between">
                            <div>
                              <div className="font-bold text-white">{l.leaveType} ({l.noOfDays} days): {l.purpose}</div>
                              <div className="text-slate-400">Dates: {l.fromTo}</div>
                            </div>
                            <span className="text-amber-400 font-bold">{l.status}</span>
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
