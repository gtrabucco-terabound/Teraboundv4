'use client';

// ============================================================
// /admin/tenants/[id] — Configuración Detallada de Tenant
// Perfil completo, gestión de módulos y preferencias.
// Spec ref: §5.2
// ============================================================

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronLeft,
  Save,
  Loader2,
  AlertCircle,
  Globe,
  User,
  CreditCard,
  ShieldCheck,
  LayoutGrid,
  Settings2,
  Palette,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  FirestoreTenantsRepository, 
  FirestoreModulesRepository, 
  FirestoreTenantsModulesRepository 
} from '@terabound/repositories';
import type { Tenant, ModuleDefinition, TenantModule } from '@terabound/domain';

interface TenantDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function TenantDetailsPage({ params }: TenantDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [globalModules, setGlobalModules] = useState<ModuleDefinition[]>([]);
  const [tenantModules, setTenantModules] = useState<TenantModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'modules' | 'branding' | 'billing'>('profile');

  const repo = new FirestoreTenantsRepository();
  const modulesRepo = new FirestoreModulesRepository();
  const tenantModulesRepo = new FirestoreTenantsModulesRepository();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, modulesData, tenantModulesData] = await Promise.all([
        repo.getById(id),
        modulesRepo.list({ visibility: 'tenant-available' }),
        tenantModulesRepo.list(id)
      ]);

      if (!tenantData) {
        setError('Tenant no encontrado.');
        return;
      }

      setTenant(tenantData);
      setGlobalModules(modulesData);
      setTenantModules(tenantModulesData);
    } catch (err: any) {
      console.error('[TenantDetails] Error loading data:', err);
      setError('Error al cargar la información completa del cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!tenant) return;
    try {
      setIsSaving(true);
      await repo.update(id, tenant);
      alert('Configuración actualizada con éxito.');
    } catch (err: any) {
      console.error('[TenantDetails] Update Error:', err);
      alert('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleModule = async (moduleId: string, currentStatus: string) => {
    if (!tenant) return;
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    
    try {
      await tenantModulesRepo.upsert(id, {
        moduleId,
        status: newStatus as any
      });
      // Update local state
      setTenantModules(prev => {
        const index = prev.findIndex(m => m.moduleId === moduleId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index]!, status: newStatus as any };
          return updated;
        }
        return [...prev, { moduleId, status: newStatus as any } as TenantModule];
      });
    } catch (err: any) {
      console.error('[TenantModules] Toggle Error:', err);
      alert('Error al actualizar el estado del módulo.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Consultando base de datos...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="card max-w-lg mx-auto p-10 mt-10 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto opacity-20" />
        <h2 className="text-xl font-display font-bold text-surface-50">{error || 'Error Desconocido'}</h2>
        <button onClick={() => router.back()} className="btn-secondary">Volver al Ecosistema</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-surface-800 transition-colors text-surface-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-black text-surface-50">
                {tenant.tradeName || tenant.legalName}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {tenant.status}
              </span>
            </div>
            <p className="text-sm text-surface-500 font-mono mt-0.5">ID: {tenant.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-red-400 hover:bg-red-500/10 border-red-500/20">
            <Trash2 className="w-4 h-4" />
            Baja Lógica
          </button>
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Tabs */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-medium ${activeTab === 'profile'
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-[0_0_20px_rgba(var(--brand-500-rgb),0.05)]'
                : 'bg-surface-900 border-surface-800 text-surface-400 hover:border-surface-700'
              }`}
          >
            <Settings2 className="w-4 h-4" />
            Perfil y Datos Legales
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-medium ${activeTab === 'modules'
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                : 'bg-surface-900 border-surface-800 text-surface-400 hover:border-surface-700'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Módulos Habilitados
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-medium ${activeTab === 'branding'
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                : 'bg-surface-900 border-surface-800 text-surface-400 hover:border-surface-700'
              }`}
          >
            <Palette className="w-4 h-4" />
            Branding y Estética
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-medium ${activeTab === 'billing'
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                : 'bg-surface-900 border-surface-800 text-surface-400 hover:border-surface-700'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            Facturación y Plan
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <div className="card p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-xl font-display font-bold text-surface-50 mb-6">Datos de Identificación</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Nombre Legal (Razón Social)</label>
                  <input
                    className="input"
                    value={tenant.legalName}
                    onChange={(e) => setTenant({ ...tenant, legalName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Nombre de Fantasía</label>
                  <input
                    className="input"
                    value={tenant.tradeName || ''}
                    onChange={(e) => setTenant({ ...tenant, tradeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">ID Fiscal / CUIT</label>
                  <input
                    className="input font-mono"
                    value={tenant.taxId || ''}
                    onChange={(e) => setTenant({ ...tenant, taxId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Propietario Principal (Owner UID)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      className="input pl-10 font-mono text-xs"
                      value={tenant.ownerUserId}
                      onChange={(e) => setTenant({ ...tenant, ownerUserId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-surface-800/50">
                <h3 className="text-xl font-display font-bold text-surface-50 mb-6">Configuración Regional</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">País</label>
                    <input
                      className="input"
                      value={tenant.country || ''}
                      onChange={(e) => setTenant({ ...tenant, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Moneda</label>
                    <select
                      className="input"
                      value={tenant.currency}
                      onChange={(e) => setTenant({ ...tenant, currency: e.target.value })}
                    >
                      <option value="ARS">Peso Argentino (ARS)</option>
                      <option value="USD">Dólar Estadounidense (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Idioma / Locale</label>
                    <select
                      className="input"
                      value={tenant.locale}
                      onChange={(e) => setTenant({ ...tenant, locale: e.target.value })}
                    >
                      <option value="es-AR">Español (AR)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="card p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-surface-50">Ecosistema de Módulos</h3>
                  <p className="text-sm text-surface-500 mt-1">Habilita o deshabilita funciones específicas para este cliente.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {globalModules.length > 0 ? globalModules.map((mod) => {
                   const tMod = tenantModules.find(m => m.moduleId === mod.id);
                   const isEnabled = tMod?.status === 'enabled';
                   
                   return (
                    <div key={mod.id} className={`p-4 rounded-2xl bg-surface-950/40 border border-surface-800 flex items-center justify-between group hover:border-brand-500/20 transition-all ${!isEnabled ? 'opacity-70' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 text-xl font-bold">
                          {mod.icon || '📦'}
                        </div>
                        <div>
                          <h4 className="font-bold text-surface-50 text-sm">{mod.name}</h4>
                          <p className="text-[10px] text-surface-600 uppercase font-bold tracking-widest mt-0.5">{mod.category || mod.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isEnabled ? 'text-emerald-400' : 'text-surface-600'}`}>
                          {isEnabled ? 'Activo' : 'Inactivo'}
                        </span>
                        <button 
                          onClick={() => handleToggleModule(mod.id!, tMod?.status || 'disabled')}
                          className={`w-10 h-5 rounded-full relative transition-colors ${isEnabled ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-surface-800 border-surface-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${isEnabled ? 'right-1 bg-emerald-400 shadow-[0_0_8px_rgba(var(--emerald-400-rgb),0.5)]' : 'left-1 bg-surface-600'}`} />
                        </button>
                      </div>
                    </div>
                   );
                }) : (
                  <div className="col-span-full py-20 text-center text-surface-500 italic">
                    No hay módulos globales marcados como disponibles para tenants en la colección _gl_modules.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="card p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-xl font-display font-bold text-surface-50 mb-6">Identidad Visual</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-8">
                  <div className="w-32 h-32 rounded-3xl bg-surface-950 border border-surface-800 flex items-center justify-center text-4xl relative overflow-hidden group">
                    {tenant.branding?.logoUrl ? (
                      <img src={tenant.branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : '🏢'}
                    <div className="absolute inset-0 bg-surface-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Plus className="w-8 h-8 text-brand-400" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-surface-600 text-brand-500">Logo de Empresa (URL)</label>
                      <input
                        className="input font-mono text-xs"
                        value={tenant.branding?.logoUrl || ''}
                        onChange={(e) => setTenant({
                          ...tenant,
                          branding: { ...tenant.branding, logoUrl: e.target.value }
                        })}
                        placeholder="https://ejemplo.com/logo.png"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Color Primario</label>
                        <div className="flex gap-2">
                          <div className="w-10 h-10 rounded-lg border border-surface-800 shrink-0" style={{ backgroundColor: tenant.branding?.primaryColor || '#007AFF' }} />
                          <input
                            className="input font-mono uppercase"
                            value={tenant.branding?.primaryColor || '#007AFF'}
                            onChange={(e) => setTenant({
                              ...tenant,
                              branding: { ...tenant.branding, primaryColor: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-surface-600">Color Secundario</label>
                        <div className="flex gap-2">
                          <div className="w-10 h-10 rounded-lg border border-surface-800 shrink-0" style={{ backgroundColor: tenant.branding?.secondaryColor || '#5856D6' }} />
                          <input
                            className="input font-mono uppercase"
                            value={tenant.branding?.secondaryColor || '#5856D6'}
                            onChange={(e) => setTenant({
                              ...tenant,
                              branding: { ...tenant.branding, secondaryColor: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-center py-20">
              <ShieldCheck className="w-16 h-16 text-brand-400 mx-auto opacity-20 mb-4" />
              <h3 className="text-xl font-display font-bold text-surface-50 italic">Plan Enterprise</h3>
              <p className="text-sm text-surface-500 mt-2">Próximamente: Integración con Stripe para gestión de cobros y cuotas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
