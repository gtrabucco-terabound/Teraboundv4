'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Menu as MenuIcon,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  Layout,
  ExternalLink,
  Shield,
  Clock,
  Trash2,
  Edit2,
  GripVertical,
  Type,
  Lock,
  Tag,
  Circle
} from 'lucide-react';
import { FirestoreNavigationRepository, FirestoreNavigationItemsRepository } from '@terabound/repositories';
import type { NavigationSchema, NavigationItem } from '@terabound/domain';

// --- Subcomponente para Item de Árbol ---
function MenuItemNode({
  item,
  children,
  depth = 0,
  onEdit,
  onAddChild
}: {
  item: NavigationItem;
  children?: React.ReactNode;
  depth?: number;
  onEdit: (item: NavigationItem) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = !!children;

  return (
    <div className="space-y-1">
      <div
        className={`group flex items-center gap-3 p-2 rounded-xl transition-all border border-transparent hover:bg-surface-800/40 hover:border-surface-700/50 cursor-pointer`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded hover:bg-surface-700 transition-colors ${!hasChildren ? 'invisible' : ''}`}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-surface-400" /> : <ChevronRight className="w-3.5 h-3.5 text-surface-400" />}
          </button>

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.active ? 'bg-surface-900 border border-surface-800 text-brand-400' : 'bg-surface-950 border border-surface-900 text-surface-600'
            }`}>
            <MenuIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold truncate ${item.active ? 'text-surface-100' : 'text-surface-600'}`}>
                {item.label}
              </span>
              {item.badgeType !== 'none' && item.badgeType && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${item.badgeType === 'error' ? 'bg-red-500/20 text-red-400' :
                  item.badgeType === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                  {item.badgeType}
                </span>
              )}
            </div>
            <p className="text-[10px] text-surface-500 font-mono truncate">{item.route}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
          <button
            onClick={() => onAddChild(item.id!)}
            className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-brand-400 transition-colors"
            title="Agregar Sub-item"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && children}
    </div>
  );
}

export default function NavigationMenusPage() {
  const [schemas, setSchemas] = useState<NavigationSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<NavigationSchema | null>(null);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<NavigationItem>>({
    label: '',
    route: '',
    icon: '',
    active: true,
    sortOrder: 0,
    visibility: 'always',
    badgeType: 'none',
    requiredPermissions: []
  });

  const schemaRepo = new FirestoreNavigationRepository();
  const itemRepo = new FirestoreNavigationItemsRepository();

  useEffect(() => {
    loadSchemas();
  }, []);

  useEffect(() => {
    if (selectedSchema) {
      loadItems(selectedSchema.id!);
    } else {
      setItems([]);
    }
  }, [selectedSchema]);

  const loadSchemas = async () => {
    try {
      setLoading(true);
      const data = await schemaRepo.list();
      setSchemas(data);

      if (data.length > 0) {
        setSelectedSchema(data[0]!);
      } else {
        setSelectedSchema(null);
      }

    } catch (err) {
      setError('Error al cargar esquemas de navegación.');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (navId: string) => {
    try {
      setItemsLoading(true);
      const data = await itemRepo.listByNav(navId);
      setItems(data);
    } catch (err) {
      setError('Error al cargar ítems de menú.');
    } finally {
      setItemsLoading(false);
    }
  };

  // Construcción del árbol jerárquico
  const menuTree = useMemo(() => {
    const map = new Map<string, NavigationItem[]>();
    const roots: NavigationItem[] = [];

    items.forEach(item => {
      if (item.parentId) {
        if (!map.has(item.parentId)) map.set(item.parentId, []);
        map.get(item.parentId)!.push(item);
      } else {
        roots.push(item);
      }
    });

    const buildNode = (item: NavigationItem, depth = 0): React.ReactNode => {
      const children = map.get(item.id!);
      return (
        <MenuItemNode
          key={item.id}
          item={item}
          depth={depth}
          onEdit={(i) => { setFormData(i); setIsDrawerOpen(true); }}
          onAddChild={(pid) => { setFormData({ ...formData, parentId: pid, navId: selectedSchema?.id }); setIsDrawerOpen(true); }}
        >
          {children?.map(child => buildNode(child, depth + 1))}
        </MenuItemNode>
      );
    };

    return roots.map(root => buildNode(root));
  }, [items, selectedSchema]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema) return;

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        navId: selectedSchema.id,
        sortOrder: Number(formData.sortOrder) || 0
      } as any;

      if (formData.id) {
        await itemRepo.update(formData.id, payload);
      } else {
        await itemRepo.create(payload);
      }

      setIsDrawerOpen(false);
      setFormData({
        label: '',
        route: '',
        icon: '',
        active: true,
        sortOrder: 0,
        visibility: 'always',
        badgeType: 'none',
        requiredPermissions: []
      });
      if (!selectedSchema?.id) return;
      await loadItems(selectedSchema.id);
    } catch (err) {
      alert('Error al guardar ítem: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm">Inicializando constructor de menús...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-160px)]">
      {/* Columna Izquierda: Esquemas */}
      <aside className="w-72 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-400">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-surface-100 uppercase tracking-tighter">Esquemas</h2>
            <p className="text-[10px] text-surface-500">Selecciona el esquema activo</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2">
          {schemas.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSchema(s)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${selectedSchema?.id === s.id
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 ring-1 ring-brand-500/20'
                : 'bg-surface-900 border-surface-800 text-surface-400 hover:bg-surface-800 hover:border-surface-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold truncate">{s.name}</span>
                {s.active && <Circle className="w-1.5 h-1.5 fill-current" />}
              </div>
              <div className="text-[10px] opacity-50 font-mono uppercase mt-0.5">{s.key}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Columna Derecha: Árbol de Ítems */}
      <main className="flex-1 card flex flex-col overflow-hidden bg-surface-900/30">
        <div className="p-6 border-b border-surface-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-display font-bold text-surface-100 flex items-center gap-2">
              Constructor de Árbol: <span className="text-brand-400">{selectedSchema?.name || '...'}</span>
            </h1>
            <p className="text-xs text-surface-500 mt-1">Arrastra para reordenar (próximamente) o gestiona jerárquicamente.</p>
          </div>
          <button
            disabled={!selectedSchema}
            onClick={() => { setFormData({ ...formData, parentId: undefined, navId: selectedSchema?.id }); setIsDrawerOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ítem Raíz
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {itemsLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-surface-600 animate-spin" />
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-1">
              {menuTree}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-surface-500 gap-3 grayscale opacity-40">
              <MenuIcon className="w-12 h-12" />
              <p className="text-sm italic">Este esquema aún no tiene ítems de menú definidos.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-surface-950/30 border-t border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] text-surface-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <span>Activo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-surface-700" />
              <span>Inactivo</span>
            </div>
          </div>
          <p className="text-[10px] text-surface-600 font-mono">ModId: {selectedSchema?.key || 'null'}</p>
        </div>
      </main>

      {/* Drawer Overlay - Gestión de Ítem */}
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
                <h2 className="text-xl font-display font-bold text-surface-50">
                  {formData.id ? 'Editar Ítem de Menú' : 'Nuevo Ítem de Menú'}
                </h2>
                <p className="text-sm text-surface-400 mt-1">Configura la etiqueta, ruta y permisos de acceso.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-5">
                {/* Visual Check */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-950/50 border border-surface-800">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <MenuIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-100">{formData.label || 'Etiqueta de Menú'}</p>
                    <p className="text-[10px] text-surface-500 font-mono truncate max-w-[200px]">{formData.route || '/ruta/por/defecto'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Etiqueta (Label)</label>
                    <div className="relative">
                      <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                      <input
                        required
                        type="text"
                        placeholder="Ej: Dashboard"
                        className="input pl-10"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Orden (Sort)</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ruta (Route)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                    <input
                      required
                      type="text"
                      placeholder="Ej: /admin/dashboard"
                      className="input pl-10 font-mono text-xs"
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Visibilidad</label>
                    <select
                      className="input appearance-none bg-surface-950"
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    >
                      <option value="always">Siempre Visible</option>
                      <option value="module-enabled">Módulo Habilitado</option>
                      <option value="role-based">Basado en Roles</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Estado</label>
                    <select
                      className="input appearance-none bg-surface-950"
                      value={formData.active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Badge Notificación</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                    <select
                      className="input pl-10 appearance-none bg-surface-950"
                      value={formData.badgeType}
                      onChange={(e) => setFormData({ ...formData, badgeType: e.target.value as any })}
                    >
                      <option value="none">Sin Badge</option>
                      <option value="info">Informativo (Azul)</option>
                      <option value="warning">Advertencia (Naranja)</option>
                      <option value="error">Error/Crítico (Rojo)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Permisos Requeridos (CSV)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
                    <input
                      type="text"
                      placeholder="ej: nav.read, admin.manage"
                      className="input pl-10 text-xs"
                      value={formData.requiredPermissions?.join(', ')}
                      onChange={(e) => setFormData({ ...formData, requiredPermissions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
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
                onClick={handleSave}
                disabled={isSaving || !formData.label || !formData.route}
                className="btn-primary py-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : formData.id ? 'Actualizar Ítem' : 'Crear Ítem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
