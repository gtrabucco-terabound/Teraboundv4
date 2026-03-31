'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  FileCode,
  ListFilter,
  Layout
} from 'lucide-react';
import { 
  FirestoreValidationRulesRepository, 
  FirestoreEntitiesRepository 
} from '@terabound/repositories';
import { ValidationRule, EntityDefinition } from '@terabound/domain';

const ruleRepo = new FirestoreValidationRulesRepository();
const entityRepo = new FirestoreEntitiesRepository();

export default function ValidationsPage() {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [entities, setEntities] = useState<EntityDefinition[]>([]);
  const [selectedEntityKey, setSelectedEntityKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<ValidationRule>>({
    entityKey: '',
    name: '',
    type: 'required',
    field: '',
    value: '',
    errorMessage: '',
    config: {},
    isActive: true,
  });

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    if (selectedEntityKey) {
      loadRules(selectedEntityKey);
    } else {
      setRules([]);
    }
  }, [selectedEntityKey]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const ents = await entityRepo.list();
      setEntities(ents);
      if (ents.length > 0) {
        setSelectedEntityKey(ents[0]!.key);
      }
    } catch (err) {
      console.error('Error loading entities:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async (entityKey: string) => {
    try {
      setLoading(true);
      const data = await ruleRepo.listByEntity(entityKey);
      setRules(data);
    } catch (err) {
      console.error('Error loading rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRule.id) {
        await ruleRepo.update(currentRule.id, currentRule);
      } else {
        await ruleRepo.create({ ...currentRule, entityKey: selectedEntityKey } as any);
      }
      setIsDrawerOpen(false);
      loadRules(selectedEntityKey);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-bg/30 overflow-hidden">
      <div className="p-8 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-950/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-black text-surface-50 tracking-tight flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-brand-400" />
              Reglas de Validación
            </h2>
            <p className="text-[10px] text-surface-500 uppercase tracking-widest font-bold">
              Data Integrity & Quality Rules
            </p>
          </div>

          <div className="h-10 w-px bg-surface-800 mx-2" />

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-surface-600 uppercase tracking-widest px-1">Entidad Seleccionada</span>
            <select 
              className="input bg-surface-950 border-surface-800 text-xs font-black py-1.5 px-4 h-9 min-w-[200px]"
              value={selectedEntityKey}
              onChange={(e) => setSelectedEntityKey(e.target.value)}
            >
              {entities.map(e => <option key={e.id} value={e.key}>{e.name}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={() => {
            setCurrentRule({
              entityKey: selectedEntityKey,
              name: '',
              type: 'required',
              field: '',
              value: '',
              errorMessage: '',
              config: {},
              isActive: true,
            });
            setIsDrawerOpen(true);
          }}
          disabled={!selectedEntityKey}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Regla
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20 grayscale">
            <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest">Validando Esquemas...</p>
          </div>
        ) : rules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className={`card group border-surface-800 hover:border-brand-500/30 transition-all p-6 flex flex-col gap-4 ${
                  !rule.isActive ? 'opacity-40 grayscale bg-surface-950/40' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-950 border border-surface-800 text-brand-400">
                      <ListFilter className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-surface-50 truncate max-w-[150px]">{rule.name}</h3>
                      <p className="text-[10px] font-mono text-surface-500 uppercase tracking-tighter">Campo: {rule.field}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setCurrentRule(rule);
                        setIsDrawerOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-50 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('¿Eliminar regla?')) {
                          await ruleRepo.delete(rule.id!);
                          loadRules(selectedEntityKey);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-950/60 border border-surface-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-surface-600 uppercase tracking-widest">Tipo</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-400 uppercase tracking-tighter">
                      <FileCode className="w-3 h-3" />
                      {rule.type}
                    </span>
                  </div>
                  {rule.errorMessage && (
                    <div className="flex items-start gap-2 pt-1 border-t border-surface-800/30">
                      <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-surface-400 leading-tight italic line-clamp-2">{rule.errorMessage}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-surface-800'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${rule.isActive ? 'text-emerald-500' : 'text-surface-600'}`}>
                    {rule.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 opacity-30 grayscale text-center">
            <CheckSquare className="w-20 h-20 mb-4 text-surface-700" />
            <h3 className="text-lg font-bold text-surface-500">Sin reglas para esta entidad</h3>
            <p className="text-sm italic text-surface-600 max-w-xs">Garantice la calidad del dato añadiendo reglas de validación estructural.</p>
          </div>
        )}
      </div>

      {/* --- Rule Drawer --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-surface-bg/80 backdrop-blur-md animate-fade-in" 
            onClick={() => setIsDrawerOpen(false)}
          />
          
          <div className="relative w-full max-w-lg bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col animate-slide-in-right h-full overflow-hidden">
            <div className="p-6 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-950/40">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-surface-50 leading-none">
                    {currentRule.id ? 'Ajustar Regla' : 'Nueva Regla'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-surface-500 font-bold uppercase tracking-widest leading-none">
                      Integridad para {selectedEntityKey}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2.5 hover:bg-surface-800 rounded-xl transition-all">
                <Plus className="w-6 h-6 text-surface-500 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Nombre de la Regla</label>
                  <input 
                    type="text" 
                    className="input font-bold text-sm py-3"
                    placeholder="ej: Email Obligatorio"
                    value={currentRule.name}
                    onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Campo (Field)</label>
                    <input 
                      type="text" 
                      className="input font-mono text-sm py-3"
                      placeholder="ej: email"
                      value={currentRule.field}
                      onChange={(e) => setCurrentRule({ ...currentRule, field: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Tipo de Validación</label>
                    <select 
                      className="input h-12 appearance-none bg-surface-950 font-bold text-xs"
                      value={currentRule.type}
                      onChange={(e) => setCurrentRule({ ...currentRule, type: e.target.value as any })}
                    >
                      <option value="required">❗ Required</option>
                      <option value="enum">🔢 Enum (List)</option>
                      <option value="format">📋 Format (Regex)</option>
                      <option value="custom">🛠️ Custom Logic</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Valor de Comparación / Pattern</label>
                  <input 
                    type="text" 
                    className="input font-mono text-xs py-3"
                    placeholder="ej: true, /^[a-z]+$/, etc."
                    value={currentRule.value}
                    onChange={(e) => setCurrentRule({ ...currentRule, value: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Mensaje de Error Personalizado</label>
                  <textarea 
                    className="input min-h-[80px] text-sm py-3 leading-relaxed italic" 
                    placeholder="ej: El correo electrónico es requerido para continuar..."
                    value={currentRule.errorMessage}
                    onChange={(e) => setCurrentRule({ ...currentRule, errorMessage: e.target.value })}
                  />
                </div>

                <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${currentRule.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-surface-700'}`} />
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Regla Activa</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Gobernado por motor</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                    checked={currentRule.isActive}
                    onChange={(e) => setCurrentRule({ ...currentRule, isActive: e.target.checked })}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-surface-800 grid grid-cols-2 gap-4 bg-surface-950/80 backdrop-blur-md shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn-secondary py-3 text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary py-3 text-xs"
                >
                  {currentRule.id ? 'Guardar Cambios' : 'Configurar Regla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
