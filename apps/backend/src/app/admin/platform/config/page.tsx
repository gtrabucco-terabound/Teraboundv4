'use client';

// ============================================================
// /admin/platform/config — Configuración de Plataforma
// Gestiona _gl_platform_config/firebase_shared
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Server, Save, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FirestorePlatformConfigRepository } from '@terabound/repositories';
import type { PlatformConfig } from '@terabound/domain';

const repo = new FirestorePlatformConfigRepository();

interface FormState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appCheckSiteKey: string;
  defaultRegion: string;
}

const EMPTY_FORM: FormState = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appCheckSiteKey: '',
  defaultRegion: '',
};

const configFields: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: 'apiKey', label: 'API Key', placeholder: 'AIza...' },
  { key: 'authDomain', label: 'Auth Domain', placeholder: 'proyecto.firebaseapp.com' },
  { key: 'projectId', label: 'Project ID', placeholder: 'mi-proyecto-firebase' },
  { key: 'storageBucket', label: 'Storage Bucket', placeholder: 'proyecto.appspot.com' },
  { key: 'messagingSenderId', label: 'Messaging Sender ID', placeholder: '123456789' },
  { key: 'appCheckSiteKey', label: 'App Check Site Key (opcional)', placeholder: '6Lc...' },
  { key: 'defaultRegion', label: 'Región por Defecto', placeholder: 'us-east1' },
];

type Status = 'idle' | 'loading' | 'saving' | 'success' | 'error';

export default function PlatformConfigPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('—');
  const [updatedBy, setUpdatedBy] = useState<string>('—');
  const [version, setVersion] = useState<number>(1);

  const loadConfig = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const config = await repo.getSharedConfig();
      if (config) {
        setForm({
          apiKey: config.apiKey ?? '',
          authDomain: config.authDomain ?? '',
          projectId: config.projectId ?? '',
          storageBucket: config.storageBucket ?? '',
          messagingSenderId: config.messagingSenderId ?? '',
          appCheckSiteKey: config.appCheckSiteKey ?? '',
          defaultRegion: config.defaultRegion ?? '',
        });
        setLastUpdated(
          config.updatedAt
            ? new Date(config.updatedAt).toLocaleString('es-AR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'
        );
        setUpdatedBy(config.updatedBy ?? '—');
        setVersion(config.version ?? 1);
      }
      setStatus('idle');
    } catch (err) {
      console.error('[PlatformConfig] Error al cargar:', err);
      setErrorMsg('No se pudo cargar la configuración desde Firestore.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    try {
      const payload: Partial<PlatformConfig> = {
        apiKey: form.apiKey,
        authDomain: form.authDomain,
        projectId: form.projectId,
        storageBucket: form.storageBucket,
        messagingSenderId: form.messagingSenderId,
        appCheckSiteKey: form.appCheckSiteKey || undefined,
        defaultRegion: form.defaultRegion || undefined,
        updatedBy: 'platform-admin',
        version: version,
      };
      await repo.updateSharedConfig(payload);
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        loadConfig(); // recarga para mostrar updatedAt actualizado
      }, 2000);
    } catch (err) {
      console.error('[PlatformConfig] Error al guardar:', err);
      setErrorMsg('No se pudo guardar la configuración. Verificá los permisos de Firestore.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';
  const isSaving = status === 'saving';
  const isBusy = isLoading || isSaving;

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
            Fuente de verdad Firebase compartida por todo el ecosistema. Documento:{' '}
            <code className="text-xs bg-surface-800 px-1.5 py-0.5 rounded font-mono text-brand-300">
              _gl_platform_config/firebase_shared
            </code>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={loadConfig}
            disabled={isBusy}
            title="Recargar desde Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isBusy}
            title="Guardar en Firestore"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Feedback de estado */}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Configuración guardada correctamente en Firestore.
        </div>
      )}
      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Formulario */}
      <div className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-surface-700/20">
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Firebase Shared Configuration
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Versión: {version}
          </span>
          {isLoading && <Loader2 className="w-3 h-3 text-surface-500 animate-spin ml-auto" />}
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
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                disabled={isBusy}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-surface-700/20 text-xs text-surface-500">
          <span>Última actualización:</span>
          <span className="text-surface-300">{lastUpdated}</span>
          <span className="mx-2">|</span>
          <span>Actualizado por:</span>
          <span className="text-surface-300">{updatedBy}</span>
        </div>
      </div>

      {/* Nota de Arquitectura */}
      <div className="card p-4 flex gap-3 text-sm">
        <span className="text-amber-400 mt-0.5">⚠</span>
        <div>
          <p className="text-surface-300 font-medium">Nota de Arquitectura</p>
          <p className="text-surface-500 text-xs mt-1">
            Esta configuración es leída por todos los módulos del ecosistema. Cualquier cambio
            impacta a HUB, CRM, Finanzas, Work Orders, Logística y RRHH. Modificar solo con
            autorización de PlatformAdmin.
          </p>
        </div>
      </div>
    </div>
  );
}
