import {
  Server,
  Building2,
  Shield,
  Activity,
  Boxes,
  Users,
} from 'lucide-react';

const stats = [
  { label: 'Módulos Registrados', value: '7', icon: Boxes, color: 'brand' },
  { label: 'Tenants Activos', value: '0', icon: Building2, color: 'emerald' },
  { label: 'Usuarios Globales', value: '1', icon: Users, color: 'violet' },
  { label: 'Eventos (24h)', value: '0', icon: Activity, color: 'amber' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', glow: 'shadow-brand-500/5' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'shadow-violet-500/5' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/5' },
};

const quickActions = [
  { label: 'Configuración de Plataforma', href: '/admin/platform/config', icon: Server, desc: 'Gestionar Firebase y config global' },
  { label: 'Gestión de Módulos', href: '/admin/platform/modules', icon: Boxes, desc: 'Registrar y activar módulos' },
  { label: 'Administrar Tenants', href: '/admin/tenants', icon: Building2, desc: 'Alta, edición y suspensión' },
  { label: 'Seguridad IAM', href: '/admin/security/users', icon: Shield, desc: 'Usuarios, roles y permisos' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-100 tracking-tight">
          Control Plane
        </h1>
        <p className="text-surface-400 mt-1">
          Panel de gobierno del ecosistema Terabound ERP Multi-tenant
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const colors = colorMap[stat.color]!;
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card-elevated p-5 flex items-start justify-between hover:scale-[1.02] transition-transform duration-200 shadow-lg ${colors.glow}`}
            >
              <div>
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="font-display text-3xl font-bold text-surface-100">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.href}
                href={action.href}
                className="card p-5 flex items-center gap-4 hover:bg-surface-800/60 transition-all duration-200 group"
              >
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="font-medium text-surface-100 group-hover:text-brand-300 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">{action.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Estado del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/40">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <div>
              <p className="text-sm font-medium text-surface-200">Firestore</p>
              <p className="text-xs text-surface-500">Conectado</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/40">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <div>
              <p className="text-sm font-medium text-surface-200">Firebase Auth</p>
              <p className="text-xs text-surface-500">Operativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/40">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <div>
              <p className="text-sm font-medium text-surface-200">Cloud Functions</p>
              <p className="text-xs text-surface-500">Disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
