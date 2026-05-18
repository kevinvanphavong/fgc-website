import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fgc-public">
      <div className="bg-ambient" aria-hidden="true" />
      <Header />
      <main className="relative z-[1]">{children}</main>
      <Footer />
    </div>
  );
}
