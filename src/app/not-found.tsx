// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b10]">
      <div className="text-center">
        <div className="text-6xl font-display font-black text-[#1f2d45] mb-4">404</div>
        <div className="text-xl font-bold text-white mb-2">Page not found</div>
        <p className="text-slate-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <a href="/dashboard" className="pes-btn-primary inline-block">← Back to Dashboard</a>
      </div>
    </div>
  );
}
