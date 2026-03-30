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
  Key
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
      setError('Error al cargar la lista de usuarios globales.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    try {
      const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
      await repo.update(user.userId, { status: newStatus });
      await loadUsers();
    } catch (err) {
      alert('Error al cambiar el estado del usuario.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Cargando directorio de identidad global...</p>
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
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="section-subtitle mt-2">
            Administración de identidades globales, control de acceso y auditoría de perfiles.
          </p>
        </div>
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
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.globalType === GlobalType.PLATFORM_ADMIN ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-surface-800 text-surface-400 border border-surface-700'
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
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors border border-surface-800 hover:border-surface-700 ${
                            user.status === UserStatus.ACTIVE ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
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
    </div>
  );
}
