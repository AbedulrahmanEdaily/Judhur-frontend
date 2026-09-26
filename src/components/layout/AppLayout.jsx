import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import { MobileTabBar } from './MobileTabBar.jsx';
import { MobileTopBar } from './MobileTopBar.jsx';

/** Page shell: desktop navbar + footer from 1280px up, mobile top bar + tab bar below it. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <MobileTopBar />
      {/* Bottom padding keeps content above the fixed mobile tab bar (89px in Figma). */}
      <main className="flex-1 pb-[89px] xl:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <ScrollRestoration />
    </div>
  );
}
