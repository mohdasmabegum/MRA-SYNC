import React, { useState, useEffect } from 'react';
import { getMaterials, addMaterialRequest, updateMaterialStatus, getUsers } from '../services/db';
import { useToast } from '../context/ToastContext';
import { Boxes, PlusCircle, ShoppingCart, CheckCircle, Clock, AlertTriangle, UserCheck, ShieldAlert, Building } from 'lucide-react';

export const InventoryPortal = ({ activeUser, selectedDept }) => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const isTLOrSubTL = activeUser?.role === 'TL' || activeUser?.role === 'SUB_TL' || activeUser?.role === 'CEO/FOUNDER/DIRECTOR' || activeUser?.dept === 'Inventory & Logistics';

  // Find Team Leads / Sub-TLs for material request target selection
  const tlUsers = usersList.filter(u => u.role === 'TL' || u.role === 'SUB_TL' || u.role === 'CEO/FOUNDER/DIRECTOR');

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
      showToast('Please select your assigned Team Lead / Sub-TL.', 'error', 'Target TL Required');
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

  // Inventory User Actions
  const handleAcceptRequest = (id, available) => {
    const now = new Date().toLocaleString();
    if (available === 'Yes') {
      updateMaterialStatus(id, {
        availableAtMoment: 'Yes',
        status: 'Provided / Handover',
        inventoryHandledBy: `${activeUser?.name} (${activeUser?.id})`,
        acceptedDate: now,
        providedDate: now,
        noOfDaysForProvidingMaterial: 'Immediate Handover',
        updates: 'Material available in stock. Handed over.'
      });
      showToast(`Material request ${id} accepted & provided from stock!`, 'success');
    } else {
      updateMaterialStatus(id, {
        availableAtMoment: 'No',
        status: 'Pending for Order (To-Do)',
        inventoryHandledBy: `${activeUser?.name} (${activeUser?.id})`,
        acceptedDate: now,
        updates: 'Item NOT in stock. Added to Inventory Pending Order reminder list.'
      });
      showToast(`Material ${id} marked NOT AVAILABLE. Added to Inventory Pending Order reminder list!`, 'warning');
    }
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

  const handleOrderReceived = (id) => {
    const now = new Date().toLocaleString();
    updateMaterialStatus(id, {
      status: 'Provided / Handover',
      orderReceivedDate: now,
      providedDate: now,
      updates: 'Supplier order received & handed over.'
    });
    showToast(`Material for request ${id} received & handed over!`, 'success');
  };

  // Department-Wise Filtering (Requirement #9)
  const isDeptFiltered = selectedDept && selectedDept !== 'ALL DEPARTMENTS';
  const displayedMaterials = materials.filter(m => {
    if (!isDeptFiltered) return true;
    return m.deptName === selectedDept;
  });

  const todoOrderList = displayedMaterials.filter(m => m.status === 'Pending for Order (To-Do)');

  return (
    <div className="portal-page-container">
      {/* Header Bar */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title">
            <Boxes className="w-6 h-6 text-cyan-400 inline mr-2" />
            Material Request & Inventory Portal ({selectedDept})
          </h2>
          <p className="portal-subtitle">Requisitions are forwarded to assigned TL/Sub-TL and processed by Inventory control.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-5 h-5 mr-1" />
          <span>{showForm ? 'Cancel Request' : 'Requisition Material'}</span>
        </button>
      </div>

      {/* Form Drawer */}
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
              <label>Target TL / Sub-TL <span className="text-rose-400">*</span></label>
              <select
                value={formData.targetTLId}
                onChange={e => handleTLSelect(e.target.value)}
                required
              >
                <option value="">Select Assigned TL / Sub-TL...</option>
                {tlUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role} - {u.dept})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group md:col-span-2">
              <label>Type of Material Needed <span className="text-rose-400">*</span></label>
              <input type="text" placeholder="e.g. STM32 MCU Dev Boards / Cat6 Cable" value={formData.materialType} onChange={e => setFormData({ ...formData, materialType: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Quantity / Length</label>
              <input type="text" placeholder="e.g. 10 Units / 50 Meters" value={formData.noOfUnits} onChange={e => setFormData({ ...formData, noOfUnits: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Project Name <span className="text-rose-400">*</span></label>
              <input type="text" placeholder="e.g. Apollo Satellite Gateway" value={formData.forProject} onChange={e => setFormData({ ...formData, forProject: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Requirement Priority</label>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-amber-300">
                Inventory To-Do List: Items Pending for Order ({selectedDept}) ({todoOrderList.length})
              </h4>
            </div>
          </div>

          <div className="space-y-2">
            {todoOrderList.map(item => (
              <div key={item.id} className="bg-slate-900/80 p-3 rounded border border-amber-500/30 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-amber-400 mr-2">{item.id}</span>
                  <span className="text-white font-medium">{item.materialType} ({item.noOfUnits})</span>
                  <span className="text-slate-400 ml-2">For: {item.forProject} (TL: {item.targetTLName})</span>
                </div>
                {isTLOrSubTL && (
                  <button onClick={() => handlePlaceOrder(item.id)} className="btn-gold btn-xs">
                    <ShoppingCart className="w-3 h-3 mr-1" /> Place Order Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department-Wise Material Requests Sheet */}
      <div className="glow-card p-5">
        <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Department Material Requisitions Sheet — {selectedDept} ({displayedMaterials.length})</span>
          {isDeptFiltered && <span className="text-xs text-amber-400 font-mono">Filtered by: {selectedDept}</span>}
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Requester</th>
                <th>Assigned TL/Sub-TL</th>
                <th>Material Needed</th>
                <th>Qty</th>
                <th>Project</th>
                <th>Stock Available?</th>
                <th>Status</th>
                <th>Inventory Handler</th>
                {isTLOrSubTL && <th>TL / Inventory Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayedMaterials.map(m => (
                <tr key={m.id}>
                  <td className="font-mono text-cyan-400 text-xs font-semibold">{m.id}</td>
                  <td>
                    <div className="font-semibold text-white">{m.empName}</div>
                    <div className="text-xs text-slate-400">{m.empId} • {m.deptName}</div>
                  </td>
                  <td className="text-xs text-amber-300 font-medium">
                    {m.targetTLName || 'TL Assigned'}
                  </td>
                  <td className="text-xs text-white font-medium">{m.materialType}</td>
                  <td className="text-xs text-amber-300 font-mono">{m.noOfUnits}</td>
                  <td className="text-xs text-slate-300">{m.forProject}</td>
                  <td>
                    <span className={`font-semibold text-xs ${m.availableAtMoment === 'Yes' ? 'text-emerald-400' : m.availableAtMoment === 'No' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {m.availableAtMoment}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      m.status.includes('Provided') ? 'pill-active' :
                      m.status.includes('Order Placed') ? 'pill-pending' : 'pill-leave'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="text-xs text-slate-400">{m.inventoryHandledBy}</td>
                  {isTLOrSubTL && (
                    <td>
                      <div className="flex items-center gap-1">
                        {m.status === 'Pending Review' && (
                          <>
                            <button onClick={() => handleAcceptRequest(m.id, 'Yes')} className="btn-emerald btn-xs">
                              Available (Handover)
                            </button>
                            <button onClick={() => handleAcceptRequest(m.id, 'No')} className="btn-amber btn-xs">
                              Not Available
                            </button>
                          </>
                        )}

                        {m.status === 'Pending for Order (To-Do)' && (
                          <button onClick={() => handlePlaceOrder(m.id)} className="btn-gold btn-xs">
                            Place Order
                          </button>
                        )}

                        {m.status === 'Order Placed' && (
                          <button onClick={() => handleOrderReceived(m.id)} className="btn-emerald btn-xs">
                            Order Received ✅
                          </button>
                        )}

                        {m.status.includes('Provided') && (
                          <span className="text-xs text-emerald-400 font-medium">Handover Done ✅</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
