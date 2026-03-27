'use client';

// ============================================================
// /admin/platform/releases — Historial de Despliegues
// Control de versiones y estados de lanzamiento.
// Spec ref: §13.4
// ============================================================

import { useState, useEffect } from 'react';
import { Rocket, Plus, Search, Loader2, AlertCircle, History, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { FirestoreReleasesRepository } from '@terabound/repositories';
import type { ReleaseDefinition } from '@terabound/domain';

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  released: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
  'in-progress': { bg: 'bg-brand-500/10', text: 'text-brand-400', icon: Loader2 },
  planned: { bg: 'bg-surface-800', text: 'text-surface-400', icon: Clock },
  'rolled-back': { bg: 'bg-red-500/10', text: 'text-red-400', icon: RotateCcw },
};

export default function ReleasesPage() {
  const [releases, setReleases] = useState<ReleaseDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repo = new FirestoreReleasesRepository();

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setReleases(data);
    } catch (err: any) {
      console.error('[Releases] Error:', err);
      setError('No se pudo cargar el historial de releases.');
    } finally {
      setLoading(false);
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

  return (
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
        <button className="btn-primary">
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
            releases.map((rel) => {
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
                               {rel.targetModules.map(mod => (
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
                 <div className="text-3xl font-display font-black text-surface-50">v0.1.0</div>
                 <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">STABLE</span>
              </div>
              <p className="text-[11px] text-surface-500 mt-2 leading-relaxed">
                 Último despliegue realizado el 27 de Marzo para el Backend Admin.
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
                    <span className="text-surface-200 font-bold font-mono">0</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-surface-500">Éxito en Despliegue</span>
                    <span className="text-emerald-400 font-bold font-mono">100%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
