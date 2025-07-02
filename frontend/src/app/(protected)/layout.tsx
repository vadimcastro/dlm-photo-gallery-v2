// app/(protected)/layout.tsx
import { AuthWrapper } from '../../lib/auth/AuthWrapper';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthWrapper>{children}</AuthWrapper>;
}