import { useSelector } from 'react-redux';
import { Outlet, ScrollRestoration, useMatches } from 'react-router';
import clsx from 'clsx';
import { selectIsAdmin } from '../../features/auth/authSlice.js';
import { AdminBanner } from './AdminBanner.jsx';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import { MobileTabBar } from './MobileTabBar.jsx';
import { MobileTopBar } from './MobileTopBar.jsx';

/**
 * Page shell: desktop navbar + footer from 1280px up, mobile top bar + tab bar below it.
 * A route can drop the mobile bars with `handle: { hideMobileTopBar, hideMobileTabBar }` when
 * its Figma mobile frame has its own. Admins get the «شريط الإدارة» strip (80:754) on top.
 */
export function AppLayout() {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle ?? {};
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <div className="flex min-h-dvh flex-col">
      {isAdmin && <AdminBanner />}
      <Header />
      {!handle.hideMobileTopBar && <MobileTopBar />}
      {/* Bottom padding keeps content above the fixed mobile tab bar (89px in Figma). */}
      <main className={clsx('flex-1 xl:pb-0', !handle.hideMobileTabBar && 'pb-[89px]')}>
        <Outlet />
      </main>
      <Footer />
      {!handle.hideMobileTabBar && <MobileTabBar />}
      <ScrollRestoration />
    </div>
  );
}
