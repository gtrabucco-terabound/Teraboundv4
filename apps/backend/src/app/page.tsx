import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" />
          <span className="text-xs font-medium text-brand-400 tracking-wider uppercase">Control Plane Active</span>
        </div>

        <h1 className="font-display text-5xl font-bold text-surface-100 mb-3 tracking-tight">
          TERABOUND<span className="text-brand-400">®</span>
        </h1>
        <p className="text-surface-400 text-lg mb-8">
          Backend Admin — ERP Modular Multi-tenant
        </p>

        <Link href="/admin" className="btn-primary text-base px-8 py-3">
          Acceder al Panel de Control
        </Link>
      </div>
    </div>
  );
}
