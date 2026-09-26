import { createContext } from 'react';

/**
 * @typedef {{
 *   tone?: import('./Toast.jsx').ToastTone,
 *   message: string,
 *   action?: { label: string, onClick: () => void },
 *   duration?: number,
 * }} ToastOptions
 *
 * @typedef {{ show: (options: ToastOptions) => void, dismiss: (id: number) => void }} ToastApi
 */

export const ToastContext = createContext(/** @type {ToastApi | null} */ (null));
