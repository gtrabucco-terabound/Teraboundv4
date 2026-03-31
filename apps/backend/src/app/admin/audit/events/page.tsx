'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Shield, 
  Clock, 
  Settings2, 
  CheckCircle2, 
  XCircle,
  Hash,
  Activity,
  Layers
} from 'lucide-react';
import { FirestoreAuditRepository } from '@terabound/repositories';
import type { EventCatalogEntry } from '@terabound/domain';

export default function EventCatalogPage() {
  const [catalog, setCatalog] = useState<EventCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    setLoading(true);
    try {
      const repo = new FirestoreAuditRepository();
      const data = await repo.getEventCatalog();
      setCatalog(data);
    } catch (error) {
      console.error('Error loading event catalog:', error);
    } finally {
      setLoading(false);
    }
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'IAM': return 'text-brand-400 bg-brand-500/10';
      case 'Platform': return 'text-purple-400 bg-purple-500/10';
      case 'Tenant': return 'text-emerald-400 bg-emerald-500/10';
      case 'Governance': return 'text-amber-400 bg-amber-500/10';
      default: return 'text-surface-400 bg-surface-500/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-brand-500" />
            Catálogo de Eventos
          </h1>
          <p className="text-surface-400 text-sm mt-1">Diccionario maestro de eventos de sistema y reglas de retención.</p>
        </div>
        
        <button onClick={loadCatalog} className="btn-primary py-2 text-xs">
          Sincronizar Catálogo
        </button>
      </div>

      {/* Domain Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['IAM', 'Platform', 'Tenant', 'Governance'].map((domain) => (
          <div key={domain} className="p-4 bg-surface-900/40 border border-surface-700/20 rounded-xl">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{domain}</span>
                <Layers className="w-3.5 h-3.5 text-surface-600" />
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-surface-100">
                  {catalog.filter(e => e.domain === domain).length}
                </span>
                <span className="text-[10px] text-surface-500">Eventos Activos</span>
             </div>
          </div>
        ))}
      </div>

      {/* Catalog Table */}
      <div className="bg-surface-900/40 border border-surface-700/20 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-800/40 border-b border-surface-700/30">
                <th className="px-6 py-4 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Nombre del Evento</th>
                <th className="px-6 py-4 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Dominio</th>
                <th className="px-6 py-4 text-[10px] font-bold text-surface-500 uppercase tracking-widest text-center">Severidad</th>
                <th className="px-6 py-4 text-[10px] font-bold text-surface-500 uppercase tracking-widest text-center">Retención</th>
                <th className="px-6 py-4 text-[10px] font-bold text-surface-500 uppercase tracking-widest text-center">Versión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/10">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-5"><div className="h-4 bg-surface-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : catalog.map((event, index) => (
                <tr key={index} className="group hover:bg-surface-800/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-surface-100">{event.eventType}</span>
                      <span className="text-xs text-surface-500 mt-0.5 max-w-sm line-clamp-1">{event.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getDomainColor(event.domain)}`}>
                      {event.domain}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${event.severity === 'critical' ? 'text-red-400 bg-red-400/5' : 
                        event.severity === 'warning' ? 'text-amber-400 bg-amber-400/5' : 'text-blue-400 bg-blue-400/5'}`}>
                      <div className={`w-1 h-1 rounded-full ${event.severity === 'critical' ? 'bg-red-400' : 
                        event.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 text-xs text-surface-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-surface-500" />
                        {event.retentionDays} días
                      </div>
                      <span className="text-[9px] text-surface-600 uppercase mt-0.5">Auto-purge</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-950 border border-surface-800 rounded text-[10px] text-surface-400 font-mono">
                      <Hash className="w-2.5 h-2.5" />
                      v{event.version}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-6 p-6 bg-brand-500/5 border border-brand-500/20 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <Settings2 className="w-6 h-6 text-brand-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-surface-200">Gobernanza de Eventos</h4>
          <p className="text-xs text-surface-400 leading-relaxed max-w-2xl">
            La modificación de la severidad o retención solo es permitida mediante la actualización del catálogo maestro. 
            Las purgas se ejecutan semanalmente según los días de retención definidos para cada dominio.
          </p>
        </div>
      </div>
    </div>
  );
}
