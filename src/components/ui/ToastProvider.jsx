import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from './Toast.jsx';
import { ToastContext } from './toastContext.js';

const DEFAULT_DURATION = 5000;
const ACTION_DURATION = 8000;

/** Holds the toast queue (UI-only, may contain callbacks — so not in Redux) and renders it. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(
    /** @type {(import('./toastContext.js').ToastOptions & { id: number })[]} */ ([]),
  );
  const nextId = useRef(1);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (options) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...options, id }]);
      const duration = options.duration ?? (options.action ? ACTION_DURATION : DEFAULT_DURATION);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:end-6 sm:bottom-6 sm:w-[420px]"
      >
        {toasts.map(({ id, tone, message, action }) => (
          <Toast
            key={id}
            tone={tone}
            message={message}
            className="pointer-events-auto"
            action={
              action && {
                label: action.label,
                onClick: () => {
                  action.onClick();
                  dismiss(id);
                },
              }
            }
            onClose={() => dismiss(id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
