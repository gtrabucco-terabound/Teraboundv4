'use client';

// ============================================================
// /admin/platform/environments — Gestión de Ambientes
// Estado de Dev, Staging, Prod.
// Spec ref: §13.3
// ============================================================

import { useState, useEffect } from 'react';
import { Globe, RefreshCw, Loader2, AlertCircle, ShieldCheck, Activity, Zap } from 'lucide-react';
import { FirestoreEnvironmentsRepository } from '@terabound/repositories';
import type { EnvironmentConfig } from '@terabound/domain';

const statusColors: Record<string, { bg: string; text: string; ring: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  inactive: { bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/20' },
  maintenance: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
};

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<EnvironmentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repo = new FirestoreEnvironmentsRepository();

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setEnvironments(data);
    } catch (err: any) {
      console.error('[Environments] Error:', err);
      setError('No se pudo obtener el estado de los ambientes.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Monitoreando infraestructura...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            Ambientes del Sistema
          </h1>
          <p className="section-subtitle mt-2">
            Estado operativo y versiones de configuración por entorno.
          </p>
        </div>
        <button onClick={loadEnvironments} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refrescar Estado
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Grid de Ambientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {environments.map((env) => {
          const sc = statusColors[env.status] ?? statusColors['inactive']!;
          return (
            <div key={env.id} className="card p-6 relative overflow-hidden group">
              {/* Indicador de Status Superior */}
              <div className={`absolute top-0 left-0 w-full h-1 ${env.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-surface-500">Región: US-CENTRAL1</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ${sc.ring} ${sc.bg} ${sc.text}`}>
                  {env.status}
                </span>
              </div>

              <h2 className="text-2xl font-display font-bold text-surface-50 mb-1 group-hover:text-brand-400 transition-colors">
                {env.name.toUpperCase()}
              </h2>
              <p className="text-xs text-surface-500 font-mono mb-6">terabound-{env.name}.cloud.google.com</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-950/50 border border-surface-800/50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    <span className="text-xs text-surface-300">Auth & Policies</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">v{env.configVersion}.0</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-950/50 border border-surface-800/50">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-surface-300">Uptime (24h)</span>
                  </div>
                  <span className="text-[10px] font-bold text-surface-200">99.9%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-950/50 border border-surface-800/50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-surface-300">Latencia</span>
                  </div>
                  <span className="text-[10px] font-bold text-surface-200">42ms</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 text-xs font-bold text-surface-400 hover:text-brand-400 border border-surface-700/50 rounded-lg hover:bg-brand-500/5 transition-all">
                Ver Logs de Infraestructura
              </button>
            </div>
          );
        })}

        {environments.length === 0 && (
          <div className="col-span-full py-20 card flex flex-col items-center justify-center text-surface-500 border-dashed">
            <Globe className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm italic">Inicializando monitoreo de ambientes...</p>
          </div>
        )}
      </div>
    </div>
  );
}
