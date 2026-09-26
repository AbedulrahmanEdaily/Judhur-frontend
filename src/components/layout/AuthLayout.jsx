import { Outlet } from 'react-router';
import { LogoLockup } from './LogoLockup.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

/** Centered card for the login / register / password screens. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center justify-between px-4 py-3.5 lg:px-10">
        <LogoLockup />
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-12 sm:items-center">
        <div className="w-full max-w-md rounded-xl border border-border bg-raised p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
