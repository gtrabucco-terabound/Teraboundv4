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
import type { RoleDefinition, Tenant } from '@terabound/domain';
import { Permissions } from '@terabound/config';
import { createRoleAction, updateRoleAction, getRolesAction } from './actions';
import { getTenantsAction } from '../../tenants/actions';

// ✅ FIX: parsing seguro (NO rompe TypeScript)
const AVAILABLE_PERMISSIONS = Object.entries(Permissions).map(([_, value]) => {
  const parts = value.split('.');

  const moduleName = parts[0] ?? 'unknown';
  const entity = parts[1] ?? '';
  const action = parts[2] ?? '';

  return {
    module: moduleName.toUpperCase(),
    key: value,
    name: `${entity} ${action}`.replace(/_/g, ' ').trim(),
  };
});

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [permissionQuery, setPermissionQuery] = useState('');
  const [contextTenantId, setContextTenantId] = useState<string>('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    scope: 'platform' as 'platform' | 'tenant',
    selectedTenantId: '',
    isSystem: false,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, [contextTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [globalRoles, tenantList] = await Promise.all([
        getRolesAction(contextTenantId || undefined),
        getTenantsAction()
      ]);

      setRoles(globalRoles);
      setTenants(tenantList);

      if (globalRoles.length > 0 && !selectedRole) {
        setSelectedRole(globalRoles[0] || null);
      }
    } catch (err: any) {
      console.error('[Roles] Error:', err);
      setError('Error al cargar la matriz de seguridad.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) return;

    try {
      setIsSaving(true);

      await createRoleAction({
        name: formData.name,
        key: formData.key,
        description: formData.description,
        scope: formData.scope,
        isSystem: formData.isSystem,
        active: true,
        permissions: [],
        scopes: {},
      }, formData.scope === 'tenant' ? formData.selectedTenantId : undefined);

      setIsDrawerOpen(false);
      setFormData({
        name: '',
        key: '',
        description: '',
        scope: 'platform',
        selectedTenantId: '',
        isSystem: false,
        active: true,
      });

      await loadData();
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

      await updateRoleAction(
        selectedRole.id,
        { permissions: selectedRole.permissions },
        contextTenantId || undefined
      );

      alert('Permisos actualizados correctamente.');
    } catch (err) {
      alert('Error al guardar los permisos.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(p =>
    p.name.toLowerCase().includes(permissionQuery.toLowerCase()) ||
    p.module.toLowerCase().includes(permissionQuery.toLowerCase()) ||
    p.key.toLowerCase().includes(permissionQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">
          Cargando matriz de control de acceso...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 relative">

      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">

        <select
          className="input text-xs"
          value={contextTenantId}
          onChange={(e) => {
            setContextTenantId(e.target.value);
            setSelectedRole(null);
          }}
        >
          <option value="">PLATAFORMA</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>
              {t.legalName}
            </option>
          ))}
        </select>

        {filteredRoles.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className="p-2 border rounded"
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className="flex-1">

        {selectedRole && (
          <>
            <h2>{selectedRole.name}</h2>

            <input
              type="text"
              placeholder="Buscar permiso"
              value={permissionQuery}
              onChange={(e) => setPermissionQuery(e.target.value)}
            />

            <div>
              {filteredPermissions.map(p => {
                const enabled = selectedRole.permissions.includes(p.key);

                return (
                  <button
                    key={p.key}
                    onClick={() => handleTogglePermission(p.key)}
                  >
                    {p.name} {enabled ? '✅' : '❌'}
                  </button>
                );
              })}
            </div>

            <button onClick={handleSavePermissions}>
              Guardar
            </button>
          </>
        )}

      </div>
    </div>
  );
}