'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Copy, 
  Trash2,
  ChevronRight,
  Fingerprint,
  Globe,
  Building2,
  Settings2,
  CheckCircle,
  Circle
} from 'lucide-react';
import { FirestoreRolesRepository, FirestoreTenantsRepository } from '@terabound/repositories';
import type { RoleDefinition, Tenant } from '@terabound/domain';

// Permisos Mock de ejemplo (deberían venir de una configuración centralizada)
const AVAILABLE_PERMISSIONS = [
  { module: 'Plataforma', key: 'platform.admin', name: 'Super Admin' },
  { module: 'Tenants', key: 'tenants.read', name: 'Ver Tenants' },
  { module: 'Tenants', key: 'tenants.manage', name: 'Gestionar Tenants' },
  { module: 'Seguridad', key: 'security.users.read', name: 'Ver Usuarios' },
  { module: 'Seguridad', key: 'security.users.manage', name: 'Gestionar Usuarios' },
  { module: 'Seguridad', key: 'security.roles.manage', name: 'Gestionar Roles' },
  { module: 'CRM', key: 'crm.leads.read', name: 'Ver Leads' },
  { module: 'CRM', key: 'crm.leads.manage', name: 'Gestionar Leads' },
  { module: 'Finanzas', key: 'finance.invoices.read', name: 'Ver Facturas' },
  { module: 'Finanzas', key: 'finance.invoices.manage', name: 'Gestionar Facturas' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [permissionQuery, setPermissionQuery] = useState('');

  // Estados para nuevo rol
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    scope: 'platform' as 'platform' | 'tenant', // GAP 3
    isSystem: false,
    active: true,
  });

  const repo = new FirestoreRolesRepository();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const globalRoles = await repo.listGlobal();
      setRoles(globalRoles);
      if (globalRoles.length > 0 && !selectedRole) {
        setSelectedRole(globalRoles[0] || null);
      }

    } catch (err: any) {
      console.error('[Roles] Error:', err);
      setError('Error al cargar la definición de roles.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) return;

    try {
      setIsSaving(true);
      await repo.create({
        name: formData.name,
        key: formData.key,
        description: formData.description,
        scope: formData.scope,
        isSystem: formData.isSystem,
        active: true, // Campo requerido por RoleDefinition
        permissions: [],
        scopes: {},
      });

      setIsDrawerOpen(false);
      setFormData({
        name: '',
        key: '',
        description: '',
        scope: 'platform',
        isSystem: false,
        active: true,
      });
      await loadRoles();
    } catch (err: any) {
      console.error('[Roles] Create Error:', err);
      alert('Error al crear el rol.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleTogglePermission = (permissionKey: string) => {
    if (!selectedRole) return;
    const hasPermission = selectedRole.permissions.includes(permissionKey);
    const newPermissions = hasPermission 
      ? selectedRole.permissions.filter(p => p !== permissionKey)
      : [...selectedRole.permissions, permissionKey];
    
    setSelectedRole({ ...selectedRole, permissions: newPermissions });
  };

  const handleSavePermissions = async () => {
     if (!selectedRole || !selectedRole.id) return;
     try {
       setIsSaving(true);
       await repo.update(selectedRole.id, { permissions: selectedRole.permissions });
       alert('Permisos actualizados correctamente.');
     } catch (err) {
       alert('Error al guardar los permisos.');
     } finally {
       setIsSaving(false);
     }
  };

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(p => 
    p.name.toLowerCase().includes(permissionQuery.toLowerCase()) ||
    p.module.toLowerCase().includes(permissionQuery.toLowerCase()) ||
    p.key.toLowerCase().includes(permissionQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Cargando matriz de control de acceso...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 relative">
      {/* Sidebar - Roles List */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xs font-black uppercase tracking-widest text-surface-500">Roles del Sistema</h2>
           <button 
             onClick={() => setIsDrawerOpen(true)}
             className="p-1 px-2 rounded bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 text-[10px] font-bold border border-brand-500/20 transition-colors"
           >
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Nuevo
           </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
          <input 
            type="text" 
            placeholder="Buscar rol..." 
            className="input text-xs pl-9 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredRoles.map(role => (
            <button
               key={role.id}
               onClick={() => setSelectedRole(role)}
               className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group
                ${selectedRole?.id === role.id 
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                  : 'bg-surface-900/50 border-surface-800 text-surface-400 hover:bg-surface-800 hover:border-surface-700'}`}
            >
               <div className="flex items-center gap-3">
                  <Fingerprint className={`w-4 h-4 ${selectedRole?.id === role.id ? 'text-brand-400' : 'text-surface-600'}`} />
                  <div>
                    <p className="text-[11px] font-bold">{role.name}</p>
                    <p className="text-[9px] text-surface-600 mt-0.5 uppercase tracking-tighter">{role.key}</p>
                  </div>
               </div>
               <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${selectedRole?.id === role.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Area - Permission Matrix */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {selectedRole ? (
          <>
            {/* Role Header */}
            <div className="p-6 border-b border-surface-800 bg-surface-950/20 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                    <ShieldAlert className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                     <h3 className="text-lg font-display font-bold text-surface-50">{selectedRole.name}</h3>
                     <p className="text-xs text-surface-500">{selectedRole.description || 'Configuración de permisos y alcances del rol.'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="btn-secondary text-[10px] uppercase font-bold py-2">
                     <Copy className="w-3.5 h-3.5 mr-2" /> Clonar
                  </button>
                  <button 
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="btn-primary text-[10px] uppercase font-bold py-2 px-6 disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                  </button>
               </div>
            </div>

            {/* Matrix Toolbar */}
            <div className="p-4 px-6 border-b border-surface-800/50 bg-surface-900/40 flex items-center gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-600" />
                  <input 
                    type="text" 
                    placeholder="Filtrar permisos..." 
                    className="w-full bg-transparent border-none text-xs text-surface-200 focus:ring-0 placeholder:text-surface-600"
                    value={permissionQuery}
                    onChange={(e) => setPermissionQuery(e.target.value)}
                  />
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-surface-600">Tipo:</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase border border-purple-500/20">
                       <Globe className="w-3 h-3" /> Global
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-surface-800 pl-4">
                    <span className="text-[10px] font-black uppercase text-surface-600">Herencia:</span>
                    <span className="text-[9px] font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">StandardUser</span>
                  </div>
               </div>
            </div>

            {/* Matrix Content */}
            <div className="flex-1 overflow-y-auto p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {/* Grouped by Module (Simulated for this implementation) */}
                  {Array.from(new Set(filteredPermissions.map(p => p.module))).map(module => (
                    <div key={module} className="space-y-4">
                       <div className="flex items-center gap-2 pb-2 border-b border-surface-800/80">
                          <Settings2 className="w-4 h-4 text-brand-500/60" />
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-surface-200">{module}</h4>
                       </div>
                       <div className="space-y-2">
                          {filteredPermissions.filter(p => p.module === module).map(permission => {
                            const isEnabled = selectedRole.permissions.includes(permission.key);
                            return (
                              <button
                                key={permission.key}
                                onClick={() => handleTogglePermission(permission.key)}
                                className={`w-full flex items-center justify-between p-2 px-3 rounded-lg border transition-all text-left
                                  ${isEnabled 
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-surface-950/20 border-surface-800 text-surface-500 hover:border-surface-700 hover:text-surface-400'}`}
                              >
                                <div>
                                  <p className="text-[11px] font-bold leading-none">{permission.name}</p>
                                  <p className="text-[9px] font-mono opacity-50 mt-1">{permission.key}</p>
                                </div>
                                {isEnabled ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-20" />}
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-surface-600 gap-4">
             <ShieldAlert className="w-16 h-16 opacity-10" />
             <p className="text-sm italic">Selecciona un rol para configurar sus permisos.</p>
          </div>
        )}
      </div>

      {/* Drawer Overlay - Nuevo Rol */}
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
                <h2 className="text-xl font-display font-bold text-surface-50">Crear Nuevo Rol</h2>
                <p className="text-sm text-surface-400 mt-1">Define un nuevo perfil de permisos para el sistema.</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Nombre del Rol</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: Auditor de Finanzas"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Key Identificadora (Slug)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="ej: finance_auditor"
                    className="input font-mono"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Alcance (Scope)</label>
                  <select 
                    className="input appearance-none bg-surface-950"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                  >
                    <option value="platform">Plataforma (Global)</option>
                    <option value="tenant">Tenant (Específico)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Descripción</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe las responsabilidades de este rol..."
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
                type="submit"
                onClick={handleCreateRole}
                disabled={isSaving || !formData.name || !formData.key}
                className="btn-primary py-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando Rol...
                  </>
                ) : 'Crear Rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

