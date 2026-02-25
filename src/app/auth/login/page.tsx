// src/app/auth/login/page.tsx
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — DGCC Enterprise System',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <LoginForm />
    </div>
  );
}
