'use client';

// ============================================================
// /admin/tenants — Gestión Multi-tenant
// Alta y administración de clientes de la plataforma.
// Spec ref: §5.2
// ============================================================

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2, 
  AlertCircle, 
  MoreVertical, 
  Globe, 
  User, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { FirestoreTenantsRepository } from '@terabound/repositories';
import type { Tenant } from '@terabound/domain';

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
  suspended: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  pending: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: Clock },
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Tenant>>({
    status: 'active' as any,
    timezone: 'America/Argentina/Buenos_Aires',
    locale: 'es-AR',
    currency: 'ARS',
    country: 'Argentina'
  });

  const repo = new FirestoreTenantsRepository();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setTenants(data);
    } catch (err: any) {
      console.error('[Tenants] Error:', err);
      setError('Error al conectar con el servicio de Tenants.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.legalName || !formData.ownerUserId) return;

    try {
      setIsSaving(true);
      await repo.create(formData as any);
      setIsDrawerOpen(false);
      setFormData({
        status: 'active' as any,
        timezone: 'America/Argentina/Buenos_Aires',
        locale: 'es-AR',
        currency: 'ARS',
        country: 'Argentina'
      });
      await loadTenants();
    } catch (err: any) {
      console.error('[Tenants] Create Error:', err);
      alert('Error al crear el tenant.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.taxId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Cargando ecosistema de tenants...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
                <Building2 className="w-5 h-5 text-brand-400" />
              </div>
              Gestión de Tenants
            </h1>
            <p className="section-subtitle mt-2">
              Administración de clientes, estados de cuenta y configuraciones regionales.
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo Tenant
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, trade name o ID fiscal..." 
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800 text-xs font-medium text-surface-400">
            <span>Total:</span>
            <span className="text-surface-100 font-bold">{tenants.length}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => {
              const style = statusStyles[tenant.status] || statusStyles['pending']!;
              const StatusIcon = style.icon;

              return (
                <div key={tenant.id} className="card group hover:border-brand-500/30 transition-all">
                  <div className="p-5 border-b border-surface-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center border border-surface-700 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 transition-colors text-xl">
                          {tenant.branding?.logoUrl ? (
                             <img src={tenant.branding.logoUrl} alt="" className="w-6 h-6 object-contain" />
                          ) : '🏢'}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-surface-50 truncate max-w-[180px]">
                            {tenant.tradeName || tenant.legalName}
                          </h3>
                          <p className="text-[10px] text-surface-500 font-mono tracking-tight uppercase">
                            ID: {tenant.id?.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full ${style.bg} ${style.text} flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider`}>
                        <StatusIcon className="w-3 h-3" />
                        {tenant.status}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-surface-600 block">Identificación</span>
                        <div className="flex items-center gap-2 text-xs text-surface-300 font-medium font-mono">
                          <CreditCard className="w-3 h-3 opacity-50" />
                          {tenant.taxId || 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-surface-600 block">Dueño</span>
                        <div className="flex items-center gap-2 text-xs text-surface-300 font-medium">
                          <User className="w-3 h-3 opacity-50" />
                          UID: {tenant.ownerUserId.slice(0, 6)}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-950/40 border border-surface-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-surface-500" />
                        <div>
                          <p className="text-[11px] font-bold text-surface-300 leading-none">{tenant.currency} - {tenant.locale}</p>
                          <p className="text-[10px] text-surface-600 mt-1 uppercase font-medium line-clamp-1">{tenant.timezone.split('/').pop()?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-surface-600 uppercase tracking-widest">{tenant.country}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                       <button className="flex-1 btn-secondary text-[11px] py-2 h-auto font-bold uppercase tracking-wider">
                          Configuración
                       </button>
                       <button className="p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:text-brand-400 transition-colors border border-surface-700/50">
                          <ExternalLink className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="col-span-full card py-20 flex flex-col items-center justify-center text-surface-500 text-sm">
                <Building2 className="w-16 h-16 mb-4 opacity-10" />
                <p>No se encontraron tenants que coincidan con la búsqueda.</p>
             </div>
          )}
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-surface-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          {/* Drawer Content */}
          <div 
            className="w-full max-w-xl bg-surface-900 border-l border-surface-800 shadow-2xl animate-fade-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-surface-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-surface-50">Alta de Nuevo Tenant</h2>
                <p className="text-sm text-surface-400 mt-1">Registrá un nuevo cliente con aislamiento multi-tenant.</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sección Legal */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-500">Información Legal</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Nombre Legal de la Empresa</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: Terabound Solutions S.A."
                    className="input"
                    value={formData.legalName || ''}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase">Nombre de Fantasía</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Terabound"
                      className="input"
                      value={formData.tradeName || ''}
                      onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase">CUIT / Tax ID</label>
                    <input 
                      type="text" 
                      placeholder="30-12345678-9"
                      className="input font-mono"
                      value={formData.taxId || ''}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Sección Propietario */}
              <div className="space-y-4 pt-4 border-t border-surface-800/50">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Acceso y Propiedad</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Owner User ID (Firebase UID)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ingrese el UID del usuario dueño"
                    className="input font-mono"
                    value={formData.ownerUserId || ''}
                    onChange={(e) => setFormData({ ...formData, ownerUserId: e.target.value })}
                  />
                  <p className="text-[10px] text-surface-600 italic">Este usuario tendrá permisos completos sobre el tenant.</p>
                </div>
              </div>

              {/* Sección Regional */}
              <div className="space-y-4 pt-4 border-t border-surface-800/50">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-surface-400">Configuración Regional</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase">Moneda (Currency)</label>
                    <select 
                      className="input"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="ARS">Peso Argentino (ARS)</option>
                      <option value="USD">Dólar Estadounidense (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="BRL">Real Brasileño (BRL)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase">Idioma (Locale)</label>
                    <select 
                      className="input"
                      value={formData.locale}
                      onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                    >
                      <option value="es-AR">Español (AR)</option>
                      <option value="en-US">English (US)</option>
                      <option value="pt-BR">Português (BR)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Zona Horaria (Timezone)</label>
                  <select 
                    className="input font-mono text-xs"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                    <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="UTC">Universal Time Coordinated (UTC)</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-surface-800 grid grid-cols-2 gap-3 bg-surface-900/50 backdrop-blur-sm">
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn-secondary py-3"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                onClick={handleCreateTenant}
                disabled={isSaving || !formData.legalName || !formData.ownerUserId}
                className="btn-primary py-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando Tenant...
                  </>
                ) : 'Confirmar Alta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
