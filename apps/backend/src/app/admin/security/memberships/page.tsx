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
  History
} from 'lucide-react';
import { FirestoreMembershipsRepository, FirestoreTenantsRepository } from '@terabound/repositories';
import { MembershipStatus } from '@terabound/domain';
import type { Membership, Tenant } from '@terabound/domain';

const statusStyles = {
  [MembershipStatus.ACTIVE]: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: ShieldCheck },
  [MembershipStatus.BLOCKED]: { bg: 'bg-red-500/10', text: 'text-red-400', icon: ShieldAlert },
  [MembershipStatus.INVITED]: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: Users },
  [MembershipStatus.REVOKED]: { bg: 'bg-surface-800', text: 'text-surface-500', icon: ShieldAlert },
};

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [tenants, setTenants] = useState<Record<string, string>>({}); // tenantId -> legalName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mRepo = new FirestoreMembershipsRepository();
  const tRepo = new FirestoreTenantsRepository();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // En un escenario real con muchos datos, esto se haría bajo demanda
      // Para el admin, cargamos los tenants primero para mapear nombres
      const tenantData = await tRepo.list();
      const tenantMap: Record<string, string> = {};
      tenantData.forEach(t => { if(t.id) tenantMap[t.id] = t.legalName; });
      setTenants(tenantMap);

      // Cargamos todas las membresías de todos los tenants (limitado para el demo/admin inicial)
      // Como collectionGroup requiere índices, aquí simulamos la carga por tenant o transversal
      let allMembers: Membership[] = [];
      for (const tId of Object.keys(tenantMap)) {
         const ms = await mRepo.listByTenant(tId);
         allMembers = [...allMembers, ...ms.map(m => ({ ...m, tenantId: tId } as any))];
      }
      setMemberships(allMembers);
    } catch (err: any) {
      console.error('[Memberships] Error:', err);
      setError('Error al cargar el mapa de membresías globales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (tenantId: string, membershipId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas revocar este acceso?')) return;
    try {
      await mRepo.revoke(tenantId, membershipId);
      await loadData();
    } catch (err) {
      alert('Error al revocar acceso.');
    }
  };

  const handleChangeRole = async (tenantId: string, membershipId: string, currentRole: string) => {
    const newRole = window.prompt('Ingrese el nuevo Rol ID:', currentRole);
    if (!newRole || newRole === currentRole) return;
    try {
      await mRepo.changeRole(tenantId, membershipId, newRole);
      await loadData();
    } catch (err) {
      alert('Error al cambiar rol.');
    }
  };

  const filteredMembers = memberships.filter(m => 
    m.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m as any).tenantId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenants[(m as any).tenantId]?.toLowerCase().includes(searchQuery.toLowerCase())
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
            Membresías y Accesos
          </h1>
          <p className="section-subtitle mt-2">
            Auditoría transversal de accesos de usuarios a través de los diferentes tenants de la plataforma.
          </p>
        </div>
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
            const tenantName = tenants[tenantId] || 'Tenant Desconocido';
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
    </div>
  );
}
