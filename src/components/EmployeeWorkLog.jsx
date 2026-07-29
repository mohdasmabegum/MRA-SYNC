import React, { useState, useEffect } from 'react';
import { getWorkLogs, getLeaves, getMaterials } from '../services/db';
import { FileText, CalendarCheck, Boxes, ArrowRightLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const EmployeeWorkLog = ({ activeUser }) => {
  const [myWorkLogs, setMyWorkLogs] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);

  useEffect(() => {
    loadMyLogs();
    window.addEventListener('mra_db_updated', loadMyLogs);
    return () => window.removeEventListener('mra_db_updated', loadMyLogs);
  }, [activeUser]);

  const loadMyLogs = () => {
    const allWork = getWorkLogs();
    const allLeaves = getLeaves();
    const allMaterials = getMaterials();

    // Strict Employee Scoping: Only show logged-in employee's data!
    setMyWorkLogs(allWork.filter(w => w.receiverEmpId === activeUser?.id || w.senderEmpId === activeUser?.id));
    setMyLeaves(allLeaves.filter(l => l.empId === activeUser?.id));
    setMyMaterials(allMaterials.filter(m => m.empId === activeUser?.id));
  };

  return (
    <div className="portal-page-container">
      {/* Header Bar */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title">
            <FileText className="w-6 h-6 text-amber-400 inline mr-2" />
            Personal Work Log Base ({activeUser?.name})
          </h2>
          <p className="portal-subtitle">Strictly private log of your received & assigned work transfers, leave applications, and material requisitions.</p>
        </div>
        <div className="font-mono text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
          Employee ID: {activeUser?.id}
        </div>
      </div>

      {/* 1. Received & Assigned Work Tasks */}
      <div className="glow-card p-5 mb-6">
        <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
          My Work Transfer Tasks ({myWorkLogs.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Role in Task</th>
                <th>Project Name</th>
                <th>Sender / Receiver</th>
                <th>Hardware & Doc Info</th>
                <th>Created Date</th>
                <th>Completed Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myWorkLogs.map(w => {
                const isReceiver = w.receiverEmpId === activeUser?.id;
                return (
                  <tr key={w.id}>
                    <td className="font-mono text-emerald-400 text-xs font-semibold">{w.id}</td>
                    <td>
                      <span className={`badge-tag ${isReceiver ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
                        {isReceiver ? 'Receiver Employee' : 'Work Alloter (Sender)'}
                      </span>
                    </td>
                    <td className="font-bold text-white text-xs">{w.projectName}</td>
                    <td className="text-xs text-slate-300">
                      {isReceiver ? `From: ${w.workAlloter}` : `To: ${w.receiverName}`}
                    </td>
                    <td className="text-xs text-slate-300 max-w-xs truncate">{w.hardwareDocInfo}</td>
                    <td className="text-xs text-slate-400">{w.createdDate}</td>
                    <td className="text-xs text-slate-400">{w.completedDate}</td>
                    <td>
                      <span className={`status-pill ${w.status.includes('Completed') ? 'pill-active' : 'pill-pending'}`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. My Leave Applications */}
        <div className="glow-card p-5">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            My Leave Applications ({myLeaves.length})
          </h3>
          <div className="space-y-3">
            {myLeaves.map(l => (
              <div key={l.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-amber-400 font-bold">{l.id} ({l.leaveType})</span>
                  <span className={`status-pill ${l.status === 'Approved' ? 'pill-active' : 'pill-pending'}`}>{l.status}</span>
                </div>
                <div className="text-white font-medium">{l.fromTo} ({l.noOfDays} Days)</div>
                <div className="text-slate-400 mt-1">{l.purpose}</div>
                <div className="text-slate-500 mt-1 text-[11px]">Applied: {l.appliedDate} • Approved By: {l.approvedBy}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. My Material Requests */}
        <div className="glow-card p-5">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            My Material Requests ({myMaterials.length})
          </h3>
          <div className="space-y-3">
            {myMaterials.map(m => (
              <div key={m.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-cyan-400 font-bold">{m.id}</span>
                  <span className={`status-pill ${m.status.includes('Provided') ? 'pill-active' : 'pill-pending'}`}>{m.status}</span>
                </div>
                <div className="text-white font-medium">{m.materialType} ({m.noOfUnits})</div>
                <div className="text-slate-400 mt-1">Project: {m.forProject}</div>
                <div className="text-slate-500 mt-1 text-[11px]">Request Date: {m.requestDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
