import React, { useState, useEffect } from 'react';
import { getWorkLogs, getLeaves, getMaterials } from '../services/db';
import { FileText, ArrowRightLeft, CalendarCheck, Boxes, ArrowLeft } from 'lucide-react';

const S = {
  td:   { padding:'12px 14px', borderBottom:'1px solid var(--border-subtle)', color:'var(--text-2)', fontSize:'0.83rem', verticalAlign:'middle' },
  id:   { fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', fontWeight:600, color:'var(--blue)' },
  name: { fontWeight:700, color:'var(--text-1)' },
  muted:{ color:'var(--text-3)', fontSize:'0.75rem' },
  amber:{ color:'var(--amber)', fontWeight:600 },
  empty:{ color:'var(--text-3)', fontStyle:'italic', textAlign:'center', padding:'24px' },
  sH:   { fontWeight:700, color:'var(--text-1)', fontSize:'0.92rem', display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border-subtle)' },
  stat: (rgb) => ({ background:`rgba(${rgb},0.08)`, border:`1px solid rgba(${rgb},0.20)`, padding:'16px 12px', borderRadius:'var(--r-md)', textAlign:'center', flex:1 }),
  tag:  { background:'var(--bg-hover)', border:'1px solid var(--border-subtle)', padding:'2px 9px', borderRadius:'12px', fontSize:'0.68rem', fontWeight:600, color:'var(--text-2)', display:'inline-flex' },
};

export const EmployeeWorkLog = ({ activeUser, onBackToDashboard }) => {
  const [workLogs,  setWorkLogs]  = useState([]);
  const [leaves,    setLeaves]    = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, [activeUser]);

  const loadData = () => {
    setWorkLogs(getWorkLogs().filter(w => w.receiverEmpId === activeUser?.id || w.senderEmpId === activeUser?.id));
    setLeaves(getLeaves().filter(l => l.empId === activeUser?.id));
    setMaterials(getMaterials().filter(m => m.empId === activeUser?.id));
  };

  return (
    <div className="portal-page-container">
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" /><span>Return to Dashboard</span>
      </button>

      {/* Header */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <FileText style={{color:'var(--amber)'}} className="w-6 h-6" />
            Personal Work Log Base
          </h2>
          <p className="portal-subtitle">Records for {activeUser?.name} — {activeUser?.id} · {activeUser?.dept}</p>
        </div>
      </div>

      {/* Profile + Stats Card */}
      <div className="glow-card" style={{padding:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--r-md)',
              background: 'rgba(99,179,237,0.12)',
              color: 'var(--blue)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              fontSize: '0.85rem',
              flexShrink: 0
            }}
          >
            {activeUser?.id?.replace(/[^0-9A-Z]/gi, '').slice(-4) || 'EMP'}
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'2px'}}>{activeUser?.name}</div>
            <div style={{fontSize:'0.78rem', color:'var(--blue)', fontFamily:'JetBrains Mono,monospace', marginBottom:'2px', fontWeight:600}}>
              Employee ID: {activeUser?.id} · {activeUser?.role}
            </div>
            <div style={{fontSize:'0.75rem', color:'var(--text-3)'}}>{activeUser?.dept}</div>
          </div>
        </div>

        <div style={{display:'flex', gap:'12px'}}>
          <div style={S.stat('99,179,237')}>
            <div style={{fontSize:'1.4rem', fontWeight:800, color:'var(--blue)', lineHeight:1}}>{workLogs.length}</div>
            <div style={{fontSize:'0.72rem', color:'var(--text-3)', marginTop:'4px'}}>Work Logs</div>
          </div>
          <div style={S.stat('72,187,120')}>
            <div style={{fontSize:'1.4rem', fontWeight:800, color:'var(--emerald)', lineHeight:1}}>{materials.length}</div>
            <div style={{fontSize:'0.72rem', color:'var(--text-3)', marginTop:'4px'}}>Material Reqs</div>
          </div>
          <div style={S.stat('183,148,244')}>
            <div style={{fontSize:'1.4rem', fontWeight:800, color:'var(--purple)', lineHeight:1}}>{leaves.length}</div>
            <div style={{fontSize:'0.72rem', color:'var(--text-3)', marginTop:'4px'}}>Leave Apps</div>
          </div>
        </div>
      </div>

      {/* Work Transfer Records */}
      <div className="glow-card" style={{padding:'24px'}}>
        <h3 style={S.sH}>
          <ArrowRightLeft style={{width:'18px', height:'18px', color:'var(--emerald)'}} />
          Personal Work Transfer Records ({workLogs.length})
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {['Task ID','Project Name','Sender','Receiver','Hardware & Doc Details','Priority','Status'].map(h => (
                  <th key={h} style={{color:'var(--text-3)',fontSize:'0.71rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.6px',padding:'11px 14px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workLogs.length === 0 ? (
                <tr><td colSpan="7" style={S.empty}>No work transfer logs recorded for your account.</td></tr>
              ) : workLogs.map(w => (
                <tr key={w.id}>
                  <td style={{...S.td,...S.id}}>{w.id}</td>
                  <td style={{...S.td,...S.name}}>{w.projectName}</td>
                  <td style={S.td}>{w.workAlloter}</td>
                  <td style={{...S.td,...S.amber}}>{w.receiverName}</td>
                  <td style={{...S.td, ...S.muted, maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{w.hardwareDocInfo}</td>
                  <td style={S.td}><span style={S.tag}>{w.requirement}</span></td>
                  <td style={S.td}>
                    <span className={`status-pill ${w.status.includes('Completed')?'pill-active':'pill-pending'}`}>{w.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
