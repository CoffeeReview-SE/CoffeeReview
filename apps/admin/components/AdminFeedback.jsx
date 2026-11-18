import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AdminFeedbackContext = createContext(null);

function FeedbackIcon({ kind }) {
  const paths = {
    success: <path d="m5 12 4 4L19 6" />,
    error: <path d="m7 7 10 10M17 7 7 17" />,
    warning: <path d="M12 8v5m0 3h.01M10.3 3.9 1.8 19a1.2 1.2 0 0 0 1 1.8h18.4a1.2 1.2 0 0 0 1-1.8L13.8 3.9a1.1 1.1 0 0 0-2 0Z" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export function useAdminFeedback() {
  const value = useContext(AdminFeedbackContext);
  if (!value) throw new Error("useAdminFeedback must be used within AdminFeedbackProvider.");
  return value;
}

export function AdminFeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const resolver = useRef(null);
  const toastRef = useRef(null);
  const confirmationRef = useRef(null);

  const notify = useCallback((message, kind = "info", title) => {
    setToast({ message, kind, title });
  }, []);

  const confirm = useCallback(options => new Promise(resolve => {
    if (resolver.current) resolver.current(false);
    resolver.current = resolve;
    setConfirmation(options);
  }), []);

  const closeConfirmation = useCallback(result => {
    resolver.current?.(result);
    resolver.current = null;
    setConfirmation(null);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const dialog = toastRef.current;
    if (toast && dialog && !dialog.open) dialog.show();
    if (!toast && dialog?.open) dialog.close();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [toast]);

  useEffect(() => {
    const dialog = confirmationRef.current;
    if (confirmation && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [confirmation]);

  useEffect(() => () => resolver.current?.(false), []);

  return <>
    <AdminFeedbackContext.Provider value={{ notify, confirm }}>
      {children}
    </AdminFeedbackContext.Provider>
    <div className="admin-feedback" aria-live="polite" aria-relevant="additions text">
      {toast && <dialog ref={toastRef} className={`admin-feedback__toast admin-feedback__toast--${toast.kind}`}
        role={toast.kind === "error" ? "alert" : "status"} onCancel={event => event.preventDefault()}>
        <span className="admin-feedback__icon"><FeedbackIcon kind={toast.kind} /></span>
        <span className="admin-feedback__copy">
          {toast.title && <strong>{toast.title}</strong>}
          <span>{toast.message}</span>
        </span>
        <button type="button" className="admin-feedback__dismiss" aria-label="Đóng thông báo" onClick={() => setToast(null)}>
          <FeedbackIcon kind="close" />
        </button>
      </dialog>}
    </div>
    {confirmation && <dialog ref={confirmationRef} className="admin-confirm" role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-message"
      onCancel={event => { event.preventDefault(); closeConfirmation(false); }}
      onClick={event => { if (event.target === event.currentTarget) closeConfirmation(false); }}>
        <span className={`admin-confirm__icon admin-confirm__icon--${confirmation.tone || "warning"}`}>
          <FeedbackIcon kind={confirmation.tone || "warning"} />
        </span>
        <h2 id="admin-confirm-title">{confirmation.title}</h2>
        <p id="admin-confirm-message">{confirmation.message}</p>
        <footer>
          <button type="button" className="admin-confirm__cancel" onClick={() => closeConfirmation(false)}>
            {confirmation.cancelLabel || "Hủy"}
          </button>
          <button type="button" className={`admin-confirm__accept ${confirmation.tone === "danger" ? "is-danger" : ""}`} autoFocus onClick={() => closeConfirmation(true)}>
            {confirmation.confirmLabel || "Xác nhận"}
          </button>
        </footer>
    </dialog>}
    <style>{`
      .admin-feedback{position:fixed;z-index:3000;top:20px;right:20px;display:grid;gap:10px;width:min(420px,calc(100vw - 32px));pointer-events:none}
      .admin-feedback__toast{position:fixed;top:20px;right:20px;left:auto;bottom:auto;box-sizing:border-box;display:flex;align-items:flex-start;gap:12px;width:min(420px,calc(100vw - 32px));max-width:none;margin:0;padding:14px;border:1px solid #eadfd3;border-radius:14px;background:#fffefa;color:#2a1810;box-shadow:0 16px 42px #24160c26;animation:admin-feedback-enter .2s ease-out;pointer-events:auto}
      .admin-feedback__icon{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:11px;background:#f2eee8;color:#6b3a22}
      .admin-feedback__icon svg,.admin-feedback__dismiss svg,.admin-confirm__icon svg{width:19px;height:19px}
      .admin-feedback__toast--success .admin-feedback__icon,.admin-confirm__icon--success{background:#e5f5e9;color:#287a43}
      .admin-feedback__toast--error .admin-feedback__icon{background:#fde9e7;color:#b42318}
      .admin-feedback__toast--warning .admin-feedback__icon,.admin-confirm__icon--warning{background:#fff0dc;color:#a95a11}
      .admin-feedback__toast--info .admin-feedback__icon,.admin-confirm__icon--info{background:#e9f1fb;color:#315d91}
      .admin-feedback__copy{display:grid;gap:3px;flex:1;padding-top:1px;font-size:13px;line-height:1.5}
      .admin-feedback__copy strong{font-size:14px}
      .admin-feedback__dismiss{display:grid;place-items:center;flex:none;width:28px;height:28px;margin:-4px -4px 0 0;padding:0;border:0;border-radius:7px;background:transparent;color:#85776b;cursor:pointer}
      .admin-feedback__dismiss:hover{background:#f3eee8}
      .admin-confirm{box-sizing:border-box;width:min(440px,calc(100vw - 40px));max-width:440px;margin:auto;padding:24px;border:1px solid #eadfd3;border-radius:18px;background:#fffefa;color:#2a1810;box-shadow:0 24px 70px #170e0870}
      .admin-confirm::backdrop{background:#21150db0;backdrop-filter:blur(3px)}
      .admin-confirm__icon{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:#fff0dc;color:#a95a11}
      .admin-confirm h2{margin:16px 0 8px;font-size:19px}
      .admin-confirm p{margin:0;color:#75665b;font-size:14px;line-height:1.55}
      .admin-confirm footer{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}
      .admin-confirm footer button{min-height:40px;padding:0 15px;border:1px solid #dfd3c7;border-radius:9px;background:#fff;color:#54311d;font:inherit;font-weight:600;cursor:pointer}
      .admin-confirm footer button:focus-visible,.admin-feedback button:focus-visible{outline:3px solid #c18b48;outline-offset:2px}
      .admin-confirm__accept{border-color:#6b3a22!important;background:#6b3a22!important;color:#fff!important}
      .admin-confirm__accept.is-danger{border-color:#b42318!important;background:#b42318!important}
      @keyframes admin-feedback-enter{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:600px){.admin-feedback{top:12px;right:12px}.admin-feedback__toast{top:12px;right:12px}.admin-confirm{padding:20px}}
      @media(prefers-reduced-motion:reduce){.admin-feedback__toast{animation:none}}
    `}</style>
  </>;
}
