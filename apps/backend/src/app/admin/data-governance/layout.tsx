'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Database, 
  Link as LinkIcon, 
  CheckSquare 
} from 'lucide-react';

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Entidades',
      href: '/admin/data-governance/entities',
      icon: Database,
    },
    {
      name: 'Relaciones',
      href: '/admin/data-governance/relationships',
      icon: LinkIcon,
    },
    {
      name: 'Validaciones',
      href: '/admin/data-governance/validations',
      icon: CheckSquare,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header local del módulo */}
      <div className="px-8 py-4 border-b border-surface-800 bg-surface-950/40 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 shadow-[0_0_15px_rgba(51,141,255,0.1)]">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg font-display font-black text-surface-100 uppercase tracking-tight">
              Gobierno de Datos
            </h1>
            <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest leading-none mt-1">
              Data Control Plane & Registry
            </p>
          </div>
        </div>

        {/* Mini tabs de navegación */}
        <nav className="flex items-center gap-1 p-1 bg-surface-950 border border-surface-800 rounded-xl">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-surface-800 text-surface-100 shadow-lg'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Contenido principal se desplaza aquí */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
