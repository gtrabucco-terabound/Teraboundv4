'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Tag,
  Hash,
  Globe,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { FirestoreEntitiesRepository } from '@terabound/repositories';
import type { EntityDefinition } from '@terabound/domain';

const entityRepo = new FirestoreEntitiesRepository();

export default function EntitiesPage() {
  const [entities, setEntities] = useState<EntityDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<Partial<EntityDefinition>>({
    key: '',
    name: '',
    description: '',
    storagePath: '',
    scope: 'tenant',
    primaryIdField: 'id',
    displayField: '',
    auditable: true,
    softDelete: false,
    isSystem: false,
    isActive: true,
  });

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const data = await entityRepo.list();
      setEntities(data);
    } catch (err) {
      console.error('Error loading entities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEntity.id) {
        // Enforce protection for system entities
        if (currentEntity.isSystem) {
          // You could restrict fields here or in the repo.
          // For now, we'll assume the UI handles locking.
        }
        await entityRepo.update(currentEntity.id, currentEntity);
      } else {
        await entityRepo.create(currentEntity as any);
      }
      setIsDrawerOpen(false);
      loadEntities();
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert('ERROR CRÍTICO: Las entidades de sistema no pueden ser eliminadas.');
      return;
    }
    if (confirm('¿Seguro? Esta acción puede romper relaciones estructurales.')) {
      await entityRepo.delete(id);
      loadEntities();
    }
  };

  const filtered = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface-bg/30">
      <div className="p-8 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-950/20 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-display font-black text-surface-50 tracking-tight flex items-center gap-3">
            <Database className="w-6 h-6 text-brand-400" />
            Registro de Entidades
          </h2>
          <p className="text-xs text-surface-500 mt-1 uppercase tracking-widest font-bold">
            Definición Estructural del Modelo de Datos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Buscar entidad..."
              className="input pl-10 text-xs w-64 bg-surface-950/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => {
              setCurrentEntity({
                key: '',
                name: '',
                description: '',
                storagePath: '',
                scope: 'tenant',
                primaryIdField: 'id',
                displayField: '',
                auditable: true,
                softDelete: false,
                isSystem: false,
                isActive: true,
              });
              setIsDrawerOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Entidad
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 grayscale opacity-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest">Consultando Registro...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e) => (
              <div 
                key={e.id}
                className={`card group border-surface-800 hover:border-brand-500/30 transition-all p-6 relative flex flex-col gap-5 ${
                  !e.isActive ? 'opacity-50 grayscale bg-surface-950/40' : ''
                }`}
              >
                {e.isSystem && (
                  <div className="absolute top-4 right-4 text-brand-400" title="Entidad de Sistema">
                    <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_8px_rgba(51,141,255,0.4)]" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl border ${
                      e.isSystem ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-surface-900 border-surface-700 text-surface-400'
                    }`}>
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-surface-50 group-hover:text-brand-400 transition-colors">
                        {e.name}
                      </h3>
                      <p className="text-[10px] font-mono text-surface-500 tracking-tighter uppercase">{e.key}</p>
                    </div>
                  </div>
                  <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed">
                    {e.description || 'Sin descripción técnica.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-surface-950/60 border border-surface-800/50 flex flex-col">
                    <span className="text-surface-600 mb-0.5 uppercase font-bold text-[8px]">Scope</span>
                    <span className="text-surface-300 flex items-center gap-1">
                      {e.scope === 'global' ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      {e.scope}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-950/60 border border-surface-800/50 flex flex-col">
                    <span className="text-surface-600 mb-0.5 uppercase font-bold text-[8px]">PK Field</span>
                    <span className="text-surface-300 flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" />
                      {e.primaryIdField}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-surface-800/50">
                  <div className="flex items-center gap-2">
                    {e.isActive ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-800 text-surface-500 text-[9px] font-black uppercase tracking-tighter">
                        Inactive
                      </span>
                    )}
                    {e.auditable && (
                      <span className="text-[9px] font-black text-indigo-400 border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Audit
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setCurrentEntity(e);
                        setIsDrawerOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-50 transition-all border border-transparent hover:border-surface-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(e.id!, e.isSystem)}
                      className={`p-2 rounded-lg transition-all border border-transparent ${
                        e.isSystem 
                          ? 'cursor-not-allowed opacity-20 text-surface-600' 
                          : 'hover:bg-red-500/10 text-surface-400 hover:text-red-400 hover:border-red-500/20'
                      }`}
                      disabled={e.isSystem}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 opacity-30 grayscale">
            <Database className="w-20 h-20 mb-4 text-surface-700" />
            <h3 className="text-lg font-bold text-surface-500">Sin entidades registradas</h3>
            <p className="text-sm italic text-surface-600">Comience registrando la primera entidad maestra.</p>
          </div>
        )}
      </div>

      {/* --- Entity Drawer --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-surface-bg/80 backdrop-blur-md animate-fade-in" 
            onClick={() => setIsDrawerOpen(false)}
          />
          
          <div className="relative w-full max-w-xl bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col animate-slide-in-right h-full overflow-hidden">
            <div className="p-6 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-950/40">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl border ${
                  currentEntity.isSystem ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-surface-800 border-surface-700 text-surface-400'
                }`}>
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-surface-50 leading-none">
                    {currentEntity.id ? 'Configurar Entidad' : 'Nueva Entidad'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {currentEntity.isSystem && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[9px] font-black uppercase tracking-tighter border border-brand-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        Objeto Protegido
                      </span>
                    )}
                    <span className="text-[10px] text-surface-500 font-bold uppercase tracking-widest truncate max-w-[200px]">
                      {currentEntity.key || 'PENDIENTE_ID'}
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
                {currentEntity.isSystem && (
                  <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 flex gap-4 items-start">
                    <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-brand-400 uppercase tracking-tight">Regla de Gobernanza Activa</p>
                      <p className="text-[11px] text-surface-400 mt-1 leading-relaxed">
                        Esta entidad es crucial para el ecosistema. Los campos estructurales (Key, Path, Scope, PK) están **bloqueados** para garantizar integridad referencial.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Identificador (Key)</label>
                    <input 
                      type="text" 
                      disabled={!!currentEntity.id || currentEntity.isSystem}
                      className="input font-mono text-sm uppercase py-3"
                      placeholder="USER_PROFILE"
                      value={currentEntity.key}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, key: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Nombre Descriptivo</label>
                    <input 
                      type="text" 
                      className="input text-sm font-bold py-3"
                      placeholder="Perfil de Usuario"
                      value={currentEntity.name}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Descripción Técnica</label>
                  <textarea 
                    className="input min-h-[80px] text-sm py-3 leading-relaxed" 
                    placeholder="Describe el propósito y uso de esta entidad en el sistema..."
                    value={currentEntity.description}
                    onChange={(e) => setCurrentEntity({ ...currentEntity, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Storage Path (Firestore)</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      disabled={currentEntity.isSystem}
                      className="input pl-11 font-mono text-xs py-3"
                      placeholder="tenants/{tenantId}/profiles"
                      value={currentEntity.storagePath}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, storagePath: e.target.value })}
                    />
                    {currentEntity.isSystem && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3.5 h-3.5 text-brand-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Scope</label>
                    <select 
                      disabled={currentEntity.isSystem}
                      className="input h-12 appearance-none bg-surface-950 font-bold text-xs"
                      value={currentEntity.scope}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, scope: e.target.value as any })}
                    >
                      <option value="global">🌎 Global</option>
                      <option value="tenant">🏢 Tenant</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Primary Key Field</label>
                    <input 
                      type="text" 
                      disabled={currentEntity.isSystem}
                      className="input font-mono text-xs py-3"
                      placeholder="id"
                      value={currentEntity.primaryIdField}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, primaryIdField: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Auditable</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Log events</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                      checked={currentEntity.auditable}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, auditable: e.target.checked })}
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Soft Delete</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Logic delete</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                      checked={currentEntity.softDelete}
                      onChange={(e) => setCurrentEntity({ ...currentEntity, softDelete: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${currentEntity.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-surface-700'}`} />
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Registro Activo</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Visible en selectores</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                    checked={currentEntity.isActive}
                    onChange={(e) => setCurrentEntity({ ...currentEntity, isActive: e.target.checked })}
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
                  {currentEntity.id ? 'Guardar Cambios' : 'Registrar Entidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
