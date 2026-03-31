'use client';

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Zap,
  Layers,
  AlertTriangle,
  Settings2
} from 'lucide-react';
import { 
  FirestoreRelationshipsRepository, 
  FirestoreEntitiesRepository 
} from '@terabound/repositories';
import { 
  RelationshipDefinition, 
  EntityDefinition, 
  Cardinality, 
  RelationshipStrategy, 
  CascadePolicy 
} from '@terabound/domain';

const relRepo = new FirestoreRelationshipsRepository();
const entityRepo = new FirestoreEntitiesRepository();

export default function RelationshipsPage() {
  const [relationships, setRelationships] = useState<RelationshipDefinition[]>([]);
  const [entities, setEntities] = useState<EntityDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [currentRel, setCurrentRel] = useState<Partial<RelationshipDefinition>>({
    key: '',
    name: '',
    sourceEntityKey: '',
    targetEntityKey: '',
    cardinality: '1:N',
    required: false,
    crossModule: false,
    strategy: 'reference',
    cascadePolicy: 'restrict',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rels, ents] = await Promise.all([
        relRepo.list(),
        entityRepo.list()
      ]);
      setRelationships(rels);
      setEntities(ents);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRel.id) {
        await relRepo.update(currentRel.id, currentRel);
      } else {
        await relRepo.create(currentRel as any);
      }
      setIsDrawerOpen(false);
      loadData();
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro? Eliminar una relación puede causar inconsistencias de datos.')) {
      await relRepo.delete(id);
      loadData();
    }
  };

  const filtered = relationships.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sourceEntityKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.targetEntityKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface-bg/30">
      <div className="p-8 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-950/20 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-display font-black text-surface-50 tracking-tight flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-brand-400" />
            Integridad Referencial
          </h2>
          <p className="text-xs text-surface-500 mt-1 uppercase tracking-widest font-bold">
            Gestión de Relaciones y Vinculación de Datos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Buscar relación..."
              className="input pl-10 text-xs w-64 bg-surface-950/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => {
              setCurrentRel({
                key: '',
                name: '',
                sourceEntityKey: '',
                targetEntityKey: '',
                cardinality: '1:N',
                required: false,
                crossModule: false,
                strategy: 'reference',
                cascadePolicy: 'restrict',
                isActive: true,
              });
              setIsDrawerOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Relación
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20 grayscale">
            <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest">Maquetando Vínculos...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div 
                key={r.id}
                className={`card group border-surface-800 hover:border-brand-500/30 transition-all p-5 flex items-center justify-between gap-6 ${
                  !r.isActive ? 'opacity-40 grayscale bg-surface-950/40' : ''
                }`}
              >
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <div className="flex items-center gap-4 min-w-[300px]">
                    <div className="flex-1 text-right">
                      <p className="text-sm font-black text-surface-50 leading-none">{r.sourceEntityKey}</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black tracking-widest mt-1">Origen</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 shrink-0 px-4">
                      <div className="relative w-12 h-1 bg-surface-800 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-brand-500/50 animate-pulse-slow" />
                      </div>
                      <span className="text-[10px] font-mono text-brand-400 font-black">{r.cardinality}</span>
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-black text-surface-50 leading-none">{r.targetEntityKey}</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black tracking-widest mt-1">Destino</p>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-surface-800 mx-4" />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-surface-100 truncate">{r.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-surface-500 uppercase tracking-tighter">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {r.strategy}
                      </span>
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-surface-500 uppercase tracking-tighter">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {r.cascadePolicy}
                      </span>
                      {r.required && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                          Required
                        </span>
                      )}
                      {r.crossModule && (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                          Cross-Module
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                    <button 
                      onClick={() => {
                        setCurrentRel(r);
                        setIsDrawerOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-50 transition-all border border-transparent hover:border-surface-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id!)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-brand-500 shadow-[0_0_8px_rgba(51,141,255,0.5)]' : 'bg-surface-800'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 opacity-30 grayscale">
            <LinkIcon className="w-20 h-20 mb-4 text-surface-700" />
            <h3 className="text-lg font-bold text-surface-500">Sin relaciones definidas</h3>
            <p className="text-sm italic text-surface-600">Comience vinculando sus entidades maestras.</p>
          </div>
        )}
      </div>

      {/* --- Relationship Drawer --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-surface-bg/80 backdrop-blur-md animate-fade-in" 
            onClick={() => setIsDrawerOpen(false)}
          />
          
          <div className="relative w-full max-w-xl bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col animate-slide-in-right h-full overflow-hidden">
            <div className="p-6 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-950/40">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <Settings2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-surface-50 leading-none">
                    {currentRel.id ? 'Ajustar Relación' : 'Nueva Relación'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-surface-500 font-bold uppercase tracking-widest leading-none">
                      Configuración Técnica Referencial
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
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Código Único</label>
                    <input 
                      type="text" 
                      disabled={!!currentRel.id}
                      className="input font-mono text-sm uppercase py-3"
                      placeholder="TENANT_MEMBERS"
                      value={currentRel.key}
                      onChange={(e) => setCurrentRel({ ...currentRel, key: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Nombre Público</label>
                    <input 
                      type="text" 
                      className="input text-sm font-bold py-3"
                      placeholder="Miembros del Tenante"
                      value={currentRel.name}
                      onChange={(e) => setCurrentRel({ ...currentRel, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-950/60 border border-surface-800 flex items-center gap-4 relative">
                  <div className="flex-1 space-y-2 text-center">
                    <label className="text-[10px] font-black text-surface-600 uppercase">Entidad Origen</label>
                    <select 
                      className="input w-full py-2.5 bg-surface-900 border-surface-700 text-xs font-black"
                      value={currentRel.sourceEntityKey}
                      onChange={(e) => setCurrentRel({ ...currentRel, sourceEntityKey: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {entities.map(e => <option key={e.id} value={e.key}>{e.key}</option>)}
                    </select>
                  </div>

                  <div className="p-2 rounded-full bg-surface-800 border border-surface-700 z-10">
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </div>

                  <div className="flex-1 space-y-2 text-center">
                    <label className="text-[10px] font-black text-surface-600 uppercase">Entidad Destino</label>
                    <select 
                      className="input w-full py-2.5 bg-surface-900 border-surface-700 text-xs font-black"
                      value={currentRel.targetEntityKey}
                      onChange={(e) => setCurrentRel({ ...currentRel, targetEntityKey: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {entities.map(e => <option key={e.id} value={e.key}>{e.key}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Cardinalidad</label>
                    <select 
                      className="input h-12 appearance-none bg-surface-950 font-bold text-xs"
                      value={currentRel.cardinality}
                      onChange={(e) => setCurrentRel({ ...currentRel, cardinality: e.target.value as any })}
                    >
                      <option value="1:1">1:1 (One to One)</option>
                      <option value="1:N">1:N (One to Many)</option>
                      <option value="N:N">N:N (Many to Many)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Estrategia</label>
                    <select 
                      className="input h-12 appearance-none bg-surface-950 font-bold text-xs"
                      value={currentRel.strategy}
                      onChange={(e) => setCurrentRel({ ...currentRel, strategy: e.target.value as any })}
                    >
                      <option value="reference">🔗 Reference</option>
                      <option value="embedded">📦 Embedded</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] px-1">Política de Cascada</label>
                  <select 
                    className="input h-12 appearance-none bg-surface-950 font-bold text-xs"
                    value={currentRel.cascadePolicy}
                    onChange={(e) => setCurrentRel({ ...currentRel, cascadePolicy: e.target.value as any })}
                  >
                    <option value="restrict">🚫 Restrict (Strict)</option>
                    <option value="cascade">🌊 Cascade (Chain Delete)</option>
                    <option value="set_null">⚪ Set Null</option>
                  </select>
                  {currentRel.cascadePolicy === 'cascade' && (
                    <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                      <p className="text-[9px] font-bold text-orange-400 uppercase tracking-tight">ADVERTENCIA: Acción destructiva habilitada.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Obligatorio</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Required link</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                      checked={currentRel.required}
                      onChange={(e) => setCurrentRel({ ...currentRel, required: e.target.checked })}
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Cross-Module</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Apps Link</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                      checked={currentRel.crossModule}
                      onChange={(e) => setCurrentRel({ ...currentRel, crossModule: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-950/50 border border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${currentRel.isActive ? 'bg-brand-500 shadow-[0_0_8px_rgba(51,141,255,0.5)]' : 'bg-surface-700'}`} />
                    <div>
                      <p className="text-[11px] font-black text-surface-100 uppercase tracking-tight">Vínculo Activo</p>
                      <p className="text-[9px] text-surface-500 uppercase font-black opacity-60">Gubernado por motor</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-brand-500 rounded-lg bg-surface-800 border-surface-700"
                    checked={currentRel.isActive}
                    onChange={(e) => setCurrentRel({ ...currentRel, isActive: e.target.checked })}
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
                  {currentRel.id ? 'Guardar Cambios' : 'Generar Vínculo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
