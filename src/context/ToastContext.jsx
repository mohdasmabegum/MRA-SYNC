import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert, LogIn, LogOut, Navigation } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalPopup, setModalPopup] = useState(null); // High priority alert popups

  const showToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, title };
    setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showModalPopup = ({ title, message, iconType = 'info', onConfirm, confirmText = 'OK', cancelText }) => {
    setModalPopup({ title, message, iconType, onConfirm, confirmText, cancelText });
  };

  const closeModalPopup = () => {
    setModalPopup(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, showModalPopup }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'login' && <LogIn className="w-5 h-5 text-amber-400" />}
              {toast.type === 'logout' && <LogOut className="w-5 h-5 text-slate-300" />}
              {toast.type === 'redirect' && <Navigation className="w-5 h-5 text-cyan-400 animate-pulse" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button onClick={() => removeToast(toast.id)} className="toast-close">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Modal Popup */}
      {modalPopup && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <span className="modal-icon-badge">
                  {modalPopup.iconType === 'login' ? <LogIn className="w-6 h-6 text-amber-400" /> :
                   modalPopup.iconType === 'redirect' ? <Navigation className="w-6 h-6 text-cyan-400" /> :
                   <Info className="w-6 h-6 text-gold-400" />}
                </span>
                <h3>{modalPopup.title}</h3>
              </div>
              <button onClick={closeModalPopup} className="icon-btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <p>{modalPopup.message}</p>
            </div>
            <div className="modal-footer">
              {modalPopup.cancelText && (
                <button onClick={closeModalPopup} className="btn-secondary">
                  {modalPopup.cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  if (modalPopup.onConfirm) modalPopup.onConfirm();
                  closeModalPopup();
                }}
                className="btn-gold"
              >
                {modalPopup.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
