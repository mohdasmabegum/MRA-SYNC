import React, { useState, useEffect } from 'react';
import { getUsers, getLeaves, getMaterials, getWorkLogs, getMeetings } from '../services/db';
import {
  Users,
  CalendarCheck,
  Boxes,
  ArrowRightLeft,
  Award,
  Building,
  UserCheck,
  UserX,
  ChevronRight,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const Dashboard = ({ activeUser, selectedDept, setSelectedDept, onNavigate }) => {
  const [usersList, setUsersList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [workLogsList, setWorkLogsList] = useState([]);
  const [meetingsList, setMeetingsList] = useState([]);

  const [selectedEmpModal, setSelectedEmpModal] = useState(null);

  useEffect(() => {
    fetchData();
    window.addEventListener('mra_db_updated', fetchData);
    return () => window.removeEventListener('mra_db_updated', fetchData);
  }, []);

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

  // To-Do Work Tasks for Project Coordinator (tasks assigned to PC)
  const pcToDoTasks = workLogsList.filter(w => w.receiverEmpId === activeUser?.id && !w.status.includes('Completed'));
  const pcAssignedTasks = workLogsList.filter(w => w.senderEmpId === activeUser?.id);

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isHR = activeUser?.role === 'HR';
  const isTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';

  return (
    <div className="dashboard-container">
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
            {isPC && 'Project Coordinator Console: Select a department from the navbar dropdown to inspect department-specific top workers, task velocity, and pending meeting logs.'}
            {isCEO && 'CEO Executive Control: Department-wise overview of leaves, inventory, employees, and work transfers.'}
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

      {/* PROJECT COORDINATOR SPECIFIC: To-Do Works & Pending Meeting Logs */}
      {isPC && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* PC To-Do Tasks from CEO / TLs */}
          <div className="glow-card p-5">
            <div className="card-section-header">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <h3>Project Coordinator To-Do Work Tasks ({pcToDoTasks.length})</h3>
            </div>
            <div className="space-y-3">
              {pcToDoTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No pending To-Do tasks assigned to PC.</p>
              ) : (
                pcToDoTasks.map(t => (
                  <div key={t.id} className="bg-slate-900/60 p-3 rounded-lg border border-amber-500/30 text-xs">
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>{t.projectName} ({t.id})</span>
                      <span className="text-amber-400">{t.requirement}</span>
                    </div>
                    <div className="text-slate-300">From: {t.workAlloter} ({t.fromDept})</div>
                    <div className="text-slate-400 mt-1">{t.hardwareDocInfo}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PC Pending Meeting Logs */}
          <div className="glow-card p-5">
            <div className="card-section-header">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3>Pending Meeting Logs ({filteredMeetings.length})</h3>
            </div>
            <div className="space-y-3">
              {filteredMeetings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No pending meeting logs for {selectedDept}.</p>
              ) : (
                filteredMeetings.map(m => (
                  <div key={m.id} className="bg-slate-900/60 p-3 rounded-lg border border-cyan-500/30 text-xs">
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>{m.title}</span>
                      <span className="text-cyan-400">{m.date} @ {m.time}</span>
                    </div>
                    <div className="text-slate-300">Organizer: {m.organizer} | Dept: {m.targetDept}</div>
                    <div className="text-slate-400 mt-1">Agenda: {m.agenda}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT-SCOPED DATA VIEW (Requirement #7 & #8):
          Until a specific department is selected, prompt user or show department roster */}
      {!isSpecificDeptSelected && (isPC || isCEO) && (
        <div className="alert-card alert-warning mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-amber-300">Department Scope Filter</h4>
          </div>
          <p className="text-xs text-slate-300">
            Please select a specific department from the navbar dropdown to inspect department-scoped top worker statistics, employee rosters, and departmental work transfer logs.
          </p>
        </div>
      )}

      {/* Employee List & Employee On Leave Portal per Department (Requirement #10) */}
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
                const empWork = workLogsList.filter(w => w.receiverEmpId === selectedEmpModal.id);
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
