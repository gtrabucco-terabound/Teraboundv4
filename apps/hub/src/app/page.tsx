'use client';

import { useAuth } from '@terabound/auth';
import { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Loader2,
  LogOut,
  LayoutGrid,
  ArrowRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  ExternalLink,
  Plus as PlusIcon
} from 'lucide-react';
import type { HubContext } from '@terabound/domain';
import { resolveHubContextAction, selectTenantAction, clearTenantAction } from './actions';

export default function HubRoot() {
  const { user, logout, loading: authLoading } = useAuth();
  const [context, setContext] = useState<HubContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = '/login';
      return;
    }

    async function fetchContext() {
      try {
        const response = await resolveHubContextAction(user!.uid);
        if (response.success && response.context) {
          setContext(response.context);
        } else {
          setError(response.error || 'Error al resolver el contexto.');
        }
      } catch (err: any) {
        setError('Error de red al contactar con el motor de contexto.');
      } finally {
        setLoading(false);
      }
    }

    fetchContext();
  }, [user, authLoading]);

  const handleSelectTenant = async (tenantId: string) => {
    setSelecting(tenantId);
    try {
      await selectTenantAction(tenantId);
      const response = await resolveHubContextAction(user!.uid, tenantId);
      if (response.success) {
        setContext(response.context!);
      }
    } catch (err) {
      setError('No se pudo establecer la sesión del tenant.');
    } finally {
      setSelecting(null);
    }
  };

  const handleBackToTenants = async () => {
    setLoading(true);
    try {
      await clearTenantAction();
      const response = await resolveHubContextAction(user!.uid);
      if (response.success) {
        setContext(response.context!);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearTenantAction();
    await logout();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-950 text-surface-50">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>
          <Shield className="w-16 h-16 text-brand-500 relative z-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-display font-bold text-surface-50 animate-fade-in uppercase tracking-[0.2em]">
          Terabound Hub
        </h2>
        <p className="text-surface-500 text-sm mt-4 font-mono animate-pulse uppercase tracking-wider">
          Sincronizando contexto de seguridad...
        </p>
        <Loader2 className="w-5 h-5 text-brand-400 animate-spin mt-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-950">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-surface-50">Acceso Denegado</h2>
        <p className="text-red-400 text-sm mt-2">{error}</p>
        <button onClick={() => handleLogout()} className="mt-8 btn-primary">
          Volver al Login
        </button>
      </div>
    );
  }

  const isTenantSelected = !!context?.tenant;

  return (
    <div className="min-h-screen flex flex-col pt-8 p-6 max-w-7xl mx-auto space-y-10 animate-slide-up">
      <header className="flex items-center justify-between bg-surface-900/50 p-4 rounded-3xl border border-surface-800 backdrop-blur-md sticky top-4 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h1 className="text-lg font-display font-black text-surface-50 tracking-tight">
              TERABOUND <span className="text-brand-500">HUB</span>
            </h1>
            {context?.tenant && (
              <div className="flex items-center gap-2 text-[9px] text-surface-500 font-bold uppercase tracking-widest mt-0.5">
                <Building2 className="w-2.5 h-2.5 text-brand-500" />
                {context.tenant.legalName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isTenantSelected && (
            <button
              onClick={handleBackToTenants}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-950 border border-surface-800 text-[10px] font-black text-surface-400 hover:text-surface-100 hover:border-surface-600 transition-all uppercase tracking-widest"
            >
              <ChevronLeft className="w-3 h-3" /> Cambiar Empresa
            </button>
          )}

          <div className="h-8 w-px bg-surface-800 mx-2 hidden sm:block"></div>

          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-surface-100">{context?.user.displayName || 'Usuario'}</p>
            <p className="text-[9px] text-surface-500 font-mono">{context?.user.email}</p>
          </div>
          <button
            onClick={() => handleLogout()}
            className="w-10 h-10 rounded-xl bg-surface-950 border border-surface-800 text-surface-400 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <aside className="lg:col-span-3 space-y-6">
          <div className="card p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-surface-800 to-surface-700 border-2 border-surface-700 flex items-center justify-center overflow-hidden shadow-xl">
                {context?.user.photoURL ? (
                  <img src={context.user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl font-black text-surface-400">TB</div>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-surface-100">{context?.user.displayName}</h2>
                <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[9px] font-black uppercase tracking-widest border border-brand-500/10">
                  Cuenta Global
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 text-xs font-bold text-surface-400 hover:text-surface-100 transition-all">
                <LayoutGrid className="w-4 h-4 text-brand-500" /> Dashboard
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 text-xs font-bold text-surface-400 hover:text-surface-100 transition-all">
                <Settings className="w-4 h-4 text-surface-600" /> Mi Perfil
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 text-xs font-bold text-surface-400 hover:text-surface-100 transition-all">
                <HelpCircle className="w-4 h-4 text-surface-600" /> Soporte
              </button>
            </div>
          </div>

          {!isTenantSelected && (
            <div className="p-5 rounded-3xl bg-brand-500/5 border border-brand-500/10 space-y-3">
              <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Tip del HUB</h4>
              <p className="text-[11px] text-surface-500 leading-relaxed italic">
                "Selecciona la empresa con la que deseas operar hoy. El sistema aislará automáticamente tus datos y configuraciones."
              </p>
            </div>
          )}
        </aside>

        <div className="lg:col-span-9 space-y-8">
          {!isTenantSelected ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black uppercase text-surface-400 tracking-widest flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-500" />
                  Seleccionar Espacio de Trabajo
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {context?.availableTenants && context.availableTenants.length > 0 ? (
                  context.availableTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      onClick={() => !selecting && handleSelectTenant(tenant.id)}
                      className={`card group hover:border-brand-500/40 cursor-pointer transition-all ${selecting === tenant.id ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-surface-950 border border-surface-800 flex items-center justify-center group-hover:border-brand-500/30 transition-colors">
                            <Building2
                              className={`w-6 h-6 transition-colors ${selecting === tenant.id ? 'text-brand-500' : 'text-surface-600 group-hover:text-brand-500'
                                }`}
                            />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-surface-100 uppercase tracking-tight">{tenant.legalName}</h4>
                            <span className="text-[9px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-brand-500/20">
                              {tenant.roleName}
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-surface-950 border border-surface-800 flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-all text-surface-600 group-hover:text-white">
                          {selecting === tenant.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                          ) : (
                            <ArrowRight className="w-4 h-4 transition-all transform group-hover:translate-x-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-surface-900/30 border-2 border-dashed border-surface-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <PlusIcon className="w-12 h-12 text-surface-800" />
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-surface-300">Sin empresas asignadas</p>
                      <p className="text-xs text-surface-600 mt-2">
                        Contacta a soporte para que te asigne una membresía en una organización activa.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h2 className="text-xs font-black uppercase text-brand-400 tracking-[0.2em] flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Aplicaciones Disponibles
                  </h2>
                  <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest italic">
                    Hub Launcher v1.0 — {context?.tenant?.legalName ?? 'Tenant'}
                  </p>
                </div>

                <button
                  onClick={handleBackToTenants}
                  className="sm:hidden p-2 rounded-lg bg-surface-900 border border-surface-800 text-surface-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {context?.modules && context.modules.length > 0 ? (
                  context.modules.map((module: any) => (
                    <div
                      key={module.moduleId}
                      onClick={() => (window.location.href = `/${module.slug}`)}
                      className="group relative cursor-pointer"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-orange-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>

                      <div className="relative flex flex-col items-center justify-center p-8 bg-surface-900 border border-surface-800 rounded-3xl group-hover:border-brand-500/50 group-hover:bg-surface-800/50 transition-all aspect-square">
                        <div className="w-16 h-16 rounded-2xl bg-surface-950 border border-surface-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-brand-500/30 transition-all shadow-lg">
                          <LayoutGrid className="w-8 h-8 text-surface-500 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <h4 className="text-sm font-black text-surface-100 uppercase tracking-tight text-center group-hover:text-brand-400 transition-colors">
                          {module.name}
                        </h4>
                        <p className="text-[9px] text-surface-600 font-mono mt-2 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver Módulo
                        </p>

                        <div className="absolute top-4 right-4">
                          <ExternalLink className="w-3.5 h-3.5 text-surface-700 group-hover:text-brand-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-surface-900/30 border-2 border-dashed border-surface-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-surface-800" />
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-surface-300">No hay aplicaciones habilitadas</p>
                      <p className="text-xs text-surface-600 mt-2">
                        Tu empresa aún no ha activado ningún módulo de negocio o no tienes los permisos necesarios.
                      </p>
                    </div>
                  </div>
                )}

                {context?.user?.globalType === 'admin' && (
                  <div
                    onClick={() => (window.location.href = '/admin')}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                    <div className="relative flex flex-col items-center justify-center p-8 bg-surface-900 border border-surface-800 border-dashed rounded-3xl group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all aspect-square">
                      <div className="w-16 h-16 rounded-2xl bg-surface-950 border border-surface-800 flex items-center justify-center mb-6 group-hover:border-blue-500/30 transition-all">
                        <Shield className="w-8 h-8 text-blue-500" />
                      </div>
                      <h4 className="text-sm font-black text-surface-100 uppercase tracking-tight text-center group-hover:text-blue-400 transition-colors">
                        Sistema Admin
                      </h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="pt-8 pb-4 border-t border-surface-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono text-surface-700 uppercase tracking-widest">
        <div>&copy; 2026 TERABOUND ENTERPRISE RESOURCE PLANNING</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-brand-500 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-brand-500 transition-colors">Seguridad</a>
          <a href="#" className="hover:text-brand-500 transition-colors">v0.1.5-beta</a>
        </div>
      </footer>
    </div>
  );
}