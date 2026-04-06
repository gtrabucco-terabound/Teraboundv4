'use client';

import { useAuth } from '@terabound/auth';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  ChevronRight, 
  Loader2, 
  LogOut, 
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import type { HubContext } from '@terabound/domain';

export default function HubRoot() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [context, setContext] = useState<HubContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock de resolución de contexto (se conectará al Use Case real via Server Action)
  useEffect(() => {
    if (user && !authLoading) {
      setTimeout(() => {
         // Simulación de carga de contexto
         setLoading(false);
      }, 1500);
    } else if (!authLoading && !user) {
      // Redirigir a login si no hay sesión
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-950">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>
            <Shield className="w-16 h-16 text-brand-500 relative z-10 animate-bounce" />
          </div>
          <h2 className="text-2xl font-display font-bold text-surface-50 animate-fade-in uppercase tracking-[0.2em]">Terabound Hub</h2>
          <p className="text-surface-500 text-sm mt-4 font-mono animate-pulse uppercase tracking-wider">Sincronizando contexto de seguridad...</p>
          <Loader2 className="w-5 h-5 text-brand-400 animate-spin mt-8" />
       </div>
     );
  }

  return (
    <div className="min-h-screen flex flex-col pt-12 p-6 max-w-6xl mx-auto space-y-12 animate-slide-up">
      
      {/* Header Premium */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/5">
             <Shield className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-surface-50">TERABOUND <span className="text-brand-500">HUB</span></h1>
            <p className="text-xs text-surface-500 font-bold uppercase tracking-widest mt-1">Gateway de Acceso Unificado</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-surface-100">{user?.displayName || 'Usuario'}</p>
            <p className="text-[10px] text-surface-500 font-mono">{user?.email}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="p-3 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Information & Profile */}
        <div className="lg:col-span-5 space-y-8">
           <div className="card p-8 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-surface-800 to-surface-700 border-2 border-surface-700 flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-2xl font-black text-surface-400 tracking-tighter">TB</div>}
                 </div>
                 <div>
                    <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest">Global Account</span>
                    <h2 className="text-lg font-bold text-surface-100 mt-1">{user?.displayName}</h2>
                 </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800/80">
                 <p className="text-xs text-surface-500 leading-relaxed italic">
                   "Bienvenido al corazón operativo de Terabound. Aquí puedes gestionar tu identidad y alternar entre tus diferentes espacios de trabajo con aislamiento total de datos."
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-surface-500 px-1 tracking-widest">Accesos Rápidos</h3>
              <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-sm font-bold text-surface-200">
                    <LayoutGrid className="w-6 h-6 text-brand-500" />
                    Dashboard
                 </button>
                 <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-sm font-bold text-surface-200">
                    <Shield className="w-6 h-6 text-brand-500" />
                    Seguridad
                 </button>
              </div>
           </div>
        </div>

        {/* Right Side: Tenant Selector (The Core) */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
             <h2 className="text-sm font-black uppercase text-surface-400 tracking-widest flex items-center gap-2">
               <Building2 className="w-4 h-4 text-brand-500" />
               Tus Empresas (Tenants)
             </h2>
             <span className="text-[10px] font-mono text-surface-600 uppercase tracking-widest">Aislamiento Activo</span>
           </div>

           <div className="space-y-4">
              {/* Aquí se iterarán las Membresías reales del usuario */}
              <div className="card group hover:border-brand-500/40 p-1 cursor-pointer transition-all">
                 <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-surface-950 border border-surface-800 flex items-center justify-center group-hover:border-brand-500/30 transition-colors">
                          <Building2 className="w-7 h-7 text-surface-600 group-hover:text-brand-500 transition-colors" />
                       </div>
                       <div>
                          <h4 className="text-lg font-bold text-surface-100 uppercase tracking-tight">Power Oil SA</h4>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-brand-500/20">ADMIN_ROLE</span>
                             <span className="text-[10px] text-surface-600 font-mono uppercase">ID: power-oil-504</span>
                          </div>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-all">
                       <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                 </div>
              </div>

              {/* Placeholder para cuando no hay tenants */}
              <div className="bg-surface-900/30 border-2 border-dashed border-surface-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-surface-600" />
                 </div>
                 <div className="max-w-xs">
                    <p className="text-sm font-bold text-surface-300">¿No ves tu empresa?</p>
                    <p className="text-xs text-surface-600 mt-2">Contacta a tu administrador para que te asigne una membresía de plataforma.</p>
                 </div>
              </div>
           </div>
        </div>
        
      </main>

      <footer className="pt-12 pb-6 border-t border-surface-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-surface-700 uppercase tracking-widest">
         <div>&copy; 2026 TERABOUND ENTERPRISE RESOURCE PLANNING</div>
         <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand-500 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Seguridad</a>
            <a href="#" className="hover:text-brand-500 transition-colors">v0.1.0-alpha</a>
         </div>
      </footer>

    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}
