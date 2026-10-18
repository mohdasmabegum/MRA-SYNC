import React, { useState, useEffect } from 'react';
import { getMaterials, addMaterialRequest, updateMaterialStatus, getUsers } from '../services/db';
import { useToast } from '../context/ToastContext';
import { Boxes, PlusCircle, ShoppingCart, AlertTriangle, Layers, ArrowLeft, Check } from 'lucide-react';

const TH = { color:'var(--text-3)', fontSize:'0.71rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px', padding:'11px 14px', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' };
const TD = { padding:'12px 14px', borderBottom:'1px solid var(--border-subtle)', color:'var(--text-2)', fontSize:'0.83rem', verticalAlign:'middle' };
const EMPTY = { color:'var(--text-3)', fontStyle:'italic', textAlign:'center', padding:'24px' };
const SH = { fontWeight:700, color:'var(--text-1)', fontSize:'0.92rem', display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border-subtle)' };

const PriorityTag = ({ val }) => {
  const em = val === 'Emergency';
  return (
    <span style={{
      background: em ? 'rgba(252,129,129,0.10)' : 'var(--bg-hover)',
      color: em ? 'var(--rose)' : 'var(--text-2)',
      border: `1px solid ${em ? 'rgba(252,129,129,0.25)' : 'var(--border-subtle)'}`,
      padding:'2px 9px', borderRadius:'12px', fontSize:'0.68rem', fontWeight:600, display:'inline-flex'
    }}>{val}</span>
  );
};

export const InventoryPortal = ({ activeUser, selectedDept, onBackToDashboard }) => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showForm,  setShowForm]  = useState(false);

  const isCEO         = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC          = activeUser?.role === 'PROJECT_COORDINATOR';
  const isTLOrSubTL   = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isInventoryUser = activeUser?.dept === 'Inventory & Logistics';
  const isNormalEmp   = activeUser?.role === 'EMPLOYEE';

  const ownDeptTLs = usersList.filter(u =>
    (u.role === 'TL' || u.role === 'SUB_TL' || u.role === 'CEO/FOUNDER/DIRECTOR') &&
    (isCEO || isPC ? true : u.dept === activeUser?.dept)
  );

  const [formData, setFormData] = useState({
    empName: activeUser?.name||'', empId: activeUser?.id||'',
    deptName: activeUser?.dept||'Hardware & Embedded Systems',
    targetTLId:'', targetTLName:'', materialType:'', noOfUnits:'1 Unit',
    requirementType:'Quick', forProject:''
  });

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, []);

  const loadData = () => { setMaterials(getMaterials()); setUsersList(getUsers()); };

  const handleTLSelect = (tlId) => {
    const sel = usersList.find(u => u.id === tlId);
    if (sel) setFormData({...formData, targetTLId:sel.id, targetTLName:sel.name});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.materialType || !formData.forProject) { showToast('Please enter material type and project name.', 'error'); return; }
    if (!formData.targetTLId) { showToast(`Please select your assigned TL/Sub-TL from ${activeUser?.dept}.`, 'error'); return; }
    addMaterialRequest(formData);
    showToast(`Requisition submitted to TL ${formData.targetTLName}!`, 'success', 'Request Created');
    setShowForm(false);
    setFormData({ empName:activeUser?.name||'', empId:activeUser?.id||'', deptName:activeUser?.dept||'Hardware & Embedded Systems', targetTLId:'', targetTLName:'', materialType:'', noOfUnits:'1 Unit', requirementType:'Quick', forProject:'' });
  };

  const handleTLApprove  = (id) => { updateMaterialStatus(id, { status:'TL Approved -> Forwarded to Inventory', updates:`Approved by TL ${activeUser?.name}. Forwarded to Inventory.` }); showToast(`Request ${id} approved & forwarded!`, 'success'); };
  const handlePlaceOrder = (id) => { const now = new Date().toLocaleString(); updateMaterialStatus(id, { status:'Order Placed', orderPlacedDate:now, orderReceivedDate:'Pending Delivery', noOfDaysToReceiveOrder:'3-7 Days', updates:'Purchase Order submitted to supplier.' }); showToast(`Order placed for ${id}.`, 'info'); };

  const isDeptFiltered = selectedDept && selectedDept !== 'ALL DEPARTMENTS';
  const displayed = materials.filter(m => {
    if (isNormalEmp)  return m.empId === activeUser?.id;
    if (isTLOrSubTL) return m.deptName === activeUser?.dept || m.targetTLId === activeUser?.id;
    if (isDeptFiltered) return m.deptName === selectedDept;
    return true;
  });

  const teamReqs       = displayed.filter(m => m.empId !== activeUser?.id);
  const invReqs        = displayed.filter(m => m.status.includes('Forwarded') || m.status.includes('Order') || m.status.includes('Provided') || m.empId === activeUser?.id);
  const todoOrderList  = displayed.filter(m => m.status === 'Pending for Order (To-Do)');

  return (
    <div className="portal-page-container">
      <button onClick={onBackToDashboard} className="nav-back-symbol-btn">
        <ArrowLeft className="w-4 h-4" /><span>Return to Dashboard</span>
      </button>

      {/* Header */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <Boxes style={{color:'var(--blue)'}} className="w-6 h-6" />
            Material Requisitions & Inventory ({isNormalEmp ? activeUser?.dept : selectedDept})
          </h2>
          <p className="portal-subtitle">
            {isNormalEmp ? `Requisitions forwarded to your ${activeUser?.dept} Team Lead / Sub-TL.` : 'Departmental stock status and inventory fulfillments.'}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Requisition Material'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card" style={{padding:'24px'}}>
          <h3 style={{fontWeight:700, color:'var(--text-1)', fontSize:'1rem', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border-subtle)'}}>
            📦 New Material Requisition
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Requester Name</label>
              <input type="text" value={formData.empName} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Requester ID</label>
              <input type="text" value={formData.empId} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" value={formData.deptName} readOnly style={{opacity:0.65,cursor:'default'}} />
            </div>
            <div className="form-group">
              <label>Target TL / Sub-TL <span style={{color:'var(--rose)'}}>*</span></label>
              <select value={formData.targetTLId} onChange={e => handleTLSelect(e.target.value)} required>
                <option value="">Select Assigned TL / Sub-TL...</option>
                {ownDeptTLs.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role} – {u.dept})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{gridColumn:'span 2'}}>
              <label>Material Type Needed <span style={{color:'var(--rose)'}}>*</span></label>
              <input type="text" placeholder="e.g. STM32 Dev Board / Cat6 Cable" value={formData.materialType} onChange={e => setFormData({...formData,materialType:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Quantity / Length</label>
              <input type="text" placeholder="e.g. 10 Units / 50m" value={formData.noOfUnits} onChange={e => setFormData({...formData,noOfUnits:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Project Name <span style={{color:'var(--rose)'}}>*</span></label>
              <input type="text" placeholder="e.g. Apollo Gateway Module" value={formData.forProject} onChange={e => setFormData({...formData,forProject:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <select value={formData.requirementType} onChange={e => setFormData({...formData,requirementType:e.target.value})}>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Quick">Quick ⚡</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'16px'}}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Submit Requisition to TL</button>
          </div>
        </form>
      )}

      {/* To-Do Alert */}
      {todoOrderList.length > 0 && (
        <div className="alert-card alert-warning">
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
            <AlertTriangle style={{color:'var(--amber)'}} className="w-5 h-5" />
            <h4 style={{fontWeight:700, color:'var(--amber)'}}>Inventory To-Do: Pending Orders ({todoOrderList.length})</h4>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {todoOrderList.map(item => (
              <div key={item.id} style={{background:'var(--bg-hover)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.82rem'}}>
                <div>
                  <span style={{fontWeight:700, color:'var(--amber)', marginRight:'8px', fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem'}}>{item.id}</span>
                  <span style={{fontWeight:600, color:'var(--text-1)'}}>{item.materialType} ({item.noOfUnits})</span>
                  <span style={{color:'var(--text-3)', marginLeft:'8px'}}>For: {item.forProject} · TL: {item.targetTLName}</span>
                </div>
                {(isTLOrSubTL || isInventoryUser || isCEO) && (
                  <button onClick={() => handlePlaceOrder(item.id)} className="btn-gold btn-xs">
                    <ShoppingCart className="w-3.5 h-3.5" /> Place Order
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TL / CEO / Inventory two-section view */}
      {(isTLOrSubTL || isCEO || isPC || isInventoryUser) ? (
        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
          {/* Section 1: Team Requisitions */}
          <div className="glow-card" style={{padding:'24px'}}>
            <h3 style={{...SH, color:'var(--amber)'}}>
              <Layers style={{width:'18px',height:'18px',color:'var(--amber)'}} />
              Section 1 — From Team Members ({teamReqs.length})
            </h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    {['Req ID','Team Requester','Target TL','Material','Qty','Project','Priority','Status','TL Action'].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamReqs.length === 0 ? (
                    <tr><td colSpan="9" style={EMPTY}>No team requisitions pending approval.</td></tr>
                  ) : teamReqs.map(m => (
                    <tr key={m.id}>
                      <td style={{...TD, fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', fontWeight:600, color:'var(--blue)'}}>{m.id}</td>
                      <td style={TD}>
                        <div style={{fontWeight:600, color:'var(--text-1)'}}>{m.empName}</div>
                        <div style={{fontSize:'0.72rem', color:'var(--text-3)'}}>{m.empId} · {m.deptName}</div>
                      </td>
                      <td style={{...TD, color:'var(--amber)', fontWeight:600, fontSize:'0.80rem'}}>{m.targetTLName||'TL Assigned'}</td>
                      <td style={{...TD, fontWeight:600, color:'var(--text-1)'}}>{m.materialType}</td>
                      <td style={{...TD, color:'var(--amber)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem'}}>{m.noOfUnits}</td>
                      <td style={{...TD, fontSize:'0.80rem'}}>{m.forProject}</td>
                      <td style={TD}><PriorityTag val={m.requirementType} /></td>
                      <td style={TD}><span className={`status-pill ${m.status.includes('Provided')?'pill-active':'pill-pending'}`}>{m.status}</span></td>
                      <td style={TD}>
                        {m.status === 'Pending Review' ? (
                          <button onClick={() => handleTLApprove(m.id)} className="btn-emerald btn-xs">
                            <Check className="w-3.5 h-3.5" /> Approve & Forward
                          </button>
                        ) : (
                          <span style={{fontSize:'0.72rem', color:'var(--emerald)', fontWeight:600}}>✓ Approved by TL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Inventory Status */}
          <div className="glow-card" style={{padding:'24px'}}>
            <h3 style={{...SH, color:'var(--blue)'}}>
              <Boxes style={{width:'18px',height:'18px',color:'var(--blue)'}} />
              Section 2 — Stock Status & Inventory Fulfillments ({invReqs.length})
            </h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    {['Req ID','Requester','Material','Qty','Stock Availability','Status','Inventory Handler'].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invReqs.length === 0 ? (
                    <tr><td colSpan="7" style={EMPTY}>No items currently forwarded to Inventory.</td></tr>
                  ) : invReqs.map(m => (
                    <tr key={m.id}>
                      <td style={{...TD, fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', fontWeight:600, color:'var(--blue)'}}>{m.id}</td>
                      <td style={TD}>
                        <div style={{fontWeight:600, color:'var(--text-1)'}}>{m.empName}</div>
                        <div style={{fontSize:'0.72rem', color:'var(--text-3)'}}>{m.empId} · {m.deptName}</div>
                      </td>
                      <td style={{...TD, fontWeight:600, color:'var(--text-1)'}}>{m.materialType}</td>
                      <td style={{...TD, color:'var(--amber)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem'}}>{m.noOfUnits}</td>
                      <td style={TD}>
                        <span style={{fontWeight:600, color: m.availableAtMoment==='Yes' ? 'var(--emerald)' : m.availableAtMoment==='No' ? 'var(--rose)' : 'var(--amber)'}}>
                          {m.availableAtMoment || 'In Stock Check'}
                        </span>
                      </td>
                      <td style={TD}><span className={`status-pill ${m.status.includes('Provided')?'pill-active':'pill-pending'}`}>{m.status}</span></td>
                      <td style={{...TD, fontSize:'0.78rem', color:'var(--text-3)'}}>{m.inventoryHandledBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Employee View */
        <div className="glow-card" style={{padding:'24px'}}>
          <h3 style={SH}>My Material Requisitions ({displayed.length})</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {['Req ID','Assigned TL','Material','Qty','Project','Priority','Status','Updates'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr><td colSpan="8" style={EMPTY}>No requisitions found for your account.</td></tr>
                ) : displayed.map(m => (
                  <tr key={m.id}>
                    <td style={{...TD, fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', fontWeight:600, color:'var(--blue)'}}>{m.id}</td>
                    <td style={{...TD, color:'var(--amber)', fontWeight:600}}>{m.targetTLName||'TL Assigned'}</td>
                    <td style={{...TD, fontWeight:600, color:'var(--text-1)'}}>{m.materialType}</td>
                    <td style={{...TD, color:'var(--amber)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem'}}>{m.noOfUnits}</td>
                    <td style={TD}>{m.forProject}</td>
                    <td style={TD}><PriorityTag val={m.requirementType} /></td>
                    <td style={TD}><span className={`status-pill ${m.status.includes('Provided')?'pill-active':'pill-pending'}`}>{m.status}</span></td>
                    <td style={{...TD, fontSize:'0.78rem', color:'var(--text-3)'}}>{m.updates}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
