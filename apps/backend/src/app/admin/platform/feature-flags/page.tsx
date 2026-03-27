'use client';

// ============================================================
// /admin/platform/feature-flags — Control de Características
// Gestión de flags globales y por tenant.
// Spec ref: §13.2
// ============================================================

import { useState, useEffect } from 'react';
import { ToggleLeft, Plus, Search, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { FirestoreFeatureFlagsRepository } from '@terabound/repositories';
import type { FeatureFlag } from '@terabound/domain';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer & Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<FeatureFlag>>({
    enabled: false,
    scope: 'platform',
    rolloutPercentage: 100,
    description: ''
  });

  const repo = new FirestoreFeatureFlagsRepository();

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setFlags(data);
    } catch (err: any) {
      console.error('[FeatureFlags] Error:', err);
      setError('No se pudieron cargar los feature flags.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.name) return;

    try {
      setIsSaving(true);
      await repo.create(formData as Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>);
      setIsDrawerOpen(false);
      setFormData({
        enabled: false,
        scope: 'platform',
        rolloutPercentage: 100,
        description: ''
      });
      await loadFlags();
    } catch (err: any) {
      console.error('[FeatureFlags] Error al crear:', err);
      alert('Error al registrar la flag.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    if (!flag.id) return;
    const newStatus = !flag.enabled;
    
    // Optimistic Update
    setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, enabled: newStatus } : f));
    
    try {
      await repo.toggle(flag.id, newStatus);
    } catch (err) {
      console.error('[FeatureFlags] Error al cambiar estado:', err);
      // Revertir si falla
      setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, enabled: !newStatus } : f));
    }
  };

  const filteredFlags = flags.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Cargando Feature Flags...</p>
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
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <ToggleLeft className="w-5 h-5 text-indigo-400" />
              </div>
              Feature Flags
            </h1>
            <p className="section-subtitle mt-2">
              Control de despliegue progresivo y características experimentales.
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nueva Flag
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o key..."
              className="input pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlags.length > 0 ? (
            filteredFlags.map((flag) => (
              <div key={flag.id} className="card p-5 group hover:border-brand-500/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-surface-50 group-hover:text-brand-400 transition-colors">
                      {flag.name}
                    </h3>
                    <code className="text-[10px] font-mono text-surface-500 uppercase tracking-tighter">
                      {flag.key}
                    </code>
                  </div>
                  <button
                    onClick={() => handleToggle(flag)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.enabled ? 'bg-brand-500' : 'bg-surface-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <p className="text-sm text-surface-400 mb-6 line-clamp-2 min-h-[40px]">
                  {flag.description || 'Sin descripción disponible.'}
                </p>

                <div className="pt-4 border-t border-surface-700/30 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      flag.scope === 'platform' 
                      ? 'border-brand-500/20 text-brand-400 bg-brand-500/5' 
                      : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                  }`}>
                    Scope: {flag.scope}
                  </span>
                  <span className="text-[10px] text-surface-600 font-mono">
                    v{flag.rolloutPercentage || 100}% Rollout
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 card flex flex-col items-center justify-center text-surface-500">
              <ToggleLeft className="w-12 h-12 mb-3 opacity-20" />
              <p>No se encontraron feature flags activos.</p>
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
            className="w-full max-w-lg bg-surface-900 border-l border-surface-800 shadow-2xl animate-fade-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-surface-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-surface-50">Nueva Feature Flag</h2>
                <p className="text-sm text-surface-400 mt-1">Habilitá capacidades progresivas en el sistema.</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateFlag} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase">Nombre descriptivo</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Nuevo Dashboard Financiero"
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase">Key técnica (Unique)</label>
                <input 
                  required
                  type="text" 
                  placeholder="ej: new-dashboard-v2"
                  className="input font-mono text-sm"
                  value={formData.key || ''}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase">Descripción del propósito</label>
                <textarea 
                  rows={3}
                  placeholder="¿Qué hace esta flag? ¿A quién afecta?"
                  className="input resize-none py-3"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Scope</label>
                  <select 
                    className="input"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                  >
                    <option value="platform">Platform (Global)</option>
                    <option value="tenant">Tenant (Específico)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Rollout (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    className="input font-mono"
                    value={formData.rolloutPercentage}
                    onChange={(e) => setFormData({ ...formData, rolloutPercentage: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-950/50 border border-surface-800">
                <div>
                  <h4 className="text-sm font-bold text-surface-100">Estado Inicial</h4>
                  <p className="text-[11px] text-surface-500">¿La flag estará habilitada al crearla?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.enabled ? 'bg-brand-500' : 'bg-surface-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
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
                onClick={handleCreateFlag}
                disabled={isSaving || !formData.key || !formData.name}
                className="btn-primary py-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : 'Crear Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

