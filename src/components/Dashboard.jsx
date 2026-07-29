import React, { useState, useEffect } from 'react';
import { getUsers, getLeaves, getMaterials, getWorkLogs } from '../services/db';
import {
  Users,
  CalendarCheck,
  Boxes,
  ArrowRightLeft,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck,
  UserX,
  ChevronRight,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

export const Dashboard = ({ activeUser, selectedDept, setSelectedDept, onNavigate }) => {
  const [usersList, setUsersList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [workLogsList, setWorkLogsList] = useState([]);

  const [selectedEmpModal, setSelectedEmpModal] = useState(null);
  const [timeRangeFilter, setTimeRangeFilter] = useState('7_DAYS'); // 7_DAYS, 30_DAYS, ALL

  useEffect(() => {
    const fetchData = () => {
      setUsersList(getUsers());
      setLeavesList(getLeaves());
      setMaterialsList(getMaterials());
      setWorkLogsList(getWorkLogs());
    };
    fetchData();
    window.addEventListener('mra_db_updated', fetchData);
    return () => window.removeEventListener('mra_db_updated', fetchData);
  }, []);

  // Department Filtered Data
  const filterByDept = (dept) => {
    if (!selectedDept || selectedDept === 'ALL DEPARTMENTS') return true;
    return dept === selectedDept;
  };

  const filteredUsers = usersList.filter(u => filterByDept(u.dept));
  const filteredLeaves = leavesList.filter(l => filterByDept(l.dept));
  const filteredMaterials = materialsList.filter(m => filterByDept(m.deptName));
  const filteredWorkLogs = workLogsList.filter(w => filterByDept(w.fromDept) || filterByDept(w.toDept));

  // Compute Employee Work Performance Metrics
  const getEmployeeStats = (empId) => {
    const empLeaves = leavesList.filter(l => l.empId === empId && l.status === 'Approved');
    const isOnLeaveToday = empLeaves.some(l => {
      // Check if current date falls in leave range
      return l.status === 'Approved';
    });

    const acceptedRequests = workLogsList.filter(w => w.receiverEmpId === empId && w.status.includes('Accepted'));
    const completedRequests = workLogsList.filter(w => w.receiverEmpId === empId && w.status.includes('Completed'));
    const totalRequests = workLogsList.filter(w => w.receiverEmpId === empId);

    return {
      totalLeaves: empLeaves.length,
      status: isOnLeaveToday ? 'On Leave' : 'Active Working',
      acceptedCount: acceptedRequests.length,
      completedCount: completedRequests.length,
      totalAssigned: totalRequests.length
    };
  };

  // Find Top Performer Employee (highest current requests & accepted requests)
  const getTopPerformers = () => {
    const counts = {};
    workLogsList.forEach(w => {
      if (w.receiverEmpId) {
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

  const topPerformer = getTopPerformers();

  // Department-wise work load breakdown
  const getDeptBreakdown = () => {
    const depts = [
      'Hardware & Embedded Systems',
      'Software & AI Systems',
      'Inventory & Logistics',
      'Project Management',
      'Human Resources'
    ];
    return depts.map(d => {
      const activeWork = workLogsList.filter(w => (w.toDept === d || w.fromDept === d) && !w.status.includes('Completed'));
      const completedWork = workLogsList.filter(w => (w.toDept === d || w.fromDept === d) && w.status.includes('Completed'));
      const topInDept = workLogsList.filter(w => w.toDept === d).reduce((acc, curr) => {
        acc[curr.receiverName] = (acc[curr.receiverName] || 0) + 1;
        return acc;
      }, {});
      let topUser = 'N/A';
      let maxVal = 0;
      Object.entries(topInDept).forEach(([name, val]) => {
        if (val > maxVal) { maxVal = val; topUser = name; }
      });

      return {
        name: d,
        activeWorkCount: activeWork.length,
        completedWorkCount: completedWork.length,
        topEmployee: topUser
      };
    });
  };

  const deptStats = getDeptBreakdown();

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isHR = activeUser?.role === 'HR';
  const isTL = activeUser?.role === 'TL';

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div className="dash-hero-card glow-card">
        <div className="dash-hero-content">
          <div className="hero-badge">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Role Console: {activeUser?.role}</span>
          </div>
          <h2 className="hero-title">
            Welcome back, <span className="text-gradient-gold">{activeUser?.name}</span>
          </h2>
          <p className="hero-subtitle">
            {isCEO && 'CEO Executive Dashboard: Real-time oversight across all departments, leaves, inventory, and employees.'}
            {isPC && 'Project Coordinator Console: Tracking cross-department work distribution, team velocity, and past week completions.'}
            {isTL && `Team Lead Dashboard (${activeUser?.dept}): Associated team performance, leave requests, and inventory transfers.`}
            {isHR && 'HR Intelligence Hub: Organization-wide leave applications, work completions, and employee activity logs.'}
            {!isCEO && !isPC && !isTL && !isHR && 'Employee Operations Hub: Personal tasks, material requests, and active work transfer logs.'}
          </p>
        </div>

        {/* Top Performer Card (CEO & PC view) */}
        {(isCEO || isPC) && topPerformer && (
          <div className="top-performer-card">
            <Award className="w-8 h-8 text-amber-400 mb-2" />
            <div className="top-title">Top Work Accepted Performer</div>
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
            <span className="metric-label">Active Leave Requests</span>
            <span className="metric-value">{filteredLeaves.filter(l => l.status === 'Pending').length} Pending</span>
            <span className="metric-sub">{filteredLeaves.filter(l => l.status === 'Approved').length} Approved Leaves</span>
          </div>
        </div>

        <div className="metric-card glow-card" onClick={() => onNavigate('inventory')}>
          <div className="metric-icon-box bg-cyan-500/10 text-cyan-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Material & Inventory</span>
            <span className="metric-value">{filteredMaterials.filter(m => m.status.includes('Order')).length} Orders Placed</span>
            <span className="metric-sub">{filteredMaterials.filter(m => m.status.includes('Provided')).length} Items Handed Over</span>
          </div>
        </div>

        <div className="metric-card glow-card" onClick={() => onNavigate('work_transfer')}>
          <div className="metric-icon-box bg-emerald-500/10 text-emerald-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Work Transfers</span>
            <span className="metric-value">{filteredWorkLogs.filter(w => !w.status.includes('Completed')).length} Active Tasks</span>
            <span className="metric-sub">{filteredWorkLogs.filter(w => w.status.includes('Completed')).length} Tasks Completed ✅</span>
          </div>
        </div>

        <div className="metric-card glow-card">
          <div className="metric-icon-box bg-purple-500/10 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Department Members</span>
            <span className="metric-value">{filteredUsers.length} Employees</span>
            <span className="metric-sub">Across {selectedDept === 'ALL DEPARTMENTS' ? 'All Depts' : selectedDept}</span>
          </div>
        </div>
      </div>

      {/* CEO & Project Coordinator View: Department Load & Employee Roster */}
      {(isCEO || isPC || isHR) && (
        <div className="dash-two-col">
          {/* Department Request & Load Breakdown */}
          <div className="glow-card p-5">
            <div className="card-section-header">
              <Building className="w-5 h-5 text-amber-400" />
              <h3>Departmental Request Load & Top Performers</h3>
            </div>
            <div className="dept-stats-list">
              {deptStats.map(ds => (
                <div key={ds.name} className="dept-stat-row">
                  <div className="dept-info">
                    <span className="dept-name-text">{ds.name}</span>
                    <span className="dept-top-emp">Top Acceptor: <strong className="text-amber-300">{ds.topEmployee}</strong></span>
                  </div>
                  <div className="dept-badges">
                    <span className="badge-active">{ds.activeWorkCount} Active Requests</span>
                    <span className="badge-completed">{ds.completedWorkCount} Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Master Directory with Interactive Profile Modal on Click */}
          <div className="glow-card p-5">
            <div className="card-section-header">
              <Users className="w-5 h-5 text-sky-400" />
              <h3>Employee Directory & Work Status (Click for Details)</h3>
            </div>

            <div className="emp-roster-list">
              {filteredUsers.map(emp => {
                const stats = getEmployeeStats(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpModal(emp)}
                    className="emp-roster-item"
                  >
                    <img src={emp.avatar} alt={emp.name} className="emp-avatar-sm" />
                    <div className="emp-details flex-1">
                      <div className="emp-name-row">
                        <span className="emp-name-text">{emp.name}</span>
                        <span className="emp-id-tag">({emp.id})</span>
                      </div>
                      <span className="emp-dept-text">{emp.dept}</span>
                    </div>

                    <div className="emp-status-col">
                      <span className={`status-pill ${stats.status === 'On Leave' ? 'pill-leave' : 'pill-active'}`}>
                        {stats.status === 'On Leave' ? <UserX className="w-3 h-3 inline mr-1" /> : <UserCheck className="w-3 h-3 inline mr-1" />}
                        {stats.status}
                      </span>
                      <span className="emp-work-count">{stats.acceptedCount} Accepted Tasks</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TL (Team Lead) View: Associated Team Workloads */}
      {isTL && (
        <div className="glow-card p-5 mt-6">
          <div className="card-section-header">
            <Building className="w-5 h-5 text-amber-400" />
            <h3>Team Lead Overview for: {activeUser?.dept}</h3>
          </div>
          <div className="team-grid">
            {usersList.filter(u => u.dept === activeUser?.dept).map(emp => {
              const stats = getEmployeeStats(emp.id);
              return (
                <div key={emp.id} className="team-card glow-card">
                  <img src={emp.avatar} alt={emp.name} className="emp-avatar-md" />
                  <h4>{emp.name}</h4>
                  <span className="text-xs text-slate-400">ID: {emp.id}</span>
                  <div className="mt-3 text-sm">
                    <div>Leaves Taken: <strong>{stats.totalLeaves}</strong></div>
                    <div>Accepted Tasks: <strong className="text-amber-400">{stats.acceptedCount}</strong></div>
                    <div>Status: <span className="text-emerald-400 font-semibold">{stats.status}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Employee Profile Details Modal (CEO / PC / HR click trigger) */}
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
                      <h4 className="text-sm font-semibold text-slate-300">Recent Leave History</h4>
                      {empLeaves.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No leaves recorded.</p>
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
                Close Profile Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
