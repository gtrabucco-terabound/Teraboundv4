'use client';

import { useState } from 'react';
import { 
  Bug,
  Search, 
  AlertTriangle,
  RefreshCw, 
  Clock, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import type { ErrorRecord } from '@terabound/domain';

// Mock Data para la UI Shell
const MOCK_ERRORS: ErrorRecord[] = [
  {
    id: 'err-001',
    source: 'frontend',
    code: 'UI_RENDER_FAIL',
    message: 'Cannot read properties of undefined (reading "toLowerCase")',
    severity: 'error',
    status: 'open',
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: 'err-002',
    source: 'integration',
    tenantId: 'tn-alpha',
    moduleId: 'billing',
    code: 'STRIPE_TIMEOUT',
    message: 'Stripe API did not respond in 15000ms',
    severity: 'critical',
    status: 'ack',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'err-003',
    source: 'function',
    code: 'MEMORY_LIMIT_EXCEEDED',
    message: 'Cloud Function exhausted memory limit 2GB',
    severity: 'error',
    status: 'resolved',
    createdAt: new Date(Date.now() - 172800000),
    resolvedAt: new Date(Date.now() - 172600000),
  }
];

export default function ErrorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-surface-400 bg-surface-800 border-surface-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'ack': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Bug className="w-4 h-4 text-surface-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-3">
            <Bug className="w-7 h-7 text-rose-500" />
            Registro de Errores
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Traza de excepciones de sistema, fallos de UI, y errores de funciones serveless.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Refrescar
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-2 flex flex-wrap gap-2 items-center justify-between">
         <div className="flex gap-2 w-full md:w-auto flex-1">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input 
                type="text" 
                placeholder="Buscar por Codigo o Mensaje..." 
                className="input h-full w-full pl-10 border-none bg-surface-950/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative md:max-w-xs">
               <select className="input h-full appearance-none bg-surface-950/50 border-none pr-8 text-xs text-surface-400">
                  <option value="">Cualquier Origen</option>
                  <option value="frontend">Frontend</option>
                  <option value="function">Function</option>
                  <option value="integration">Integración</option>
               </select>
               <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-900/50 border-b border-surface-800">
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Gravedad</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider w-1/3">Error</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Contexto</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Estado</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {MOCK_ERRORS.map((error) => (
              <tr key={error.id} className="hover:bg-surface-800/20 transition-colors cursor-pointer group">
                <td className="p-4 align-top">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest border ${getSeverityColor(error.severity)}`}>
                     {error.severity}
                   </span>
                </td>
                <td className="p-4 align-top">
                  <p className="font-mono text-xs font-bold text-surface-200 mb-1">{error.code}</p>
                  <p className="text-sm text-surface-400 line-clamp-2 leading-relaxed">{error.message}</p>
                </td>
                <td className="p-4 align-top">
                   <div className="flex flex-col gap-1">
                     <span className="inline-flex max-w-max items-center px-1.5 py-0.5 rounded bg-surface-800 text-surface-400 text-[10px] font-bold uppercase">
                       src: {error.source}
                     </span>
                     {error.tenantId && <span className="text-xs text-surface-300">tn: {error.tenantId}</span>}
                     {error.moduleId && <span className="text-xs text-surface-300">mod: {error.moduleId}</span>}
                   </div>
                </td>
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(error.status)}
                    <span className="text-xs uppercase font-bold text-surface-300">{error.status}</span>
                  </div>
                </td>
                <td className="p-4 align-top">
                   <p className="text-sm text-surface-200">{error.createdAt.toLocaleDateString()}</p>
                   <p className="text-xs text-surface-500">{error.createdAt.toLocaleTimeString()}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
