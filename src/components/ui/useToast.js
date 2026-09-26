import { useContext } from 'react';
import { ToastContext } from './toastContext.js';

/** @returns {import('./toastContext.js').ToastApi} */
export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}
