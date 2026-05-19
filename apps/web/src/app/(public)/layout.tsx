import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/sections/legal/CookieBanner';
import ClientProviders from '@/components/client/ClientProviders';
import { getCurrentClient } from '@/lib/client-auth';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentClient();

  return (
    <ClientProviders>
      <div className="fgc-public">
        <div className="bg-ambient" aria-hidden="true" />
        <Header initialUser={user} />
        <main id="main" className="relative z-[1]">{children}</main>
        <Footer />
        <CookieBanner />
      </div>
    </ClientProviders>
  );
}
