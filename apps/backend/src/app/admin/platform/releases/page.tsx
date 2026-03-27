'use client';

// ============================================================
// /admin/platform/releases — Historial de Despliegues
// Control de versiones y estados de lanzamiento.
// Spec ref: §13.4
// ============================================================

import { useState, useEffect } from 'react';
import { Rocket, Plus, Search, Loader2, AlertCircle, History, CheckCircle2, Clock, RotateCcw, Boxes, ChevronRight } from 'lucide-react';
import { FirestoreReleasesRepository, FirestoreModulesRepository } from '@terabound/repositories';
import type { ReleaseDefinition, ModuleDefinition } from '@terabound/domain';

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  released: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
  'in-progress': { bg: 'bg-brand-500/10', text: 'text-brand-400', icon: Loader2 },
  planned: { bg: 'bg-surface-800', text: 'text-surface-400', icon: Clock },
  'rolled-back': { bg: 'bg-red-500/10', text: 'text-red-400', icon: RotateCcw },
};

export default function ReleasesPage() {
  const [releases, setReleases] = useState<ReleaseDefinition[]>([]);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer & Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ReleaseDefinition>>({
    status: 'planned',
    version: '0.1.0',
    targetModules: [],
    notes: ''
  });

  const repo = new FirestoreReleasesRepository();
  const modulesRepo = new FirestoreModulesRepository();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [releasesData, modulesData] = await Promise.all([
        repo.list(),
        modulesRepo.list()
      ]);
      setReleases(releasesData);
      setModules(modulesData);
    } catch (err: any) {
      console.error('[Releases] Error:', err);
      setError('No se pudo cargar la información de releases.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.version) return;

    try {
      setIsSaving(true);
      await repo.create(formData as Omit<ReleaseDefinition, 'id' | 'createdAt' | 'updatedAt'>);
      setIsDrawerOpen(false);
      setFormData({
        status: 'planned',
        version: '0.1.0',
        targetModules: [],
        notes: ''
      });
      await loadData();
    } catch (err: any) {
      console.error('[Releases] Error al crear:', err);
      alert('Error al registrar el release.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModuleSelection = (slug: string) => {
    const current = formData.targetModules || [];
    if (current.includes(slug)) {
      setFormData({ ...formData, targetModules: current.filter((s: string) => s !== slug) });
    } else {
      setFormData({ ...formData, targetModules: [...current, slug] });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Consultando historial de versiones...</p>
      </div>
    );
  }

  const latestRelease = releases[0];

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Rocket className="w-5 h-5 text-orange-400" />
              </div>
              Gestión de Releases
            </h1>
            <p className="section-subtitle mt-2">
              Control de versiones activas y registro histórico de despliegues.
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Planificar Release
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Timeline (Left 3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            {releases.length > 0 ? (
              releases.map((rel: ReleaseDefinition) => {
                const style = statusStyles[rel.status] ?? statusStyles['planned']!;
                const StatusIcon = style.icon;
                
                return (
                  <div key={rel.id} className="card p-5 hover:border-surface-600/40 transition-all group relative overflow-hidden">
                    {rel.status === 'released' && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
                    )}
                    
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`mt-1 p-2 rounded-full ${style.bg} ${style.text}`}>
                              <StatusIcon className={`w-4 h-4 ${rel.status === 'in-progress' ? 'animate-spin' : ''}`} />
                          </div>
                          <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-display font-bold text-surface-50 text-lg">{rel.name}</h3>
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-950 text-surface-400 border border-surface-700/50">
                                    v{rel.version}
                                </span>
                              </div>
                              <p className="text-sm text-surface-400 mt-1 max-w-xl">
                                {rel.notes || 'Sin notas de lanzamiento registradas.'}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mt-4">
                                {rel.targetModules.map((mod: string) => (
                                  <span key={mod} className="px-2 py-0.5 rounded bg-surface-800 text-[10px] font-medium text-surface-300">
                                      {mod}
                                  </span>
                                ))}
                              </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-surface-600 block mb-1">Fecha</span>
                          <span className="text-xs text-surface-300 font-medium">
                              {rel.releasedAt ? new Date(rel.releasedAt).toLocaleDateString() : 'Pendiente'}
                          </span>
                          <div className="mt-4">
                            <button className="text-[10px] underline text-brand-400 hover:text-brand-300 font-bold uppercase transition-colors">
                                Detalles
                            </button>
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card py-20 flex flex-col items-center justify-center text-surface-500 text-sm">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p>No hay registros de releases en esta plataforma.</p>
              </div>
            )}
          </div>

          {/* Sidebar Info (Right 1 column) */}
          <div className="space-y-4">
            <div className="card p-5 bg-brand-500/5 border-brand-500/20">
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-4">Versión Actual</h4>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-display font-black text-surface-50">
                  {latestRelease?.status === 'released' ? `v${latestRelease.version}` : 'v0.1.0'}
                </div>
                {latestRelease?.status === 'released' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">STABLE</span>
                )}
              </div>
              <p className="text-[11px] text-surface-500 mt-2 leading-relaxed">
                {latestRelease?.status === 'released' 
                  ? `Último despliegue realizado el ${new Date(latestRelease.releasedAt!).toLocaleDateString()}.`
                  : 'Esperando el primer despliegue estable.'}
              </p>
            </div>

            <div className="card p-5 border-surface-800/50 bg-surface-900/40">
              <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Métricas de Envío</h4>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Total Releases</span>
                  <span className="text-surface-200 font-bold font-mono">{releases.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Rollbacks</span>
                  <span className="text-surface-200 font-bold font-mono">
                    {releases.filter((r: ReleaseDefinition) => r.status === 'rolled-back').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Éxito en Despliegue</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {releases.length > 0 
                      ? `${Math.round((releases.filter((r: ReleaseDefinition) => r.status === 'released').length / releases.length) * 100)}%`
                      : '100%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                <h2 className="text-xl font-display font-bold text-surface-50">Planificar Release</h2>
                <p className="text-sm text-surface-400 mt-1">Registrá una nueva versión y sus cambios.</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Versión</label>
                  <input 
                    required
                    type="text" 
                    placeholder="v1.0.0"
                    className="input font-mono"
                    value={formData.version || ''}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Estado Inicial</label>
                  <select 
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="planned">Planned (Planificado)</option>
                    <option value="in-progress">In Progress</option>
                    <option value="released">Released</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase">Título del Lanzamiento</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Q2 Core Improvements"
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-500 uppercase">Notas de Lanzamiento / Changelog</label>
                <textarea 
                  rows={4}
                  placeholder="Describe los cambios incluidos..."
                  className="input resize-none py-3"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-surface-500 uppercase flex items-center gap-2">
                  <Boxes className="w-3 h-3" />
                  Módulos Afectados
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {modules.map((mod: ModuleDefinition) => {
                    const isSelected = formData.targetModules?.includes(mod.slug);
                    return (
                      <button
                        key={mod.slug}
                        type="button"
                        onClick={() => toggleModuleSelection(mod.slug)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${
                          isSelected 
                            ? 'bg-brand-500/10 border-brand-500/40 text-surface-50' 
                            : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-70 group-hover:scale-110 transition-transform">
                            {mod.icon || '📦'}
                          </span>
                          <span className="text-[11px] font-medium truncate">{mod.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-brand-400" />}
                      </button>
                    );
                  })}
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
                onClick={handleCreateRelease}
                disabled={isSaving || !formData.name || !formData.version}
                className="btn-primary py-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : 'Planificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

