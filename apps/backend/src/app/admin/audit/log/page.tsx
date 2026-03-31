'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Filter, 
  Download, 
  Search, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  Clock,
  User,
  Database,
  Eye
} from 'lucide-react';
import { FirestoreAuditRepository } from '@terabound/repositories';
import type { AuditEvent } from '@terabound/domain';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);
  
  // Filtros
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [severityFilter, statusFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const repo = new FirestoreAuditRepository();
      const filters: any = { limit: 50 };
      if (severityFilter !== 'all') filters.severity = severityFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const data = await repo.listGlobalLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const isSuccess = status === 'success';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
        ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-brand-500" />
            Log Global de Auditoría
          </h1>
          <p className="text-surface-400 text-sm mt-1">Trazabilidad completa de operaciones críticas y cambios estructurales.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary py-2 text-xs">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button onClick={loadLogs} className="btn-primary py-2 text-xs">
            Actualizar
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-surface-900/50 border border-surface-700/30 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input 
            type="text" 
            placeholder="Buscar por ID o Actor..." 
            className="w-full bg-surface-950 border border-surface-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:border-brand-500/50 outline-none transition-all"
          />
        </div>
        
        <select 
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-surface-950 border border-surface-700/50 rounded-lg px-4 py-2 text-sm text-surface-200 focus:border-brand-500/50 outline-none"
        >
          <option value="all">Todas las Severidades</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-950 border border-surface-700/50 rounded-lg px-4 py-2 text-sm text-surface-200 focus:border-brand-500/50 outline-none"
        >
          <option value="all">Todos los Estados</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>

        <div className="flex items-center gap-2 px-3 py-2 bg-surface-800/30 rounded-lg border border-surface-700/30 text-surface-400 text-xs text-center">
          <Clock className="w-3.5 h-3.5" />
          Últimas 24 horas (Auto)
        </div>
      </div>

      {/* Main Content: Table + Side Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table */}
        <div className="flex-1 bg-surface-900/40 border border-surface-700/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-800/40 border-b border-surface-700/30">
                  <th className="px-4 py-3 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Evento</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Entidad</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Actor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Estado</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/10">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-4 py-4"><div className="h-4 bg-surface-800 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-surface-500 text-sm">
                      No se encontraron registros de auditoría.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr 
                      key={index} 
                      onClick={() => setSelectedLog(log)}
                      className={`group hover:bg-brand-500/5 cursor-pointer transition-colors ${selectedLog === log ? 'bg-brand-500/10' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(log.severity)}
                          <span className="text-sm font-medium text-surface-200">{log.eventType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-surface-400 block font-mono">{log.entityType}</span>
                        <span className="text-[10px] text-surface-600 truncate max-w-[100px] block">{log.entityId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-800 border border-surface-700/50 flex items-center justify-center text-[10px] text-surface-400">
                            {log.actorType === 'user' ? <User className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                          </div>
                          <span className="text-xs text-surface-300">{log.actorUserId.split('@')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-500 font-mono">
                        {log.createdAt?.toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className={`w-full lg:w-96 bg-surface-900/60 border border-surface-700/30 rounded-xl p-6 transition-all shadow-2xl
          ${selectedLog ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
          {!selectedLog ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <Eye className="w-8 h-8 text-surface-700" />
              <p className="text-surface-600 text-sm">Selecciona un evento para ver los detalles del cambio.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest">Detalle del Evento</h3>
                <button onClick={() => setSelectedLog(null)} className="text-surface-500 hover:text-surface-200">&times;</button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-surface-950 border border-surface-800 rounded-lg">
                  <span className="text-[10px] text-surface-500 uppercase block mb-1">Acción Realizada</span>
                  <p className="text-sm text-surface-200 leading-relaxed">{selectedLog.action}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-950/50 border border-surface-800/50 rounded-lg">
                    <span className="text-[10px] text-surface-500 uppercase block">Fuente</span>
                    <span className="text-xs text-brand-500 font-bold">{selectedLog.source}</span>
                  </div>
                  <div className="p-3 bg-surface-950/50 border border-surface-800/50 rounded-lg">
                    <span className="text-[10px] text-surface-500 uppercase block">Correlación</span>
                    <span className="text-[10px] text-surface-400 font-mono font-bold truncate">#{selectedLog.correlationId?.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Diff Viewer (Simplified) */}
                <div className="space-y-2">
                  <span className="text-[10px] text-surface-500 uppercase font-bold tracking-wider">Cambios en Datos</span>
                  
                  {selectedLog.before && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-red-400/70 font-bold ml-1">[-] Previo</span>
                      <pre className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-red-200/60 overflow-x-auto max-h-32">
                        {JSON.stringify(selectedLog.before, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.after && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-emerald-400/70 font-bold ml-1">[+] Posterior</span>
                      <pre className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] text-emerald-200/80 overflow-x-auto max-h-32">
                        {JSON.stringify(selectedLog.after, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!selectedLog.before && !selectedLog.after && (
                    <p className="text-[10px] text-surface-600 italic">No se registraron deltas en este evento.</p>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-surface-800">
                 <button className="w-full py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs rounded-lg transition-colors">
                   Ver JSON Completo
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
