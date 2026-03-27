'use client';

// ============================================================
// /admin/platform/modules — Gestión de Módulos
// CRUD sobre _gl_modules. Tabla con filtros, estado, activación.
// Spec ref: §13.1
// ============================================================

import { useState, useEffect } from 'react';
import { Boxes, Plus, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { FirestoreModulesRepository } from '@terabound/repositories';
import type { ModuleDefinition } from '@terabound/domain';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  draft: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
  maintenance: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  deprecated: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
};

const categoryColors: Record<string, string> = {
  core: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  'micro-app': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  system: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function PlatformModulesPage() {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const repo = new FirestoreModulesRepository();

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setModules(data);
      setError(null);
    } catch (err: any) {
      console.error('[Modules] Error al cargar:', err);
      setError('No se pudieron cargar los módulos de plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Cargando registro de módulos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <Boxes className="w-5 h-5 text-brand-400" />
            </div>
            Registro de Módulos
          </h1>
          <p className="section-subtitle mt-2">
            Administra los módulos del ecosistema. Colección: <code className="text-xs bg-surface-800 px-1.5 py-0.5 rounded font-mono text-brand-300">_gl_modules</code>
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Registrar Módulo
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={loadModules} className="ml-auto text-xs underline hover:no-underline">Reintentar</button>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Buscar módulo por nombre o slug..."
            className="input pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="input w-auto">
            <option value="">Todos los estados</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="maintenance">Maintenance</option>
            <option value="deprecated">Deprecated</option>
          </select>
          <select className="input w-auto">
            <option value="">Todas las categorías</option>
            <option value="core">Core</option>
            <option value="micro-app">Micro-App</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/20">
                <th className="table-header text-left px-4 py-3 min-w-[200px]">Módulo</th>
                <th className="table-header text-left px-4 py-3">Slug</th>
                <th className="table-header text-left px-4 py-3">Categoría</th>
                <th className="table-header text-left px-4 py-3">Estado</th>
                <th className="table-header text-left px-4 py-3">Visibilidad</th>
                <th className="table-header text-left px-4 py-3 text-center">Versión</th>
                <th className="table-header text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.length > 0 ? (
                filteredModules.map((mod) => {
                  const sc = statusColors[mod.status] ?? statusColors['draft']!;
                  const cc = categoryColors[mod.category] ?? categoryColors['system']!;
                  return (
                    <tr key={mod.slug} className="table-row group">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <span className="text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-surface-800/50 group-hover:bg-brand-500/10 transition-colors">
                            {mod.icon || '📦'}
                          </span>
                          <span className="font-medium text-surface-100">{mod.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <code className="text-xs font-mono text-surface-400 bg-surface-800/60 px-1.5 py-0.5 rounded">
                          {mod.slug}
                        </code>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${cc}`}>
                          {mod.category}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {mod.status}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-surface-400">
                        {mod.visibility === 'tenant-available' ? 'Disponible Tenant' : 'Interno'}
                      </td>
                      <td className="table-cell text-center">
                        <span className="text-xs font-mono text-surface-400">{mod.version}</span>
                      </td>
                      <td className="table-cell text-right">
                        <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-500 italic text-sm">
                    No se encontraron módulos con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-surface-500 px-1 font-medium">
        <span>{filteredModules.length} de {modules.length} módulos registrados</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {modules.filter((m) => m.status === 'active').length} Activos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {modules.filter((m) => m.status === 'draft').length} Draft
          </span>
        </div>
      </div>
    </div>
  );
}

