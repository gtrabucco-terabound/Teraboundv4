'use client';

import { useState, useEffect } from 'react';
import {
  Navigation,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  MoreVertical,
  Activity,
  Layout,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';
import { FirestoreNavigationRepository } from '@terabound/repositories';
import type { NavigationSchema } from '@terabound/domain';

export default function NavigationSchemasPage() {
  const [schemas, setSchemas] = useState<NavigationSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    type: 'sidebar' as const,
    active: true,
  });

  const repo = new FirestoreNavigationRepository();

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setSchemas(data);
    } catch (err) {
      console.error('[Navigation] Error:', err);
      setError('Error al cargar los esquemas de navegación.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await repo.create({
        ...formData,
      } as any);
      setIsDrawerOpen(false);
      setFormData({ key: '', name: '', type: 'sidebar', active: true });
      await loadSchemas();
    } catch (err) {
      alert('Error al crear esquema: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await repo.update(id, { active: !current });
      await loadSchemas();
    } catch (err) {
      alert('Error al actualizar estado.');
    }
  };

  const filteredSchemas = schemas.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Sincronizando esquemas de navegación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <Navigation className="w-5 h-5 text-brand-400" />
            </div>
            Esquemas de Navegación
          </h1>
          <p className="section-subtitle mt-2">
            Gestión de las estructuras de menú globales y dinámicas de la plataforma.
          </p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Esquema
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o llave..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800 text-xs font-medium text-surface-400">
          <span>Total Esquemas:</span>
          <span className="text-surface-100 font-bold">{schemas.length}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Grid de Esquemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemas.length > 0 ? (
          filteredSchemas.map((schema) => (
            <div key={schema.id} className="card group hover:border-brand-500/30 transition-all cursor-pointer overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-colors">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-surface-100">{schema.name}</h3>
                      <p className="text-[10px] text-surface-500 font-mono tracking-tight uppercase">{schema.key}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${
                    schema.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-surface-800 text-surface-500 border-surface-700'
                  }`}>
                    {schema.active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-surface-950/50 border border-surface-800/50">
                      <span className="text-[9px] text-surface-500 uppercase font-bold tracking-wider">Tipo</span>
                      <span className="text-[11px] text-surface-300 capitalize">{schema.type}</span>
                   </div>
                   <div className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-surface-950/50 border border-surface-800/50">
                      <span className="text-[9px] text-surface-500 uppercase font-bold tracking-wider">Creado</span>
                      <span className="text-[11px] text-surface-300">{new Date(schema.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-surface-800/50">
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleToggleActive(schema.id!, schema.active); }}
                       className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 transition-colors"
                     >
                       <Activity className="w-4 h-4" />
                     </button>
                     <button className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 transition-colors">
                       <Edit2 className="w-4 h-4" />
                     </button>
                   </div>
                   <button className="flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-tight">
                      Administrar Menús
                      <ChevronRight className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-surface-500 gap-2">
            <Search className="w-10 h-10 opacity-20" />
            <p className="text-sm italic">No se encontraron esquemas con ese criterio.</p>
          </div>
        )}
      </div>

      {/* Drawer Overlay - Nuevo Esquema */}
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
                <h2 className="text-xl font-display font-bold text-surface-50">Crear Esquema de Navegación</h2>
                <p className="text-sm text-surface-400 mt-1">Define el contenedor para un set de menús específicos.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Nombre del Esquema</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Sidebar Principal"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Llave Única (Key)</label>
                  <input
                    required
                    type="text"
                    placeholder="ej: main_sidebar"
                    className="input font-mono"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  />
                  <p className="text-[10px] text-surface-600">Se usará como identificador en el código de las micro-apps.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Tipo de Visualización</label>
                  <select
                    className="input appearance-none bg-surface-950"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="sidebar">Sidebar (Lateral)</option>
                    <option value="topbar">Topbar (Superior)</option>
                    <option value="hub-launcher">Hub Launcher (Mosaico)</option>
                    <option value="admin">Gestión Administrativa</option>
                  </select>
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
                type="submit"
                onClick={handleCreate}
                disabled={isSaving || !formData.key || !formData.name}
                className="btn-primary py-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creando Esquema...
                  </>
                ) : 'Crear Esquema'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
