import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { JsonLdOrganization } from './JsonLd';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLdOrganization />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { fontFamily: 'Sora, sans-serif' },
          duration: 4000,
        }}
      />
    </div>
  );
}
