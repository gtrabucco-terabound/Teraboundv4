'use client';

import { useState } from 'react';
import { 
  Megaphone,
  Search, 
  RefreshCw, 
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import type { Incident } from '@terabound/domain';

// Mock Data para la UI Shell
const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-100',
    title: 'Caída de la Pasarela de Pagos',
    description: 'Stripe webhook no está recibiendo eventos de confirmación.',
    severity: 'critical',
    status: 'investigating',
    moduleIds: ['billing'],
    createdAt: new Date(Date.now() - 3600000),
    createdBy: 'admin-123'
  },
  {
    id: 'inc-099',
    title: 'Latencia en Auth para Tenants en EU',
    severity: 'major',
    status: 'open',
    tenantIds: ['tn-europe-1'],
    moduleIds: ['iam'],
    createdAt: new Date(Date.now() - 86400000),
    createdBy: 'system'
  },
  {
    id: 'inc-098',
    title: 'Error de carga de fuentes',
    description: 'CDN bloqueada temporalmente.',
    severity: 'minor',
    status: 'resolved',
    createdAt: new Date(Date.now() - 172800000),
    resolvedAt: new Date(Date.now() - 100000000),
    createdBy: 'support-tier1'
  }
];

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'major': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'minor': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-surface-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'open': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-surface-400 bg-surface-500/10 border-surface-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-amber-500" />
            Centro de Incidentes
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Gestión de eventos críticos, caídas de servicio y comunicación de estado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Refrescar
          </button>
          <button className="btn-primary py-2 px-6 bg-amber-500 hover:bg-amber-400 text-surface-950">
            <Plus className="w-4 h-4 mr-2" /> Declarar Incidente
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-2 flex gap-2 items-center relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input 
          type="text" 
          placeholder="Buscar incidentes..." 
          className="input h-full w-full max-w-md pl-10 border-none bg-surface-950/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {MOCK_INCIDENTS.map((incident) => (
          <div key={incident.id} className="card p-5 hover:border-surface-600 transition-colors group cursor-pointer">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex gap-4">
                   <div className="pt-1">
                      {getSeverityIcon(incident.severity)}
                   </div>
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-display font-bold text-surface-100 group-hover:text-amber-400 transition-colors">
                          {incident.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                     </div>
                     <p className="text-xs font-mono text-surface-500 mb-2">ID: {incident.id} • Creado: {incident.createdAt.toLocaleString()}</p>
                     
                     {incident.description && (
                       <p className="text-sm text-surface-300 leading-relaxed max-w-3xl">
                         {incident.description}
                       </p>
                     )}

                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                        {incident.moduleIds && incident.moduleIds.length > 0 && (
                          <div className="flex items-center gap-1.5">
                             <span className="text-[10px] uppercase font-bold text-surface-500">Módulos:</span>
                             {incident.moduleIds.map(m => (
                               <span key={m} className="px-1.5 py-0.5 bg-surface-800 rounded text-xs text-surface-300">{m}</span>
                             ))}
                          </div>
                        )}
                        {incident.tenantIds && incident.tenantIds.length > 0 && (
                          <div className="flex items-center gap-1.5">
                             <span className="text-[10px] uppercase font-bold text-surface-500">Tenants:</span>
                             {incident.tenantIds.map(t => (
                               <span key={t} className="px-1.5 py-0.5 bg-brand-500/10 text-brand-400 rounded text-xs border border-brand-500/20">{t}</span>
                             ))}
                          </div>
                        )}
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center self-center md:self-start">
                   <button className="p-2 rounded-full hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
