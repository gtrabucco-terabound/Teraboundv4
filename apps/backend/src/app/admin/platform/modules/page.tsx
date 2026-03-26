// ============================================================
// /admin/platform/modules — Gestión de Módulos
// CRUD sobre _gl_modules. Tabla con filtros, estado, activación.
// Spec ref: §13.1
// ============================================================

import { Boxes, Plus, Search, Filter } from 'lucide-react';

// Seeds iniciales según §18
const seedModules = [
  { slug: 'backend', name: 'Backend Admin', category: 'core', type: 'backend', status: 'active', icon: '🛡️', version: '0.1.0', visibility: 'internal' },
  { slug: 'hub', name: 'Hub', category: 'core', type: 'hub', status: 'active', icon: '🌐', version: '0.1.0', visibility: 'internal' },
  { slug: 'crm', name: 'CRM', category: 'micro-app', type: 'crm', status: 'draft', icon: '🤝', version: '0.0.1', visibility: 'tenant-available' },
  { slug: 'finanzas', name: 'Finanzas', category: 'micro-app', type: 'finanzas', status: 'draft', icon: '💰', version: '0.0.1', visibility: 'tenant-available' },
  { slug: 'work-orders', name: 'Órdenes de Trabajo', category: 'micro-app', type: 'work-orders', status: 'draft', icon: '📋', version: '0.0.1', visibility: 'tenant-available' },
  { slug: 'logistica-inventarios', name: 'Logística & Inventarios', category: 'micro-app', type: 'logistica-inventarios', status: 'draft', icon: '📦', version: '0.0.1', visibility: 'tenant-available' },
  { slug: 'rrhh', name: 'RRHH', category: 'micro-app', type: 'rrhh', status: 'draft', icon: '👥', version: '0.0.1', visibility: 'tenant-available' },
];

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

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Buscar módulo por nombre o slug..."
            className="input pl-9"
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/20">
              <th className="table-header text-left px-4 py-3">Módulo</th>
              <th className="table-header text-left px-4 py-3">Slug</th>
              <th className="table-header text-left px-4 py-3">Categoría</th>
              <th className="table-header text-left px-4 py-3">Estado</th>
              <th className="table-header text-left px-4 py-3">Visibilidad</th>
              <th className="table-header text-left px-4 py-3">Versión</th>
              <th className="table-header text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {seedModules.map((mod) => {
              const sc = statusColors[mod.status] ?? statusColors['draft']!;
              const cc = categoryColors[mod.category] ?? categoryColors['system']!;
              return (
                <tr key={mod.slug} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{mod.icon}</span>
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
                    {mod.visibility}
                  </td>
                  <td className="table-cell">
                    <span className="text-xs font-mono text-surface-400">{mod.version}</span>
                  </td>
                  <td className="table-cell text-right">
                    <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-surface-500 px-1">
        <span>{seedModules.length} módulos registrados</span>
        <span>{seedModules.filter((m) => m.status === 'active').length} activos · {seedModules.filter((m) => m.status === 'draft').length} en draft</span>
      </div>
    </div>
  );
}
