// ============================================================
// /admin/platform/config — Configuración de Plataforma
// Gestiona _gl_platform_config/firebase_shared
// ============================================================

import { Server, Save, RefreshCw } from 'lucide-react';

const configFields = [
  { key: 'apiKey', label: 'API Key', placeholder: 'AIza...' },
  { key: 'authDomain', label: 'Auth Domain', placeholder: 'proyecto.firebaseapp.com' },
  { key: 'projectId', label: 'Project ID', placeholder: 'mi-proyecto-firebase' },
  { key: 'storageBucket', label: 'Storage Bucket', placeholder: 'proyecto.appspot.com' },
  { key: 'messagingSenderId', label: 'Messaging Sender ID', placeholder: '123456789' },
  { key: 'appCheckSiteKey', label: 'App Check Site Key (opcional)', placeholder: '6Lc...' },
  { key: 'defaultRegion', label: 'Región por Defecto', placeholder: 'us-east1' },
];

export default function PlatformConfigPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <Server className="w-5 h-5 text-brand-400" />
            </div>
            Configuración de Plataforma
          </h1>
          <p className="section-subtitle mt-2">
            Fuente de verdad Firebase compartida por todo el ecosistema. Documento: <code className="text-xs bg-surface-800 px-1.5 py-0.5 rounded font-mono text-brand-300">_gl_platform_config/firebase_shared</code>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
          <button className="btn-primary">
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-surface-700/20">
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Firebase Shared Configuration
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Versión: 1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {configFields.map((field) => (
            <div key={field.key} className={field.key === 'apiKey' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                className="input"
                readOnly
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-surface-700/20 text-xs text-surface-500">
          <span>Última actualización:</span>
          <span className="text-surface-300">—</span>
          <span className="mx-2">|</span>
          <span>Actualizado por:</span>
          <span className="text-surface-300">—</span>
        </div>
      </div>

      {/* Nota */}
      <div className="card p-4 flex gap-3 text-sm">
        <span className="text-amber-400 mt-0.5">⚠</span>
        <div>
          <p className="text-surface-300 font-medium">Nota de Arquitectura</p>
          <p className="text-surface-500 text-xs mt-1">
            Esta configuración es leída por todos los módulos del ecosistema. Cualquier cambio impacta a HUB,
            CRM, Finanzas, Work Orders, Logística y RRHH. Modificar solo con autorización de PlatformAdmin.
          </p>
        </div>
      </div>
    </div>
  );
}
