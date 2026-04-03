'use client';

import { useState } from 'react';
import { 
  Zap,
  Search, 
  RefreshCw, 
  Plus,
  PlayCircle,
  ToggleRight,
  ToggleLeft,
  Settings,
  Workflow
} from 'lucide-react';
import type { AutomationRule } from '@terabound/domain';

// Mock Data para la UI Shell
const INITIAL_MOCK_RULES: AutomationRule[] = [
  {
    id: 'rule-001',
    key: 'auto_assign_leads',
    name: 'Auto-Asignación de Leads (CRM)',
    description: 'Asigna automáticamente leads entrantes a agentes disponibles en horario laboral.',
    triggerEvent: 'LeadCreated',
    conditions: [ { field: 'source', operator: 'eq', value: 'web' } ],
    actions: [ { type: 'assignToUser', value: 'available_agent' } ],
    active: true,
    createdAt: new Date(Date.now() - 86400000),
    createdBy: 'system',
    updatedAt: new Date(Date.now() - 3600000),
    updatedBy: 'admin-123'
  },
  {
    id: 'rule-002',
    key: 'escalate_critical_error',
    name: 'Escalar Errores Críticos',
    description: 'Notifica al canal de DevOps si un error crítico no es resuelto en 1 hora.',
    triggerEvent: 'ErrorCreated',
    conditions: [ { field: 'severity', operator: 'eq', value: 'critical' } ],
    actions: [ { type: 'sendWebhook', url: 'https://hooks.slack.com/...' } ],
    active: false,
    createdAt: new Date(Date.now() - 172800000),
    createdBy: 'system',
    updatedAt: new Date(Date.now() - 172800000),
    updatedBy: 'system'
  }
];

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_MOCK_RULES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    triggerEvent: ''
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) return;

    const newRule: AutomationRule = {
      id: `rule-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      key: formData.key,
      name: formData.name,
      description: formData.description,
      triggerEvent: formData.triggerEvent || 'CustomEvent',
      conditions: [],
      actions: [],
      active: false,
      createdAt: new Date(),
      createdBy: 'admin-123',
      updatedAt: new Date(),
      updatedBy: 'admin-123'
    };

    setRules([newRule, ...rules]);
    setIsDrawerOpen(false);
    setFormData({ key: '', name: '', description: '', triggerEvent: '' });
  };

  const toggleRuleActive = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-3">
            <Zap className="w-7 h-7 text-indigo-500" />
            Reglas de Automatización
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Orquestación de flujos de trabajo basados en eventos (Event-Driven Architecture).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2">
            <PlayCircle className="w-4 h-4 mr-2" /> Probar Eventos
          </button>
          <button 
            type="button"
            className="btn-primary py-2 px-6 bg-indigo-500 hover:bg-indigo-400 text-white"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Regla
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-2 flex flex-col md:flex-row gap-4 items-center justify-between relative">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
           <input 
             type="text" 
             placeholder="Buscar reglas..." 
             className="input w-full pl-10 border-none bg-surface-950/50"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase rounded flex items-center gap-2 w-full md:w-auto justify-center">
            <Workflow className="w-4 h-4" /> Motor de Inferencia Activo
        </div>
      </div>

      {/* Rule List */}
      <div className="grid grid-cols-1 gap-4">
        {rules.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((rule) => (
          <div key={rule.id} className={`card p-5 transition-colors group ${rule.active ? 'border-surface-700' : 'opacity-80'}`}>
             <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Rule Info */}
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-display font-bold text-surface-50">
                        {rule.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-surface-800 text-[10px] font-mono text-surface-400">
                        {rule.key}
                      </span>
                   </div>
                   {rule.description && (
                     <p className="text-sm text-surface-400 leading-relaxed mb-4">
                       {rule.description}
                     </p>
                   )}
                   
                   <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-surface-500">Trigger:</span>
                      <span className="px-2 py-1 bg-surface-950 border border-surface-800 text-xs font-mono text-indigo-300 rounded">
                        {rule.triggerEvent}
                      </span>
                   </div>
                </div>

                {/* Actions / Status */}
                <div className="flex flex-col items-end justify-between min-w-[200px] border-l border-surface-800 pl-6">
                   <div className="flex flex-col items-end gap-2 w-full">
                      <button 
                        onClick={() => toggleRuleActive(rule.id as string)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-colors w-full justify-center
                          ${rule.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-800 text-surface-500'}
                        `}
                      >
                         {rule.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                         {rule.active ? 'Regla Activa' : 'Pausada'}
                      </button>
                      
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-800/50 hover:bg-surface-800 rounded text-xs text-surface-300 w-full justify-center transition-colors">
                         <Settings className="w-4 h-4 text-surface-500" />
                         Configurar Nodos
                      </button>
                   </div>
                   <div className="text-[10px] text-surface-500 font-mono mt-4 text-right">
                     ID: {rule.id} <br/>
                     Modificado: {rule.updatedAt.toLocaleDateString()}
                   </div>
                </div>

             </div>
          </div>
        ))}
      </div>

      {/* Drawer Overlay - Nueva Regla */}
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
                <h2 className="text-xl font-display font-bold text-surface-50">Crear Regla Base</h2>
                <p className="text-sm text-surface-400 mt-1">Configura el detonador principal de la automatización.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Nombre de la Regla</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: Notificar Nuevo Cliente a Slack"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Key (Identificador único)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="ej: notify_slack_new_client"
                    className="input font-mono"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Evento Detonador (Trigger)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: TenantCreated, UserRegistered, etc."
                    className="input font-mono"
                    value={formData.triggerEvent}
                    onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Descripción</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe exactamente qué hace esta regla..."
                    className="input py-3 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onClick={handleCreateRule}
                disabled={!formData.name || !formData.key}
                className="btn-primary py-3 bg-indigo-500 hover:bg-indigo-400 text-white"
              >
                Crear Regla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
