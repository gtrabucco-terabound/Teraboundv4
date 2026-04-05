'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  Building2,
  ExternalLink,
  Trash2,
  History,
  Plus,
  Key
} from 'lucide-react';
import { 
  getGlobalMembershipsAction, 
  revokeMembershipAction, 
  changeMembershipRoleAction,
  createMembershipAction
} from './actions';
import { getUsersAction } from '../users/actions';
import { getRolesAction } from '../roles/actions';
import { getTenantsAction } from '../../tenants/actions';
import { MembershipStatus } from '@terabound/domain';
import type { Membership, UserRecord, Tenant, RoleDefinition } from '@terabound/domain';

const statusStyles = {
  [MembershipStatus.ACTIVE]: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: ShieldCheck },
  [MembershipStatus.BLOCKED]: { bg: 'bg-red-500/10', text: 'text-red-400', icon: ShieldAlert },
  [MembershipStatus.INVITED]: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: Users },
  [MembershipStatus.REVOKED]: { bg: 'bg-surface-800', text: 'text-surface-500', icon: ShieldAlert },
};

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para nueva membresía
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    tenantId: '',
    roleId: '',
    status: 'active' as any,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mResult, tList, uList] = await Promise.all([
        getGlobalMembershipsAction(),
        getTenantsAction(),
        getUsersAction()
      ]);
      setTenants(tList);
      setUsers(uList);
      setMemberships(mResult.memberships);
    } catch (err: any) {
      console.error('[Memberships] Error:', err);
      setError('Error al cargar el mapa de membresías globales.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles cuando cambia el tenant seleccionado en el form
  useEffect(() => {
    if (formData.tenantId) {
       loadRolesForTenant(formData.tenantId);
    } else {
       loadGlobalRoles();
    }
  }, [formData.tenantId]);

  const loadGlobalRoles = async () => {
    const r = await getRolesAction(); // Globales
    setRoles(r);
  };

  const loadRolesForTenant = async (tId: string) => {
    const [global, specific] = await Promise.all([
      getRolesAction(),
      getRolesAction(tId)
    ]);
    setRoles([...global, ...specific]);
  };

  const handleCreateMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.tenantId || !formData.roleId) return;

    try {
      setIsSaving(true);
      await createMembershipAction(formData.tenantId, {
        userId: formData.userId,
        roleId: formData.roleId,
        status: formData.status,
        invitedBy: 'admin-123',
        moduleAccess: [], // Por ahora vacío, se gestionará por políticas
      });
      setIsDrawerOpen(false);
      setFormData({ userId: '', tenantId: '', roleId: '', status: 'active' });
      await loadData();
    } catch (err) {
      alert('Error al crear la membresía.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async (tenantId: string, membershipId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas revocar este acceso?')) return;
    try {
      await revokeMembershipAction(tenantId, membershipId);
      await loadData();
    } catch (err) {
      alert('Error al revocar acceso.');
    }
  };

  const handleChangeRole = async (tenantId: string, membershipId: string, currentRole: string) => {
    const newRole = window.prompt('Ingrese el nuevo Rol ID:', currentRole);
    if (!newRole || newRole === currentRole) return;
    try {
      await changeMembershipRoleAction(tenantId, membershipId, newRole);
      await loadData();
    } catch (err) {
      alert('Error al cambiar rol.');
    }
  };

  const filteredMembers = memberships.filter(m => 
    m.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m as any).tenantId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tenants.find(t => t.id === (m as any).tenantId)?.legalName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Auditando mapeo de identidades y membresías...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
          </h1>
          <p className="section-subtitle mt-2">
            Auditoría transversal de accesos de usuarios a través de los diferentes tenants de la plataforma.
          </p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Acceso
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input 
            type="text" 
            placeholder="Buscar por usuario (UID), ID de tenant o nombre de empresa..." 
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800 text-xs font-medium text-surface-400">
          <span>Relaciones Activadas:</span>
          <span className="text-surface-100 font-bold">{memberships.length}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Memberships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((m) => {
            const tenantId = (m as any).tenantId;
            const tenant = tenants.find(t => t.id === tenantId);
            const tenantName = tenant?.legalName || 'Tenant Desconocido';
            const style = statusStyles[m.status] || statusStyles[MembershipStatus.REVOKED];
            const StatusIcon = style.icon;

            return (
              <div key={m.id} className="card group hover:border-orange-500/30 transition-all border-l-2" style={{ borderLeftColor: m.status === 'active' ? '#10b981' : '#ef4444' }}>
                <div className="p-4 border-b border-surface-800/50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-surface-500" />
                      <span className="text-xs font-bold text-surface-200 truncate max-w-[150px]">{tenantName}</span>
                   </div>
                   <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                      {m.status}
                   </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-surface-500 block">Usuario (UID)</span>
                    <div className="flex items-center justify-between text-[11px] font-mono text-surface-300 bg-surface-950/50 p-2 rounded border border-surface-800">
                      {m.userId.slice(0, 16)}...
                      <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100 cursor-pointer" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div className="space-y-1">
                       <span className="text-surface-600 font-bold uppercase hover:text-brand-400 cursor-pointer" onClick={() => handleChangeRole(tenantId, m.id!, m.roleId)}>Rol ID</span>
                       <p className="text-surface-300 font-medium truncate">{m.roleId}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-surface-600 font-bold uppercase">Invitado por</span>
                       <p className="text-surface-300 font-medium truncate">{m.invitedBy.slice(0,6)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-[10px] text-surface-500">
                    <History className="w-3.5 h-3.5" />
                    <span>Último acceso: {m.lastAccessAt ? new Date(m.lastAccessAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="p-2 bg-surface-950/30 border-t border-surface-800/40 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => handleRevoke(tenantId, m.id!)}
                     className="p-1.5 rounded hover:bg-surface-800 text-surface-400 hover:text-red-400 transition-colors" 
                     title="Revocar Acceso"
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full card py-20 flex flex-col items-center justify-center text-surface-500 text-sm italic">
            No se encontraron membresías que coincidan con la auditoría.
          </div>
        )}
      </div>

      {/* Drawer Overlay - Nueva Membresía */}
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
                <h2 className="text-xl font-display font-bold text-surface-50">Gestionar Acceso Transversal</h2>
                <p className="text-sm text-surface-400 mt-1">Vincula un usuario con una empresa y asigna privilegios.</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateMembership} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                {/* Usuario Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">1. Usuario (Global)</label>
                  <select 
                    required
                    className="input bg-surface-950"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">-- Seleccionar Usuario --</option>
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>{u.displayName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {/* Tenant Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">2. Empresa (Tenant)</label>
                  <select 
                    required
                    className="input bg-surface-950"
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  >
                    <option value="">-- Seleccionar Empresa --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.legalName}</option>
                    ))}
                  </select>
                </div>

                {/* Rol Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">3. Rol Asignado</label>
                  <select 
                    required
                    className="input bg-surface-950 border-orange-500/20"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value="">-- Seleccionar Rol --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.key}>
                        {r.name} - [{r.scope === 'platform' ? 'SISTEMA' : 'TENANT'}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">4. Estado de Invitación</label>
                  <select 
                    className="input bg-surface-950"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active">Activo Inmediato</option>
                    <option value="invited">Invitar (Pendiente)</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-surface-800 grid grid-cols-2 gap-3 bg-surface-900/50 backdrop-blur-sm shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn-secondary py-3 font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                onClick={handleCreateMembership}
                disabled={isSaving || !formData.userId || !formData.tenantId || !formData.roleId}
                className="btn-primary py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Activar Acceso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
