'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Loader2,
  AlertCircle,
  UserCheck,
  UserMinus,
  Activity,
  MoreVertical,
  Mail,
  Calendar,
  Key,
  Users,
  Plus
} from 'lucide-react';
import { FirestoreUsersRepository } from '@terabound/repositories';
import { UserStatus, GlobalType } from '@terabound/domain';
import type { UserRecord } from '@terabound/domain';

const statusStyles = {
  [UserStatus.ACTIVE]: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: UserCheck },
  [UserStatus.BLOCKED]: { bg: 'bg-red-500/10', text: 'text-red-400', icon: UserMinus },
  [UserStatus.INVITED]: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: Mail },
  [UserStatus.DISABLED]: { bg: 'bg-surface-800', text: 'text-surface-500', icon: UserMinus },
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // GAP 1: Estados para creación
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    globalType: 'readonly_auditor',
    status: 'active',
  });

  const repo = new FirestoreUsersRepository();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setUsers(data);
    } catch (err: any) {
      console.error('[Users] Error:', err);
      setError('Error al cargar el listado de usuarios de plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await repo.create({
        ...formData,
        metadata: {},
        preferences: {},
        lastLoginAt: new Date(),
      } as any);
      setIsDrawerOpen(false);
      setFormData({ email: '', displayName: '', globalType: 'readonly_auditor', status: 'active' });
      await loadUsers();
    } catch (err) {
      alert('Error al crear usuario: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      await repo.update(id, { status: newStatus as any });
      await loadUsers();
    } catch (err) {
      alert('Error al cambiar estado.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Sincronizando identidades de plataforma...</p>
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
              <Users className="w-5 h-5 text-brand-400" />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="section-subtitle mt-2">
            Administración de cuentas de plataforma, operadores de soporte y auditores.
          </p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Buscar por email, nombre o UID..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800 text-xs font-medium text-surface-400">
          <span>Total Usuarios:</span>
          <span className="text-surface-100 font-bold">{users.length}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-950/50 border-b border-surface-800">
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-surface-500">Usuario</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-surface-500">Tipo Global</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-surface-500">Estado</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-surface-500">Último Acceso</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-surface-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const style = statusStyles[user.status] || statusStyles[UserStatus.DISABLED];
                const StatusIcon = style.icon;

                return (
                  <tr key={user.userId} className="group hover:bg-surface-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center border border-surface-700 text-xs font-bold text-surface-400">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-surface-100">{user.displayName || 'Sin nombre'}</p>
                          <p className="text-[10px] text-surface-500 font-mono tracking-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.globalType === GlobalType.PLATFORM_ADMIN ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-surface-800 text-surface-400 border border-surface-700'
                        }`}>
                        <Key className="w-3 h-3" />
                        {user.globalType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${style.bg} ${style.text} text-[10px] font-bold uppercase tracking-wider`}>
                        <StatusIcon className="w-3 h-3" />
                        {user.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] text-surface-400">
                        <Calendar className="w-3 h-3 opacity-50" />
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`p-2 rounded-lg transition-colors border border-surface-800 hover:border-surface-700 ${user.status === UserStatus.ACTIVE ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          title={user.status === UserStatus.ACTIVE ? 'Bloquear Usuario' : 'Activar Usuario'}
                        >
                          {user.status === UserStatus.ACTIVE ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button className="p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:text-surface-100 transition-colors border border-surface-700/50">
                          <Activity className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-surface-500 text-sm italic">
                  No se encontraron usuarios globales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Users Table */}
      {/* ... (asumo que se mantiene el listado) */}

      {/* Drawer Overlay - Nuevo Usuario */}
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
                <h2 className="text-xl font-display font-bold text-surface-50">Crear Usuario de Plataforma</h2>
                <p className="text-sm text-surface-400 mt-1">Alta de perfiles administrativos y de soporte.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 text-surface-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="input"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Correo Electrónico</label>
                  <input
                    required
                    type="email"
                    placeholder="juan.perez@terabound.com"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-surface-500 uppercase">Tipo de Usuario (Plataforma)</label>
                  <select
                    className="input appearance-none bg-surface-950"
                    value={formData.globalType}
                    onChange={(e) => setFormData({ ...formData, globalType: e.target.value })}
                  >
                    <option value="platform_admin">Platform Admin (Superuser)</option>
                    <option value="security_admin">Security Admin</option>
                    <option value="support_operator">Support Operator</option>
                    <option value="readonly_auditor">Read-Only Auditor</option>
                  </select>
                  <p className="text-[10px] text-surface-600 italic">Nota: Los usuarios operativos (tenant_user) se crean desde las apps de cliente.</p>
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
                onClick={handleCreateUser}
                disabled={isSaving || !formData.email || !formData.displayName}
                className="btn-primary py-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creando Usuario...
                  </>
                ) : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

