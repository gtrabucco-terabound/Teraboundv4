'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

// Menú del admin según §12 de la spec
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

        {/* Versión */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-surface-700/20">
            <span className="text-[10px] text-surface-600">v0.1.0 — Control Plane</span>
          </div>
        )}
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
              <span className="text-xs text-emerald-400 font-medium">Sistema Operativo</span>
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
