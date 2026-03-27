'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@terabound/firebase-client';
import { useAuth } from '@terabound/auth';
import {
  LayoutDashboard,
  Server,
  Boxes,
  ToggleLeft,
  Globe,
  Rocket,
  Building2,
  Shield,
  Menu as MenuIcon,
  Navigation,
  Database,
  FileSearch,
  Activity,
  Wrench,
  Zap,
  BarChart3,
  ChevronRight,
  X,
  LogOut,
  Loader2,
} from 'lucide-react';

// Menú del admin según §12 de la spec
// ... (mantenemos la variable navigation igual)
const navigation = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Platform',
    icon: Server,
    children: [
      { label: 'Configuración', href: '/admin/platform/config', icon: Server },
      { label: 'Módulos', href: '/admin/platform/modules', icon: Boxes },
      { label: 'Feature Flags', href: '/admin/platform/feature-flags', icon: ToggleLeft },
      { label: 'Ambientes', href: '/admin/platform/environments', icon: Globe },
      { label: 'Releases', href: '/admin/platform/releases', icon: Rocket },
    ],
  },
  {
    label: 'Tenants',
    icon: Building2,
    href: '/admin/tenants',
  },
  {
    label: 'Seguridad',
    icon: Shield,
    children: [
      { label: 'Usuarios', href: '/admin/security/users', icon: Shield },
      { label: 'Memberships', href: '/admin/security/memberships', icon: Shield },
      { label: 'Roles', href: '/admin/security/roles', icon: Shield },
      { label: 'Políticas', href: '/admin/security/policies', icon: Shield },
    ],
  },
  {
    label: 'Navegación',
    icon: Navigation,
    children: [
      { label: 'Esquemas', href: '/admin/ui/navigation', icon: Navigation },
      { label: 'Menús', href: '/admin/ui/menus', icon: MenuIcon },
    ],
  },
  {
    label: 'Datos Maestros',
    icon: Database,
    href: '/admin/master-data/catalogs',
  },
  {
    label: 'Gobierno de Datos',
    icon: FileSearch,
    children: [
      { label: 'Entidades', href: '/admin/data/entities', icon: FileSearch },
      { label: 'Relaciones', href: '/admin/data/relationships', icon: FileSearch },
      { label: 'Validaciones', href: '/admin/data/validation', icon: FileSearch },
    ],
  },
  {
    label: 'Auditoría',
    icon: Activity,
    children: [
      { label: 'Log', href: '/admin/audit/log', icon: Activity },
      { label: 'Eventos', href: '/admin/audit/events', icon: Activity },
    ],
  },
  {
    label: 'Operaciones',
    icon: Wrench,
    children: [
      { label: 'Jobs', href: '/admin/operations/jobs', icon: Wrench },
      { label: 'Errores', href: '/admin/operations/errors', icon: Wrench },
      { label: 'Incidentes', href: '/admin/operations/incidents', icon: Wrench },
    ],
  },
  {
    label: 'Automatización',
    icon: Zap,
    href: '/admin/automation/rules',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
  },
];

function SidebarItem({
  item,
  pathname,
  collapsed,
}: {
  item: (typeof navigation)[number];
  pathname: string;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const hasChildren = 'children' in item && item.children;
  const isActive = item.href ? pathname === item.href : item.children?.some((c) => pathname === c.href);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
        >
          <Icon className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              />
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-4 mt-0.5 space-y-0.5 animate-fade-in">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`sidebar-item text-xs py-2 ${pathname === child.href ? 'active' : ''}`}
              >
                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href!} className={`sidebar-item ${isActive ? 'active' : ''}`}>
      <Icon className="w-4.5 h-4.5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm font-medium animate-pulse">Verificando seguridad...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col
          bg-surface-950/95 backdrop-blur-xl border-r border-surface-700/20
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-700/20">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
            <span className="text-white font-display font-bold text-sm">T</span>
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <span className="font-display font-bold text-sm text-surface-100 tracking-tight">
                TERABOUND
              </span>
              <span className="block text-[10px] text-surface-500 -mt-0.5">Backend Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-1 rounded hover:bg-surface-800 transition-colors"
          >
            {sidebarCollapsed ? (
              <MenuIcon className="w-4 h-4 text-surface-400" />
            ) : (
              <X className="w-4 h-4 text-surface-400" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navigation.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={pathname} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* Footer (Logout) */}
        <div className="p-2 border-t border-surface-700/20 space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 py-2 flex items-center gap-3 mb-1">
               <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-brand-400 uppercase">
                    {user.email?.charAt(0) || 'A'}
                  </span>
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-surface-200 truncate">{user.email}</p>
                  <p className="text-[9px] text-surface-500 truncate">Admin Conectado</p>
               </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/5 ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Cerrar Sesión"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
          {!sidebarCollapsed && (
            <div className="px-4 py-2 mt-1">
              <span className="text-[10px] text-surface-600 block">v0.1.0 — Control Plane</span>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-surface-950/80 backdrop-blur-lg border-b border-surface-700/15">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <span className="text-surface-600">/</span>
            {pathname.split('/').filter(Boolean).map((segment, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <span className={i === arr.length - 1 ? 'text-surface-200 font-medium' : ''}>
                  {segment}
                </span>
                {i < arr.length - 1 && <span className="text-surface-600">/</span>}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-xs text-emerald-400 font-medium">Sistema Inteligente</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
