export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root flex min-h-screen items-center justify-center px-4">
      {children}
    </div>
  );
}
