import React, { useState, useEffect } from 'react';
import { getWorkLogs, getLeaves, getMaterials } from '../services/db';
import { FileText, ArrowRightLeft, CalendarCheck, Boxes, User, ArrowLeft } from 'lucide-react';

export const EmployeeWorkLog = ({ activeUser }) => {
  const [workLogs, setWorkLogs] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, [activeUser]);

  const loadData = () => {
    const allWork = getWorkLogs();
    const allLeaves = getLeaves();
    const allMaterials = getMaterials();

    // STRICT PERSONAL LOG FILTERING (Account Owner ONLY)
    setWorkLogs(allWork.filter(w => w.receiverEmpId === activeUser?.id || w.senderEmpId === activeUser?.id));
    setLeaves(allLeaves.filter(l => l.empId === activeUser?.id));
    setMaterials(allMaterials.filter(m => m.empId === activeUser?.id));
  };

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
          <h2 className="portal-title flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Account Owner Work Log Base
          </h2>
          <p className="portal-subtitle">Personal records for {activeUser?.name} ({activeUser?.id} - {activeUser?.dept}).</p>
        </div>
      </div>

      {/* Account Owner Card */}
      <div className="glow-card p-5 flex items-center justify-between border-amber-500/30">
        <div className="flex items-center gap-4">
          <img src={activeUser?.avatar} alt={activeUser?.name} className="w-14 h-14 rounded-full border-2 border-amber-400" />
          <div>
            <h3 className="text-lg font-bold text-white">{activeUser?.name}</h3>
            <span className="text-xs text-amber-400 font-mono">ID: {activeUser?.id} • Role: {activeUser?.role}</span>
            <div className="text-xs text-slate-400">{activeUser?.dept}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold text-base block">{workLogs.length}</span>
            <span className="text-slate-400">Work Logs</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-bold text-base block">{materials.length}</span>
            <span className="text-slate-400">Material Reqs</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-purple-400 font-bold text-base block">{leaves.length}</span>
            <span className="text-slate-400">Leaves</span>
          </div>
        </div>
      </div>

      {/* Personal Work Logs Table */}
      <div className="glow-card p-5">
        <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          Personal Work Transfer Records ({workLogs.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Project Name</th>
                <th>Sender (Alloter)</th>
                <th>Receiver</th>
                <th>Hardware & Doc Details</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-slate-500 italic">No work transfer logs recorded for your account.</td>
                </tr>
              ) : (
                workLogs.map(w => (
                  <tr key={w.id}>
                    <td className="font-mono text-cyan-400 text-xs font-semibold">{w.id}</td>
                    <td className="font-bold text-white">{w.projectName}</td>
                    <td className="text-slate-300">{w.workAlloter}</td>
                    <td className="text-amber-300 font-medium">{w.receiverName}</td>
                    <td className="text-xs text-slate-400 max-w-xs truncate">{w.hardwareDocInfo}</td>
                    <td>
                      <span className="badge-tag bg-slate-800 text-slate-300">{w.requirement}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${w.status.includes('Completed') ? 'pill-active' : 'pill-pending'}`}>
                        {w.status}
                      </span>
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
