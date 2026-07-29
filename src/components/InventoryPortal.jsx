import React, { useState, useEffect } from 'react';
import { getMaterials, addMaterialRequest, updateMaterialStatus } from '../services/db';
import { useToast } from '../context/ToastContext';
import { Boxes, PlusCircle, ShoppingCart, CheckCircle, Clock, AlertTriangle, AlertCircle, RefreshCw, PackageCheck, Send } from 'lucide-react';

export const InventoryPortal = ({ activeUser }) => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    empName: activeUser?.name || '',
    empId: activeUser?.id || '',
    deptName: activeUser?.dept || 'Hardware & Embedded Systems',
    materialType: '',
    noOfUnits: '1 Unit',
    requirementType: 'Quick', // Emergency / Quick / General
    forProject: ''
  });

  useEffect(() => {
    loadMaterials();
    window.addEventListener('mra_db_updated', loadMaterials);
    return () => window.removeEventListener('mra_db_updated', loadMaterials);
  }, []);

  const loadMaterials = () => {
    setMaterials(getMaterials());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.materialType || !formData.forProject) {
      showToast('Please enter material type and project name.', 'error');
      return;
    }

    addMaterialRequest(formData);
    showToast('Material request sent to Inventory Dashboard!', 'success', 'Request Created');
    setShowForm(false);
    setFormData({
      empName: activeUser?.name || '',
      empId: activeUser?.id || '',
      deptName: activeUser?.dept || 'Hardware & Embedded Systems',
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
        updates: 'Material available in warehouse. Handed over to requester.'
      });
      showToast(`Material request ${id} accepted & provided from local stock!`, 'success');
    } else {
      // Not Available -> Place Order workflow & Add to Pending Order To-Do list
      updateMaterialStatus(id, {
        availableAtMoment: 'No',
        status: 'Pending for Order (To-Do)',
        inventoryHandledBy: `${activeUser?.name} (${activeUser?.id})`,
        acceptedDate: now,
        updates: 'Item NOT in stock. Added to Inventory Pending Order To-Do reminder list.'
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
    showToast(`Order placed for request ${id}. Status updated to Order Placed.`, 'info');
  };

  const handleOrderReceived = (id) => {
    const now = new Date().toLocaleString();
    updateMaterialStatus(id, {
      status: 'Provided / Handover',
      orderReceivedDate: now,
      providedDate: now,
      updates: 'Supplier order received & material handed over to requester.'
    });
    showToast(`Material for request ${id} received & handed over to employee!`, 'success');
  };

  // Pending for Order To-Do List Filter
  const todoOrderList = materials.filter(m => m.status === 'Pending for Order (To-Do)');

  return (
    <div className="portal-page-container">
      {/* Header Bar */}
      <div className="portal-header-bar glow-card">
        <div>
          <h2 className="portal-title">
            <Boxes className="w-6 h-6 text-cyan-400 inline mr-2" />
            Material Request & Inventory Dashboard
          </h2>
          <p className="portal-subtitle">Manage material requisitions, stock availability, purchase ordering, and handover logging.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <PlusCircle className="w-5 h-5 mr-1" />
          <span>{showForm ? 'Cancel Request' : 'Request Material'}</span>
        </button>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glow-card form-card p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
            📦 New Material Request Form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Requester Name</label>
              <input type="text" value={formData.empName} onChange={e => setFormData({ ...formData, empName: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>User ID</label>
              <input type="text" value={formData.empId} onChange={e => setFormData({ ...formData, empId: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" value={formData.deptName} onChange={e => setFormData({ ...formData, deptName: e.target.value })} required />
            </div>

            <div className="form-group md:col-span-2">
              <label>Type of Material Needed</label>
              <input type="text" placeholder="e.g. Raspberry Pi 4 B+ / Cat6 Ethernet Cable" value={formData.materialType} onChange={e => setFormData({ ...formData, materialType: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Quantity / Length</label>
              <input type="text" placeholder="e.g. 10 Units / 100 Meters" value={formData.noOfUnits} onChange={e => setFormData({ ...formData, noOfUnits: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Project Name</label>
              <input type="text" placeholder="e.g. Apollo Telemetry System" value={formData.forProject} onChange={e => setFormData({ ...formData, forProject: e.target.value })} required />
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
            <button type="submit" className="btn-gold">Send Request to Inventory</button>
          </div>
        </form>
      )}

      {/* Inventory Reminder To-Do List (Pending Orders Alert) */}
      {todoOrderList.length > 0 && (
        <div className="alert-card alert-warning mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-amber-300">
                Inventory To-Do List: Items Pending for Order ({todoOrderList.length})
              </h4>
            </div>
            <span className="text-xs text-amber-400/80 italic">Action Required by Inventory Team</span>
          </div>

          <div className="space-y-2">
            {todoOrderList.map(item => (
              <div key={item.id} className="bg-slate-900/80 p-3 rounded border border-amber-500/30 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-amber-400 mr-2">{item.id}</span>
                  <span className="text-white font-medium">{item.materialType} ({item.noOfUnits})</span>
                  <span className="text-slate-400 ml-2">For: {item.forProject} ({item.empName})</span>
                </div>
                <button onClick={() => handlePlaceOrder(item.id)} className="btn-gold btn-xs">
                  <ShoppingCart className="w-3 h-3 mr-1" /> Place Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material Requests Master Table */}
      <div className="glow-card p-5">
        <h3 className="text-md font-bold text-slate-200 mb-4">
          Inventory Material Requests Log Sheet ({materials.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Requester & Dept</th>
                <th>Material Needed</th>
                <th>Quantity</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Stock Available?</th>
                <th>Status</th>
                <th>Inventory Handled By</th>
                <th>Inventory Action Workflow</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.id}>
                  <td className="font-mono text-cyan-400 text-xs font-semibold">{m.id}</td>
                  <td>
                    <div className="font-semibold text-white">{m.empName}</div>
                    <div className="text-xs text-slate-400">{m.empId} • {m.deptName}</div>
                  </td>
                  <td className="text-xs text-white font-medium">{m.materialType}</td>
                  <td className="text-xs text-amber-300 font-mono">{m.noOfUnits}</td>
                  <td className="text-xs text-slate-300">{m.forProject}</td>
                  <td>
                    <span className={`badge-tag ${m.requirementType === 'Emergency' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                      {m.requirementType}
                    </span>
                  </td>
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
                  <td>
                    <div className="flex items-center gap-1">
                      {m.status === 'Pending Review' && (
                        <>
                          <button onClick={() => handleAcceptRequest(m.id, 'Yes')} className="btn-emerald btn-xs" title="Accept & Provide from stock">
                            Available (Handover)
                          </button>
                          <button onClick={() => handleAcceptRequest(m.id, 'No')} className="btn-amber btn-xs" title="Not available -> Add to Order To-Do list">
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
                        <span className="text-xs text-emerald-400 font-medium">Completed ✅</span>
                      )}
                    </div>
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
