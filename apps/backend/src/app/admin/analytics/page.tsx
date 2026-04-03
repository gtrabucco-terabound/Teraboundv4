'use client';

import { 
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Building2,
  RefreshCw,
  MoreVertical,
  CalendarDays
} from 'lucide-react';
import type { Metric } from '@terabound/domain';

// Mock Data para la UI Shell de Analytics
const MOCK_METRICS: Metric[] = [
  { id: 'm-001', key: 'active_users.daily', scope: 'platform', value: 1240, unit: 'users', measuredAt: new Date() },
  { id: 'm-002', key: 'api_requests', scope: 'platform', value: 3.2, unit: 'millions', measuredAt: new Date() },
  { id: 'm-003', key: 'storage_used', scope: 'tenant', tenantId: 'tn-alpha', value: 450, unit: 'GB', measuredAt: new Date() },
  { id: 'm-004', key: 'errors.critical', scope: 'platform', value: 12, unit: 'events', measuredAt: new Date() },
];

export default function AnalyticsPage() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-teal-400" />
            Global Analytics
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Telemetría, métricas de plataforma y KPIs agnósticos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2">
            <CalendarDays className="w-4 h-4 mr-2" /> Últimos 30 días
          </button>
          <button className="p-2 rounded hover:bg-surface-800 transition-colors">
             <RefreshCw className="w-5 h-5 text-surface-400" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Card 1 */}
         <div className="card p-5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-surface-800/30">
               <Users className="w-24 h-24" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2 relative z-10">Usuarios Activos (DAU)</p>
            <div className="flex items-baseline gap-2 relative z-10">
               <h2 className="text-3xl font-display font-black text-surface-50">1,240</h2>
               <span className="text-xs font-bold text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +14%</span>
            </div>
         </div>
         {/* Card 2 */}
         <div className="card p-5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-surface-800/30">
               <Building2 className="w-24 h-24" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2 relative z-10">Tenants Facturables</p>
            <div className="flex items-baseline gap-2 relative z-10">
               <h2 className="text-3xl font-display font-black text-surface-50">84</h2>
               <span className="text-xs font-bold text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +2</span>
            </div>
         </div>
         {/* Card 3 */}
         <div className="card p-5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-surface-800/30">
               <Activity className="w-24 h-24" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2 relative z-10">API Requests (24h)</p>
            <div className="flex items-baseline gap-2 relative z-10">
               <h2 className="text-3xl font-display font-black text-surface-50">3.2M</h2>
               <span className="text-xs font-bold text-surface-500 flex items-center">Estable</span>
            </div>
         </div>
         {/* Card 4 */}
         <div className="card p-5 relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2 relative z-10">Storage de Plataforma</p>
            <div className="flex items-baseline gap-2 relative z-10">
               <h2 className="text-3xl font-display font-black text-surface-50">1.8</h2>
               <span className="text-sm font-bold text-surface-400 flex items-center">TB</span>
            </div>
            <div className="w-full bg-surface-900 rounded-full h-1.5 mt-4">
              <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
         </div>
      </div>

      {/* Main Charts Area (Mock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <div className="lg:col-span-2 card p-6 flex flex-col min-h-[300px]">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-surface-300">Uso de Plataforma vs Tiempo</h3>
                <button><MoreVertical className="w-4 h-4 text-surface-500" /></button>
             </div>
             <div className="flex-1 flex items-center justify-center border-2 border-dashed border-surface-800 rounded-xl bg-surface-900/30">
                <p className="text-sm text-surface-500 font-mono">[ Espacio para Gráfico de Líneas (e.g., Recharts) ]</p>
             </div>
         </div>

         <div className="card p-6 flex flex-col min-h-[300px]">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-surface-300">Top Tenants (Uso)</h3>
             </div>
             <div className="flex-1 flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-400">
                           {i}
                         </div>
                         <p className="text-sm font-bold text-surface-200">tn-empresa-{i}</p>
                      </div>
                      <p className="text-xs font-mono text-teal-400">{1000 - i * 150} req/s</p>
                   </div>
                ))}
             </div>
         </div>

      </div>

      {/* Raw Metrics Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 bg-surface-900/40">
           <h3 className="text-sm font-bold uppercase tracking-widest text-surface-300">Raw Telemetry</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-950/50 border-b border-surface-800">
              <th className="p-4 text-xs font-black uppercase text-surface-500">Métrica (Key)</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500">Valor</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500">Contexto</th>
              <th className="p-4 text-xs font-black uppercase text-surface-500 text-right">Última Escucha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {MOCK_METRICS.map((metric) => (
              <tr key={metric.id} className="hover:bg-surface-800/20">
                <td className="p-4">
                  <p className="font-mono text-xs font-bold text-teal-300 mb-0.5">{metric.key}</p>
                </td>
                <td className="p-4">
                  <p className="font-display font-bold text-lg text-surface-100">{metric.value} <span className="text-xs text-surface-500 font-sans uppercase tracking-wider">{metric.unit}</span></p>
                </td>
                <td className="p-4 text-sm text-surface-400">
                   <span className="px-2.5 py-0.5 rounded-full bg-surface-800 text-[10px] font-bold uppercase mr-2">{metric.scope}</span>
                   {metric.tenantId && <span>{metric.tenantId}</span>}
                </td>
                <td className="p-4 text-right text-xs text-surface-500 font-mono">
                  {metric.measuredAt.toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
