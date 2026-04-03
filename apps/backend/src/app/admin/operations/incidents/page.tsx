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
import { Incident, IncidentSeverity } from '@terabound/domain';

// Mock Data para la UI Shell
const INITIAL_MOCK_INCIDENTS: Incident[] = [
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
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_MOCK_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'minor' as 'minor' | 'major' | 'critical',
    moduleIds: '',
    tenantIds: ''
  });

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newIncident: Incident = {
      id: `inc-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      status: 'investigating',
      moduleIds: formData.moduleIds ? formData.moduleIds.split(',').map(s => s.trim()) : undefined,
      tenantIds: formData.tenantIds ? formData.tenantIds.split(',').map(s => s.trim()) : undefined,
      createdAt: new Date(),
      createdBy: 'admin-123'
    };

    setIncidents([newIncident, ...incidents]);
    setIsDrawerOpen(false);
    setFormData({ title: '', description: '', severity: 'minor', moduleIds: '', tenantIds: '' });
  };

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
          <button 
            type="button"
            className="btn-primary py-2 px-6 bg-amber-500 hover:bg-amber-400 text-surface-950"
            onClick={() => setIsDrawerOpen(true)}
          >
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
        {incidents.map((incident) => (
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

      {/* Drawer Overlay - Declarar Incidente */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-surface-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-surface-900 border-l border-surface-800 shadow-2xl animate-fade-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-surface-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-surface-50 text-amber-500">Declarar Incidente</h2>
                <p className="text-sm text-surface-400 mt-1">Registra un evento crítico para informar e investigar.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Título del Incidente</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: Caída de Pasarela de Pagos"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Gravedad</label>
                  <select 
                    className="input appearance-none bg-surface-950"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  >
                    <option value="minor">Menor (Minor)</option>
                    <option value="major">Mayor (Major)</option>
                    <option value="critical">Crítica (Critical)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Descripción / Observaciones</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalles sobre cómo afecta esto al sistema..."
                    className="input py-3 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-surface-500 uppercase">Módulos Afectados (opcional, sep. coma)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: billing, auth"
                    className="input font-mono"
                    value={formData.moduleIds}
                    onChange={(e) => setFormData({ ...formData, moduleIds: e.target.value })}
                  />
                </div>

                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-surface-500 uppercase">Tenants Afectados (opcional, sep. coma)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: tn-alpha, tn-europe-1"
                    className="input font-mono"
                    value={formData.tenantIds}
                    onChange={(e) => setFormData({ ...formData, tenantIds: e.target.value })}
                  />
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
                type="button"
                onClick={handleCreateIncident}
                disabled={!formData.title}
                className="btn-primary py-3 bg-amber-500 hover:bg-amber-400 text-surface-950"
              >
                <AlertTriangle className="w-4 h-4 mr-2" /> Declarar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
