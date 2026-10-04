import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, ScrollRestoration, useLocation, useMatches, useNavigate } from 'react-router';
import clsx from 'clsx';
import { selectIsAdmin, sessionEnded } from '../../features/auth/authSlice.js';
import { AdminBanner } from './AdminBanner.jsx';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import { MobileTabBar } from './MobileTabBar.jsx';
import { MobileTopBar } from './MobileTopBar.jsx';

/**
 * Page shell: desktop navbar + footer from 1280px up, mobile top bar + tab bar below it.
 * A route can drop the mobile bars with `handle: { hideMobileTopBar, hideMobileTabBar }` when
 * its Figma mobile frame has its own. Admins get the «شريط الإدارة» strip (80:754) on top.
 * It also finishes a logout: useLogout goes home first, and the session ends here once the
 * home page is on screen (ending it earlier would send a signed-in-only page to login).
 */
export function AppLayout() {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle ?? {};
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const shouldEndSession = location.state?.endSession === true;
  useEffect(() => {
    if (!shouldEndSession) return;
    dispatch(sessionEnded('logout'));
    // Drop the marker, so going back to this entry later doesn't log out again.
    navigate('.', { replace: true, state: null });
  }, [shouldEndSession, dispatch, navigate]);

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
