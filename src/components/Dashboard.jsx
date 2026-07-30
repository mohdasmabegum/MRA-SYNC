import React, { useState, useEffect } from 'react';
import { getUsers, getLeaves, getMaterials, getWorkLogs, getMeetings, addMeetingLog } from '../services/db';
import { useToast } from '../context/ToastContext';
import {
  Users,
  CalendarCheck,
  Boxes,
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
  Info,
  CheckCircle2
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

  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    organizer: activeUser?.name || '',
    organizerId: activeUser?.id || '',
    targetDept: selectedDept !== 'ALL DEPARTMENTS' ? selectedDept : 'Hardware & Embedded Systems',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    agenda: '',
    participants: [activeUser?.name]
  });

  useEffect(() => {
    fetchData();
    window.addEventListener('mra_db_updated', fetchData);
    return () => window.removeEventListener('mra_db_updated', fetchData);
  }, []);

  // Popup Meeting Alert on initial load for CEO, PC, TL, Sub-TL
  useEffect(() => {
    const isPrivilegedRole = activeUser?.role === 'CEO/FOUNDER/DIRECTOR' ||
                             activeUser?.role === 'PROJECT_COORDINATOR' ||
                             activeUser?.role === 'TL' ||
                             activeUser?.role === 'SUB_TL';

    if (isPrivilegedRole && meetingsList.length > 0) {
      // Check if popup already shown in session
      const popupShown = sessionStorage.getItem(`mra_mtg_popup_shown_${activeUser.id}`);
      if (!popupShown) {
        sessionStorage.setItem(`mra_mtg_popup_shown_${activeUser.id}`, 'true');
        const upcomingCount = meetingsList.length;
        const mtgNames = meetingsList.slice(0, 2).map(m => `• "${m.title}" (Created by ${m.organizer} on ${m.date} @ ${m.time})`).join('\n');

        showModalPopup({
          title: `📅 Upcoming Scheduled Meetings Alert (${upcomingCount})`,
          message: `You have upcoming scheduled meetings:\n\n${mtgNames}\n\nReview details on your main dashboard screen.`,
          iconType: 'info',
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

  // Department Filter helper
  const filterByDept = (dept) => {
    if (!selectedDept || selectedDept === 'ALL DEPARTMENTS') return true;
    return dept === selectedDept;
  };

  const isSpecificDeptSelected = selectedDept && selectedDept !== 'ALL DEPARTMENTS';

  const filteredUsers = usersList.filter(u => filterByDept(u.dept));
  const filteredLeaves = leavesList.filter(l => filterByDept(l.dept));
  const filteredMaterials = materialsList.filter(m => filterByDept(m.deptName));
  const filteredWorkLogs = workLogsList.filter(w => filterByDept(w.fromDept) || filterByDept(w.toDept));
  const filteredMeetings = meetingsList.filter(m => filterByDept(m.targetDept));

  // Compute Employee Work Performance Metrics
  const getEmployeeStats = (empId) => {
    const empLeaves = leavesList.filter(l => l.empId === empId && l.status === 'Approved');
    const isOnLeaveToday = empLeaves.length > 0;

    const acceptedRequests = workLogsList.filter(w => w.receiverEmpId === empId && w.status.includes('Accepted'));
    const completedRequests = workLogsList.filter(w => w.receiverEmpId === empId && w.status.includes('Completed'));

    return {
      totalLeaves: empLeaves.length,
      status: isOnLeaveToday ? 'On Leave' : 'Active Working',
      acceptedCount: acceptedRequests.length,
      completedCount: completedRequests.length
    };
  };

  // Find Top Performer Employee per selected department
  const getTopDepartmentPerformer = (deptName) => {
    const counts = {};
    workLogsList.forEach(w => {
      if (w.receiverEmpId && (deptName === 'ALL DEPARTMENTS' || w.toDept === deptName)) {
        if (!counts[w.receiverEmpId]) {
          counts[w.receiverEmpId] = { id: w.receiverEmpId, name: w.receiverName, accepted: 0, completed: 0 };
        }
        if (w.status.includes('Accepted') || w.status.includes('Completed')) {
          counts[w.receiverEmpId].accepted += 1;
        }
        if (w.status.includes('Completed')) {
          counts[w.receiverEmpId].completed += 1;
        }
      }
    });

    const sorted = Object.values(counts).sort((a, b) => b.accepted - a.accepted);
    return sorted.length > 0 ? sorted[0] : null;
  };

  const topPerformer = getTopDepartmentPerformer(selectedDept);

  // To-Do Work Tasks for Project Coordinator
  const pcToDoTasks = workLogsList.filter(w => w.receiverEmpId === activeUser?.id && !w.status.includes('Completed'));

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isHR = activeUser?.role === 'HR';
  const isTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';

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
      targetDept: selectedDept !== 'ALL DEPARTMENTS' ? selectedDept : 'Hardware & Embedded Systems',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      agenda: '',
      participants: [activeUser?.name]
    });
  };

  return (
    <div className="portal-page-container">
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
            {isPC && 'Project Coordinator Console: Select a specific department from the navbar dropdown to view its employee roster, top workers, and departmental tasks.'}
            {isCEO && 'CEO Executive Control: Department-wise overview of leaves, inventory, employees, and scheduled meetings.'}
            {isTL && `Team Lead Dashboard for ${activeUser?.dept}: Team member tracking, leaves, and inventory.`}
            {!isCEO && !isPC && !isTL && 'Employee Operations Console: Personal tasks and department overview.'}
          </p>
        </div>

        {/* Top Performer Card (Visible per selected department) */}
        {isSpecificDeptSelected && topPerformer && (
          <div className="top-performer-card">
            <Award className="w-8 h-8 text-amber-400 mb-2" />
            <div className="top-title">Top Worker ({selectedDept})</div>
            <div className="top-name">{topPerformer.name}</div>
            <div className="top-stats font-mono">
              <span className="text-amber-400">{topPerformer.accepted} Tasks Accepted</span> • {topPerformer.completed} Completed
            </div>
          </div>
        )}
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

        <div className="metric-card glow-card" onClick={() => onNavigate('inventory')}>
          <div className="metric-icon-box bg-cyan-500/10 text-cyan-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Material & Inventory</span>
            <span className="metric-value">{filteredMaterials.filter(m => m.status.includes('Order')).length} Orders Placed</span>
            <span className="metric-sub">{filteredMaterials.filter(m => m.status.includes('Provided')).length} Handed Over ({selectedDept})</span>
          </div>
        </div>

        <div className="metric-card glow-card" onClick={() => onNavigate('work_transfer')}>
          <div className="metric-icon-box bg-emerald-500/10 text-emerald-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Work Transfers</span>
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
            <span className="metric-value">{filteredUsers.length} Employees</span>
            <span className="metric-sub">{selectedDept === 'ALL DEPARTMENTS' ? 'All Depts' : selectedDept}</span>
          </div>
        </div>
      </div>

      {/* PROMINENT SCHEDULED MEETINGS SECTION ON MAIN SCREEN (For CEO, PC, TL, Sub-TL) */}
      {(isCEO || isPC || isTL) && (
        <div className="glow-card p-5 mb-6 border-cyan-500/30">
          <div className="card-section-header justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3>📅 Upcoming Scheduled Meetings & Syncs ({meetingsList.length})</h3>
            </div>
            <button onClick={() => setShowScheduleForm(!showScheduleForm)} className="btn-gold btn-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Schedule New Meeting
            </button>
          </div>

          {/* Schedule Meeting Form Modal */}
          {showScheduleForm && (
            <form onSubmit={handleScheduleMeetingSubmit} className="bg-slate-900/90 p-4 rounded-lg border border-cyan-500/40 mb-4">
              <h4 className="text-sm font-bold text-cyan-300 mb-3">🗓️ Schedule New Meeting</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <label className="text-slate-400 block mb-1">Meeting Name / Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Hardware & Material Sync"
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
                  <label className="text-slate-400 block mb-1">Agenda & Description *</label>
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

          {/* Scheduled Meetings List Display (Name, Created By, Time & Day) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetingsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic col-span-2">No upcoming meetings scheduled.</p>
            ) : (
              meetingsList.map(mtg => (
                <div
                  key={mtg.id}
                  onClick={() => setSelectedMeetingModal(mtg)}
                  className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/25 hover:border-cyan-400 transition-all cursor-pointer flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Video className="w-4 h-4 text-cyan-400" />
                      <span>{mtg.title}</span>
                    </div>
                    <div className="text-xs text-amber-300">
                      <strong>Created By:</strong> {mtg.organizer}
                    </div>
                    <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 inline" />
                      <span><strong>Date & Time:</strong> {mtg.date} at {mtg.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dept: {mtg.targetDept}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PROJECT COORDINATOR SPECIFIC: To-Do Tasks */}
      {isPC && pcToDoTasks.length > 0 && (
        <div className="glow-card p-5 mb-6 border-amber-500/30">
          <div className="card-section-header">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h3>Project Coordinator To-Do Work Tasks ({pcToDoTasks.length})</h3>
          </div>
          <div className="space-y-3">
            {pcToDoTasks.map(t => (
              <div key={t.id} className="bg-slate-900/60 p-3 rounded-lg border border-amber-500/30 text-xs">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>{t.projectName} ({t.id})</span>
                  <span className="text-amber-400">{t.requirement}</span>
                </div>
                <div className="text-slate-300">From: {t.workAlloter} ({t.fromDept})</div>
                <div className="text-slate-400 mt-1">{t.hardwareDocInfo}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPLOYEE LIST & LEAVE PORTAL ISOLATION (USER REQUIREMENT):
          Do NOT render employee list for Project Coordinator or CEO/Founder/Director
          UNTIL they explicitly open/select a specific department! */}
      {(!isSpecificDeptSelected && (isCEO || isPC)) ? (
        <div className="glow-card p-6 text-center border-amber-500/30 my-4">
          <Building className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-80" />
          <h4 className="text-base font-bold text-white mb-1">Select a Department to View Employees & Leave Status</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-3">
            The employee roster and leave status list are hidden in global view. Please select a specific department from the navbar dropdown above to open its employee list.
          </p>
          <div className="flex justify-center gap-2">
            {['Hardware & Embedded Systems', 'Software & AI Systems', 'Inventory & Logistics', 'Project Management', 'Human Resources'].map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className="btn-secondary btn-xs"
              >
                Open {dept}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Render Employee Roster when a specific department is selected OR for TL/Employees */
        <div className="glow-card p-5">
          <div className="card-section-header justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h3>Employee Roster & Leave Status — {selectedDept} ({filteredUsers.length})</h3>
            </div>
            <span className="text-xs text-slate-400">Click any employee for detailed profile modal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(emp => {
              const stats = getEmployeeStats(emp.id);
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

                  <div className="text-right">
                    <span className={`status-pill mb-1 ${stats.status === 'On Leave' ? 'pill-leave' : 'pill-active'}`}>
                      {stats.status === 'On Leave' ? <UserX className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                      {stats.status}
                    </span>
                    <div className="text-[11px] text-slate-300 font-mono">
                      {stats.acceptedCount} Accepted Tasks
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Meeting Info Modal */}
      {selectedMeetingModal && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">{selectedMeetingModal.title}</h3>
              </div>
              <button onClick={() => setSelectedMeetingModal(null)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div><strong className="text-amber-400">Created By:</strong> {selectedMeetingModal.organizer} ({selectedMeetingModal.organizerId})</div>
                <div><strong className="text-cyan-400">Day & Time:</strong> {selectedMeetingModal.date} at {selectedMeetingModal.time}</div>
                <div><strong className="text-slate-300">Target Department:</strong> {selectedMeetingModal.targetDept}</div>
                <div><strong className="text-slate-300">Status:</strong> {selectedMeetingModal.status}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Agenda & Meeting Brief:</h4>
                <p className="bg-slate-900/40 p-3 rounded border border-slate-800 text-slate-300">
                  {selectedMeetingModal.agenda}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Participants:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedMeetingModal.participants?.map(p => (
                    <span key={p} className="badge-tag bg-slate-800 text-cyan-300">{p}</span>
                  ))}
                </div>
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

      {/* Interactive Employee Profile Details Modal */}
      {selectedEmpModal && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card emp-detail-modal">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <img src={selectedEmpModal.avatar} alt={selectedEmpModal.name} className="w-12 h-12 rounded-full border-2 border-amber-400/50" />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEmpModal.name}</h3>
                  <span className="text-xs text-amber-400 font-mono">ID: {selectedEmpModal.id} • {selectedEmpModal.role}</span>
                </div>
              </div>
              <button onClick={() => setSelectedEmpModal(null)} className="icon-btn-ghost">✕</button>
            </div>

            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-xs">Department</span>
                  <span className="text-white font-medium">{selectedEmpModal.dept}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-xs">Email Address</span>
                  <span className="text-white font-medium">{selectedEmpModal.email}</span>
                </div>
              </div>

              {/* Employee Detailed Work Stats */}
              {(() => {
                const stats = getEmployeeStats(selectedEmpModal.id);
                const empLeaves = leavesList.filter(l => l.empId === selectedEmpModal.id);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                        <span className="text-xl font-bold text-amber-400 block">{stats.acceptedCount}</span>
                        <span className="text-xs text-slate-300">Accepted Tasks</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                        <span className="text-xl font-bold text-emerald-400 block">{stats.completedCount}</span>
                        <span className="text-xs text-slate-300">Completed Tasks</span>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg">
                        <span className="text-xl font-bold text-purple-400 block">{stats.totalLeaves}</span>
                        <span className="text-xs text-slate-300">Total Leaves</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-300">Leave History for {selectedEmpModal.name}</h4>
                      {empLeaves.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No leaves recorded for this employee.</p>
                      ) : (
                        empLeaves.map(l => (
                          <div key={l.id} className="text-xs bg-slate-900/40 p-2 rounded flex justify-between">
                            <span>{l.leaveType} ({l.noOfDays} days): {l.purpose}</span>
                            <span className="font-semibold text-amber-400">{l.status}</span>
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
                Close Detailed View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
