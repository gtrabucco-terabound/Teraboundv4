'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info,
  Globe,
  Lock,
  ChevronDown,
  MoreVertical,
  Loader2,
  Code
} from 'lucide-react';
import {
  FirestoreCatalogsRepository,
  FirestoreCatalogItemsRepository
} from '@terabound/repositories';
import type { Catalog, CatalogItem } from '@terabound/domain';

// --- Repositorios ---
const catalogRepo = new FirestoreCatalogsRepository();
const itemRepo = new FirestoreCatalogItemsRepository();

export default function MasterDataPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modales/Drawers
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState(false);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);

  // Forms
  const [catalogForm, setCatalogForm] = useState<Partial<Catalog>>({
    key: '',
    name: '',
    description: '',
    scope: 'global',
    isOverridable: false,
    active: true,
  });

  const [itemForm, setItemForm] = useState<Partial<CatalogItem>>({
    key: '',
    label: '',
    value: '',
    sortOrder: 1,
    active: true,
    metadata: {},
  });

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (selectedCatalog?.id) {
      loadItems(selectedCatalog.id);
    } else {
      setItems([]);
    }
  }, [selectedCatalog]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const data = await catalogRepo.list();
      setCatalogs(data);

      if (data.length > 0) {
        setSelectedCatalog(data[0]!);
      } else {
        setSelectedCatalog(null);
      }
    } catch (err) {
      console.error('Error loading catalogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (catalogId: string) => {
    try {
      setItemsLoading(true);
      const data = await itemRepo.listByCatalog(catalogId);
      setItems(data);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleSaveCatalog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (catalogForm.id) {
        await catalogRepo.update(catalogForm.id, catalogForm);
      } else {
        await catalogRepo.create(catalogForm as any);
      }

      setIsCatalogDrawerOpen(false);
      setCatalogForm({
        key: '',
        name: '',
        description: '',
        scope: 'global',
        isOverridable: false,
        active: true,
      });

      await loadCatalogs();
    } catch (err) {
      alert('Error al guardar catálogo: ' + (err as Error).message);
    }
  };

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!selectedCatalog?.id) return;

      const payload = {
        ...itemForm,
        catalogId: selectedCatalog.id,
      };

      if (itemForm.id) {
        await itemRepo.update(itemForm.id, payload);
      } else {
        await itemRepo.create(payload as any);
      }

      setIsItemDrawerOpen(false);
      setItemForm({
        key: '',
        label: '',
        value: '',
        sortOrder: items.length + 1,
        active: true,
        metadata: {},
      });

      await loadItems(selectedCatalog.id);
    } catch (err) {
      alert('Error al guardar item: ' + (err as Error).message);
    }
  };

  const filteredCatalogs = catalogs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-surface-bg overflow-hidden animate-fade-in-up">
      {/* --- Sidebar Izquierda: Lista de Catálogos --- */}
      <aside className="w-80 border-r border-surface-800 bg-surface-bg/50 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-surface-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-surface-200 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-400" />
              Catálogos
            </h2>

            <button
              onClick={() => {
                setCatalogForm({
                  key: '',
                  name: '',
                  description: '',
                  scope: 'global',
                  isOverridable: false,
                  active: true,
                });
                setIsCatalogDrawerOpen(true);
              }}
              className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Buscar catálogo..."
              className="input pl-10 text-xs bg-surface-950/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="w-5 h-5 text-surface-600 animate-spin" />
            </div>
          ) : filteredCatalogs.length > 0 ? (
            filteredCatalogs.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCatalog(c)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedCatalog?.id === c.id
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 ring-1 ring-brand-500/20'
                    : 'bg-transparent border-transparent text-surface-400 hover:bg-surface-800/50 hover:text-surface-100'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate">{c.name}</p>
                  <p className="text-[10px] opacity-60 font-mono truncate">{c.key}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCatalogForm(c);
                      setIsCatalogDrawerOpen(true);
                    }}
                    className="p-1 rounded hover:bg-surface-700 text-surface-400 hover:text-surface-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center grayscale opacity-40">
              <Database className="w-10 h-10 mx-auto mb-2 text-surface-600" />
              <p className="text-xs italic text-surface-500">No se encontraron catálogos</p>
            </div>
          )}
        </div>
      </aside>

      {/* --- Contenido Derecha: Items del Catálogo --- */}
      <main className="flex-1 flex flex-col bg-surface-bg/30">
        {selectedCatalog ? (
          <>
            <div className="p-8 border-b border-surface-800 flex items-end justify-between shrink-0 bg-surface-950/20">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-display font-black text-surface-100 tracking-tight">
                    {selectedCatalog.name}
                  </h1>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${selectedCatalog.scope === 'global'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-amber-500/20 text-amber-400'
                      }`}
                  >
                    {selectedCatalog.scope}
                  </span>

                  {selectedCatalog.isOverridable && (
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                      Overridable
                    </span>
                  )}

                  {!selectedCatalog.active && (
                    <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                      Inactivo
                    </span>
                  )}
                </div>

                <p className="text-sm text-surface-400 max-w-2xl">
                  {selectedCatalog.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setItemForm({
                    key: '',
                    label: '',
                    value: '',
                    sortOrder: items.length + 1,
                    active: true,
                    metadata: {},
                  });
                  setIsItemDrawerOpen(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Item
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {itemsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 text-surface-700 animate-spin" />
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`card group transition-all hover:border-surface-600/50 p-5 flex flex-col gap-4 ${!item.active ? 'opacity-50 grayscale' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center text-brand-400 font-bold font-mono">
                            {item.key.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-black text-surface-100">{item.label}</p>
                            <p className="text-[10px] text-surface-500 font-mono">{item.value}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setItemForm(item);
                              setIsItemDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={async () => {
                              if (!item.id || !selectedCatalog?.id) return;
                              if (confirm('¿Seguro?')) {
                                await itemRepo.delete(item.id);
                                await loadItems(selectedCatalog.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="p-3 rounded-lg bg-surface-950/50 border border-surface-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-3 h-3 text-surface-600" />
                            <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none">
                              Metadata
                            </span>
                          </div>

                          <pre className="text-[10px] font-mono text-surface-400 overflow-x-auto">
                            {JSON.stringify(item.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-800/30">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-500">
                          <MoreVertical className="w-3 h-3" />
                          Orden: {item.sortOrder}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.active ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[9px] font-black text-emerald-500 uppercase">
                                Activo
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-surface-700" />
                              <span className="text-[9px] font-black text-surface-600 uppercase">
                                Inactivo
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center grayscale opacity-30 mt-20">
                  <Plus className="w-16 h-16 text-surface-700 mb-4" />
                  <h3 className="text-lg font-bold text-surface-500">Sin items definidos</h3>
                  <p className="text-sm italic text-surface-600">
                    Comienza agregando el primer valor para este catálogo.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 grayscale opacity-20">
            <Database className="w-24 h-24 text-surface-700 mb-6 animate-pulse-slow" />
            <h2 className="text-2xl font-display font-black text-surface-100 mb-2">
              Datos Maestros
            </h2>
            <p className="text-surface-400 max-w-sm">
              Selecciona un catálogo del panel izquierdo para gestionar sus valores normalizados.
            </p>
          </div>
        )}
      </main>

      {/* --- Catalog Drawer --- */}
      {isCatalogDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-surface-bg/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsCatalogDrawerOpen(false)}
          />

          <div className="relative w-[450px] bg-surface-card border-l border-surface-800 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-8 border-b border-surface-800">
              <h3 className="text-xl font-display font-black text-surface-100 flex items-center gap-3">
                {catalogForm.id ? 'Editar Catálogo' : 'Nuevo Catálogo'}
              </h3>
              <p className="text-xs text-surface-500 mt-2">
                Define las propiedades globales del catálogo maestro.
              </p>
            </div>

            <form onSubmit={handleSaveCatalog} className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                    Identificador (Key)
                  </label>
                  <input
                    type="text"
                    disabled={!!catalogForm.id}
                    className="input"
                    placeholder="ej: billing-status"
                    value={catalogForm.key}
                    onChange={(e) => setCatalogForm({ ...catalogForm, key: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                    Nombre Público
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="ej: Estados de Facturación"
                    value={catalogForm.name}
                    onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                    Descripción
                  </label>
                  <textarea
                    className="input min-h-[100px] py-3"
                    placeholder="Describe el propósito de este catálogo..."
                    value={catalogForm.description}
                    onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                      Scope
                    </label>
                    <select
                      className="input appearance-none bg-surface-950"
                      value={catalogForm.scope}
                      onChange={(e) =>
                        setCatalogForm({ ...catalogForm, scope: e.target.value as any })
                      }
                    >
                      <option value="global">Global</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                      Estado
                    </label>
                    <select
                      className="input appearance-none bg-surface-950"
                      value={catalogForm.active ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setCatalogForm({
                          ...catalogForm,
                          active: e.target.value === 'active',
                        })
                      }
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-surface-100">Permitir Overrides</p>
                    <p className="text-[10px] text-surface-500">
                      ¿Pueden los tenants extender este catálogo?
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-brand-500"
                    checked={catalogForm.isOverridable}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        isOverridable: e.target.checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="p-8 border-t border-surface-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCatalogDrawerOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary flex-1">
                  Guardar Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Item Drawer --- */}
      {isItemDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-surface-bg/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsItemDrawerOpen(false)}
          />

          <div className="relative w-[450px] bg-surface-card border-l border-surface-800 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-8 border-b border-surface-800">
              <h3 className="text-xl font-display font-black text-surface-100 flex items-center gap-3">
                {itemForm.id ? 'Editar Item' : 'Nuevo Item'}
              </h3>
              <p className="text-xs text-surface-500 mt-2">
                Define un valor normalizado para el catálogo {selectedCatalog?.name}.
              </p>
            </div>

            <form onSubmit={handleSaveItem} className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                      Llave (Key)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="ej: PENDING"
                      value={itemForm.key}
                      onChange={(e) => setItemForm({ ...itemForm, key: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                      Valor Funcional
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="ej: pen"
                      value={itemForm.value}
                      onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                    Etiqueta Visible (Label)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="ej: Pendiente de Pago"
                    value={itemForm.label}
                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                      Orden
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={itemForm.sortOrder}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          sortOrder: parseInt(e.target.value || '0', 10),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                      Estado
                    </label>
                    <select
                      className="input appearance-none bg-surface-950"
                      value={itemForm.active ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          active: e.target.value === 'active',
                        })
                      }
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                    Metadata JSON
                  </label>
                  <textarea
                    className="input min-h-[150px] font-mono text-[10px] py-3"
                    placeholder='{ "color": "#ff0000", "icon": "clock" }'
                    value={JSON.stringify(itemForm.metadata ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setItemForm({ ...itemForm, metadata: parsed });
                      } catch {
                        // Soft-fail while typing invalid JSON
                      }
                    }}
                  />
                  <p className="text-[9px] text-surface-600 flex items-center gap-2 mt-1">
                    <Info className="w-3 h-3" />
                    Debe ser un formato JSON válido para persistir.
                  </p>
                </div>
              </div>

              <div className="p-8 border-t border-surface-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemDrawerOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary flex-1">
                  Guardar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}