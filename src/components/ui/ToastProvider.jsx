import { useEffect, useRef, useState } from 'react';
import { Toast } from './Toast.jsx';
import { ToastContext } from './toastContext.js';

const DEFAULT_DURATION_MS = 5000;
const DURATION_WITH_ACTION_MS = 8000;

/** Keeps the list of visible toasts and renders them. They can hold callbacks, so not in Redux. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);
  const timers = useRef(new Map());

  function dismiss(id) {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function show(options) {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((current) => [...current, { ...options, id }]);

    let duration = DEFAULT_DURATION_MS;
    if (options.action) duration = DURATION_WITH_ACTION_MS;
    if (options.duration) duration = options.duration;
    timers.current.set(
      id,
      setTimeout(() => dismiss(id), duration),
    );
  }

  // Clear pending timers when the app unmounts.
  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:end-6 sm:bottom-6 sm:w-[420px]"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            tone={toast.tone}
            message={toast.message}
            className="pointer-events-auto"
            action={
              toast.action && {
                label: toast.action.label,
                onClick: () => {
                  toast.action.onClick();
                  dismiss(toast.id);
                },
              }
            }
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
