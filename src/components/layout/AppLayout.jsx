import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-10">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
