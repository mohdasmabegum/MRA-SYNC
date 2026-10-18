import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, LogOut, X, Sparkles, Calendar } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

/* ── icon color map using CSS variables ────────────────── */
const ICON_COLORS = {
  success:  'var(--emerald)',
  error:    'var(--rose)',
  warning:  'var(--amber)',
  login:    'var(--amber)',
  info:     'var(--blue)',
  redirect: 'var(--cyan)',
  logout:   'var(--text-3)',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);

  const showToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showModalPopup = (config) => {
    setModalConfig(config);
  };

  const closeModalPopup = () => {
    setModalConfig(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, showModalPopup, closeModalPopup }}>
      {children}

      {/* Toast Stack */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon" style={{ color: ICON_COLORS[toast.type] || 'var(--blue)' }}>
              {toast.type === 'success'  && <CheckCircle  className="w-5 h-5" />}
              {toast.type === 'error'    && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'warning'  && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'login'    && <Sparkles      className="w-5 h-5" />}
              {toast.type === 'info'     && <Info          className="w-5 h-5" />}
              {toast.type === 'redirect' && <Calendar      className="w-5 h-5" />}
              {toast.type === 'logout'   && <LogOut        className="w-5 h-5" />}
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

      {/* Modal Popup Wrapper */}
      {modalConfig && (
        <div className="modal-backdrop">
          <div className="modal-content glow-card max-w-lg">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                {modalConfig.iconType === 'login'   && <Sparkles className="w-6 h-6" style={{ color: 'var(--amber)' }} />}
                {modalConfig.iconType === 'logout'  && <LogOut   className="w-6 h-6" style={{ color: 'var(--rose)'  }} />}
                {modalConfig.iconType === 'info'    && <Info     className="w-6 h-6" style={{ color: 'var(--cyan)'  }} />}
                {modalConfig.iconType === 'meeting' && <Calendar className="w-6 h-6" style={{ color: 'var(--amber)' }} />}
                <h3>{modalConfig.title}</h3>
              </div>
              <button onClick={closeModalPopup} className="icon-btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              {typeof modalConfig.message === 'string' ? (
                <p className="whitespace-pre-line text-sm leading-relaxed">{modalConfig.message}</p>
              ) : (
                modalConfig.message
              )}
            </div>

            <div className="modal-footer">
              {modalConfig.cancelText && (
                <button onClick={closeModalPopup} className="btn-secondary">
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  closeModalPopup();
                }}
                className="btn-gold"
              >
                {modalConfig.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
