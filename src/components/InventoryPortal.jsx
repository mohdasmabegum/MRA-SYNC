import React, { useState, useEffect } from 'react';
import { getMaterials, addMaterialRequest, updateMaterialStatus, getUsers } from '../services/db';
import { useToast } from '../context/ToastContext';
import { Boxes, PlusCircle, ShoppingCart, AlertTriangle, Layers, ArrowLeft, Check } from 'lucide-react';

export const InventoryPortal = ({ activeUser, selectedDept }) => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const isCEO = activeUser?.role === 'CEO/FOUNDER/DIRECTOR';
  const isPC = activeUser?.role === 'PROJECT_COORDINATOR';
  const isTLOrSubTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL';
  const isInventoryUser = activeUser?.dept === 'Inventory & Logistics';
  const isNormalEmp = activeUser?.role === 'EMPLOYEE';

  const ownDeptTLs = usersList.filter(u =>
    (u.role === 'TL' || u.role === 'SUB_TL' || u.role === 'CEO/FOUNDER/DIRECTOR') &&
    (isCEO || isPC ? true : u.dept === activeUser?.dept)
  );

  const [formData, setFormData] = useState({
    empName: activeUser?.name || '',
    empId: activeUser?.id || '',
    deptName: activeUser?.dept || 'Hardware & Embedded Systems',
    targetTLId: '',
    targetTLName: '',
    materialType: '',
    noOfUnits: '1 Unit',
    requirementType: 'Quick',
    forProject: ''
  });

  useEffect(() => {
    loadData();
    window.addEventListener('mra_db_updated', loadData);
    return () => window.removeEventListener('mra_db_updated', loadData);
  }, []);

  const loadData = () => {
    setMaterials(getMaterials());
    setUsersList(getUsers());
  };

  const handleTLSelect = (tlId) => {
    const selected = usersList.find(u => u.id === tlId);
    if (selected) {
      setFormData({
        ...formData,
        targetTLId: selected.id,
        targetTLName: selected.name
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.materialType || !formData.forProject) {
      showToast('Please enter material type and project name.', 'error');
      return;
    }

    if (!formData.targetTLId) {
      showToast(`Please select your assigned Team Lead / Sub-TL from ${activeUser?.dept}.`, 'error', 'Target TL Required');
      return;
    }

    addMaterialRequest(formData);
    showToast(`Material requisition submitted to TL ${formData.targetTLName} (${formData.targetTLId})!`, 'success', 'Request Created');
    setShowForm(false);
    setFormData({
      empName: activeUser?.name || '',
      empId: activeUser?.id || '',
      deptName: activeUser?.dept || 'Hardware & Embedded Systems',
      targetTLId: '',
      targetTLName: '',
      materialType: '',
      noOfUnits: '1 Unit',
      requirementType: 'Quick',
      forProject: ''
    });
  };

  const handleTLApproveRequest = (id) => {
    updateMaterialStatus(id, {
      status: 'TL Approved -> Forwarded to Inventory',
      updates: `Approved by TL ${activeUser?.name}. Forwarded to Inventory team for stock fulfillment.`
    });
    showToast(`Request ${id} approved by TL & forwarded to Inventory team!`, 'success');
  };

  const handlePlaceOrder = (id) => {
    const now = new Date().toLocaleString();
    updateMaterialStatus(id, {
      status: 'Order Placed',
      orderPlacedDate: now,
      orderReceivedDate: 'Pending Delivery',
      noOfDaysToReceiveOrder: '3-7 Days (Estimated)',
      updates: 'Purchase Order submitted to supplier. Awaiting delivery.'
    });
    showToast(`Order placed for request ${id}.`, 'info');
  };

  // Department-Wise Filtering
  const isDeptFiltered = selectedDept && selectedDept !== 'ALL DEPARTMENTS';

  const displayedMaterials = materials.filter(m => {
    if (isNormalEmp) return m.empId === activeUser?.id;
    if (isTLOrSubTL) return m.deptName === activeUser?.dept || m.targetTLId === activeUser?.id;
    if (isDeptFiltered) return m.deptName === selectedDept;
    return true;
  });

  const teamRequisitions = displayedMaterials.filter(m => m.empId !== activeUser?.id);
  const tlToInventoryRequisitions = displayedMaterials.filter(m => m.status.includes('Forwarded') || m.status.includes('Order') || m.status.includes('Provided') || m.empId === activeUser?.id);
  const todoOrderList = displayedMaterials.filter(m => m.status === 'Pending for Order (To-Do)');

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
          <h2 className="portal-title">
            <Boxes className="w-6 h-6 text-cyan-400 inline mr-2" />
            Material Requisitions & Inventory Portal ({isNormalEmp ? activeUser?.dept : selectedDept})
          </h2>
          <p className="portal-subtitle">
            {isNormalEmp ? `Requisitions are forwarded to your ${activeUser?.dept} Team Lead / Sub-TL.` : 'Departmental stock status and inventory fulfillments.'}
          </p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-5 h-5 mr-1" />
          <span>{showForm ? 'Cancel Request' : 'Requisition Material'}</span>
        </button>
      </div>

      {/* Requisition Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card form-card p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
            📦 New Material Requisition Form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Requester Name</label>
              <input type="text" value={formData.empName} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Requester User ID</label>
              <input type="text" value={formData.empId} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" value={formData.deptName} readOnly className="bg-slate-900 text-slate-400" />
            </div>

            <div className="form-group">
              <label>Target TL / Sub-TL ({activeUser?.dept}) <span className="text-rose-400">*</span></label>
              <select
                value={formData.targetTLId}
                onChange={e => handleTLSelect(e.target.value)}
                required
              >
                <option value="">Select Assigned TL / Sub-TL...</option>
                {ownDeptTLs.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role} - {u.dept})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group md:col-span-2">
              <label>Type of Material Needed <span className="text-rose-400">*</span></label>
              <input type="text" placeholder="e.g. STM32 Dev Board / Cat6 Cable" value={formData.materialType} onChange={e => setFormData({ ...formData, materialType: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Quantity / Length</label>
              <input type="text" placeholder="e.g. 10 Units / 50 Meters" value={formData.noOfUnits} onChange={e => setFormData({ ...formData, noOfUnits: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Project Name <span className="text-rose-400">*</span></label>
              <input type="text" placeholder="e.g. Apollo Gateway Module" value={formData.forProject} onChange={e => setFormData({ ...formData, forProject: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Requirement Urgency</label>
              <select value={formData.requirementType} onChange={e => setFormData({ ...formData, requirementType: e.target.value })}>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Quick">Quick ⚡</option>
                <option value="General">General ℹ️</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-gold">Submit Requisition to TL</button>
          </div>
        </form>
      )}

      {/* Inventory Reminder To-Do List */}
      {todoOrderList.length > 0 && (
        <div className="alert-card alert-warning mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-amber-300">
              Inventory To-Do List: Pending Orders ({todoOrderList.length})
            </h4>
          </div>

          <div className="space-y-2">
            {todoOrderList.map(item => (
              <div key={item.id} className="bg-slate-900/80 p-3 rounded border border-amber-500/30 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-amber-400 mr-2">{item.id}</span>
                  <span className="text-white font-medium">{item.materialType} ({item.noOfUnits})</span>
                  <span className="text-slate-400 ml-2">For: {item.forProject} (TL: {item.targetTLName})</span>
                </div>
                {(isTLOrSubTL || isInventoryUser || isCEO) && (
                  <button onClick={() => handlePlaceOrder(item.id)} className="btn-gold btn-xs">
                    <ShoppingCart className="w-3 h-3 mr-1" /> Place Order Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TWO SECTIONS FOR TL / SUB-TL ACCOUNTS */}
      {(isTLOrSubTL || isCEO || isPC || isInventoryUser) ? (
        <div className="space-y-6">
          {/* SECTION 1: Team Requisitions (Employee -> TL / Sub-TL) */}
          <div className="glow-card p-5 border-amber-500/30">
            <h3 className="text-md font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              SECTION 1: Requisitions Received from Team Members ({teamRequisitions.length})
            </h3>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Team Requester</th>
                    <th>Target TL / Sub-TL</th>
                    <th>Material Needed</th>
                    <th>Qty</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Inventory Status</th>
                    <th>TL Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRequisitions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-slate-500 italic">No team requisitions pending approval.</td>
                    </tr>
                  ) : (
                    teamRequisitions.map(m => (
                      <tr key={m.id}>
                        <td className="font-mono text-cyan-400 text-xs font-semibold">{m.id}</td>
                        <td>
                          <div className="font-semibold text-white">{m.empName}</div>
                          <div className="text-xs text-slate-400">{m.empId} • {m.deptName}</div>
                        </td>
                        <td className="text-xs text-amber-300 font-medium">{m.targetTLName || 'TL Assigned'}</td>
                        <td className="text-xs text-white font-medium">{m.materialType}</td>
                        <td className="text-xs text-amber-300 font-mono">{m.noOfUnits}</td>
                        <td className="text-xs text-slate-300">{m.forProject}</td>
                        <td>
                          <span className={`badge-tag ${m.requirementType === 'Emergency' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                            {m.requirementType}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${m.status.includes('Provided') ? 'pill-active' : 'pill-pending'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>
                          {m.status === 'Pending Review' ? (
                            <button onClick={() => handleTLApproveRequest(m.id)} className="btn-emerald btn-xs">
                              <Check className="w-3.5 h-3.5 inline mr-1" /> Approve & Forward to Inventory
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Approved by TL ✅</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Requisitions to Inventory Team (TL / Sub-TL -> Inventory) */}
          <div className="glow-card p-5 border-cyan-500/30">
            <h3 className="text-md font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              SECTION 2: Department Stock Status & Inventory Requisitions ({tlToInventoryRequisitions.length})
            </h3>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Requester</th>
                    <th>Material Needed</th>
                    <th>Qty</th>
                    <th>Stock Availability</th>
                    <th>Inventory Status</th>
                    <th>Inventory Handler</th>
                  </tr>
                </thead>
                <tbody>
                  {tlToInventoryRequisitions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-slate-500 italic">No items currently forwarded to Inventory.</td>
                    </tr>
                  ) : (
                    tlToInventoryRequisitions.map(m => (
                      <tr key={m.id}>
                        <td className="font-mono text-cyan-400 text-xs font-semibold">{m.id}</td>
                        <td>
                          <div className="font-semibold text-white">{m.empName}</div>
                          <div className="text-xs text-slate-400">{m.empId} • {m.deptName}</div>
                        </td>
                        <td className="text-xs text-white font-medium">{m.materialType}</td>
                        <td className="text-xs text-amber-300 font-mono">{m.noOfUnits}</td>
                        <td>
                          <span className={`font-semibold text-xs ${m.availableAtMoment === 'Yes' ? 'text-emerald-400' : m.availableAtMoment === 'No' ? 'text-rose-400' : 'text-amber-400'}`}>
                            {m.availableAtMoment || 'In Warehouse Stock Check'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${m.status.includes('Provided') ? 'pill-active' : 'pill-pending'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="text-xs text-slate-400">{m.inventoryHandledBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Single Section for Normal Employees */
        <div className="glow-card p-5">
          <h3 className="text-md font-bold text-slate-200 mb-4">
            My Material Requisitions Sheet ({displayedMaterials.length})
          </h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Assigned TL / Sub-TL</th>
                  <th>Material Needed</th>
                  <th>Quantity</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Inventory Status</th>
                  <th>Updates</th>
                </tr>
              </thead>
              <tbody>
                {displayedMaterials.map(m => (
                  <tr key={m.id}>
                    <td className="font-mono text-cyan-400 text-xs font-semibold">{m.id}</td>
                    <td className="text-xs text-amber-300 font-medium">{m.targetTLName || 'TL Assigned'}</td>
                    <td className="text-xs text-white font-medium">{m.materialType}</td>
                    <td className="text-xs text-amber-300 font-mono">{m.noOfUnits}</td>
                    <td className="text-xs text-slate-300">{m.forProject}</td>
                    <td>
                      <span className={`badge-tag ${m.requirementType === 'Emergency' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                        {m.requirementType}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${m.status.includes('Provided') ? 'pill-active' : 'pill-pending'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400">{m.updates}</td>
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
