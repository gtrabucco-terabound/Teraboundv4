'use client';

import { useState } from 'react';
import { 
  Activity, 
  Search, 
  TerminalSquare, 
  AlertCircle, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  XOctagon 
} from 'lucide-react';
import type { Job } from '@terabound/domain';

// Mock Data para la UI Shell
const MOCK_JOBS: Job[] = [
  {
    id: 'j-001',
    type: 'syncData',
    scope: 'platform',
    status: 'running',
    createdAt: new Date(Date.now() - 300000),
    startedAt: new Date(Date.now() - 290000),
    createdBy: 'system',
  },
  {
    id: 'j-002',
    type: 'tenantBackup',
    scope: 'tenant',
    tenantId: 'tn-alpha',
    status: 'failed',
    error: 'Timeout after 30s',
    createdAt: new Date(Date.now() - 86400000),
    startedAt: new Date(Date.now() - 86300000),
    finishedAt: new Date(Date.now() - 86270000),
    createdBy: 'admin-123',
  },
  {
    id: 'j-003',
    type: 'reportGeneration',
    scope: 'module',
    moduleId: 'analytics',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000),
    startedAt: new Date(Date.now() - 172700000),
    finishedAt: new Date(Date.now() - 172600000),
    createdBy: 'user-001',
  }
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'failed': return <XOctagon className="w-4 h-4 text-rose-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-surface-400" />;
      default: return <Activity className="w-4 h-4 text-surface-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'completed': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'failed': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default: return 'bg-surface-800 border-surface-700 text-surface-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-3">
            <TerminalSquare className="w-7 h-7 text-brand-500" />
            Background Jobs
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Monitor de procesos asíncronos, colas de ejecución y tareas programadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Refrescar
          </button>
          <button className="btn-primary py-2 px-6">
            <Play className="w-4 h-4 mr-2" /> Nuevo Job
          </button>
        </div>
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-2 border-l-blue-500 flex items-center justify-between">
           <div>
              <p className="text-xs uppercase font-black tracking-wider text-surface-500 mb-1">En Ejecución</p>
              <p className="text-2xl font-display font-bold text-surface-50">1</p>
           </div>
           <RefreshCw className="w-8 h-8 text-blue-500/20" />
        </div>
        <div className="card p-4 border-l-2 border-l-rose-500 flex items-center justify-between">
           <div>
              <p className="text-xs uppercase font-black tracking-wider text-surface-500 mb-1">Fallidos (24h)</p>
              <p className="text-2xl font-display font-bold text-surface-50">1</p>
           </div>
           <XOctagon className="w-8 h-8 text-rose-500/20" />
        </div>
        <div className="card p-4 border-l-2 border-l-emerald-500 flex items-center justify-between">
           <div>
              <p className="text-xs uppercase font-black tracking-wider text-surface-500 mb-1">Completados</p>
              <p className="text-2xl font-display font-bold text-surface-50">1</p>
           </div>
           <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
        </div>
        <div className="relative col-span-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
           <input 
             type="text" 
             placeholder="Buscar por ID, Tipo o Tenant..." 
             className="input h-full w-full pl-10 bg-surface-900 border-surface-800"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-900/50 border-b border-surface-800">
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Estado</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">ID / Tipo</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Contexto</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider">Creación</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {MOCK_JOBS.map((job) => (
              <tr key={job.id} className="hover:bg-surface-800/20 transition-colors group">
                <td className="p-4">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBg(job.status)}`}>
                    {getStatusIcon(job.status)}
                    {job.status}
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-mono text-[11px] text-surface-400 mb-0.5">{job.id}</p>
                  <p className="font-bold text-sm text-surface-200">{job.type}</p>
                  {job.error && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {job.error}
                    </p>
                  )}
                </td>
                <td className="p-4">
                   <div className="flex flex-col gap-1">
                     <span className="inline-flex max-w-max items-center px-1.5 py-0.5 rounded bg-surface-800 text-surface-400 text-[10px] font-bold uppercase">
                       {job.scope}
                     </span>
                     {job.tenantId && <span className="text-xs text-surface-300">Tenant: {job.tenantId}</span>}
                     {job.moduleId && <span className="text-xs text-surface-300">Modulo: {job.moduleId}</span>}
                   </div>
                </td>
                <td className="p-4">
                   <p className="text-sm text-surface-200">{job.createdAt.toLocaleDateString()}</p>
                   <p className="text-xs text-surface-500">{job.createdAt.toLocaleTimeString()}</p>
                </td>
                <td className="p-4 text-right">
                   <button className="text-brand-400 hover:text-brand-300 text-[11px] uppercase font-bold tracking-wider px-3 py-1.5 rounded bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     Ver Log
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
