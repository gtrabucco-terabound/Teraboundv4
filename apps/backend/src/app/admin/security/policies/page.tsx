'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Loader2, 
  AlertCircle, 
  Lock, 
  Smartphone, 
  Clock, 
  Globe, 
  Save,
  HelpCircle,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { FirestoreSecurityPoliciesRepository } from '@terabound/repositories';
import type { SecurityPolicy } from '@terabound/domain';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const repo = new FirestoreSecurityPoliciesRepository();

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await repo.list();
      setPolicies(data);
    } catch (err: any) {
      console.error('[Policies] Error:', err);
      setError('Error al cargar las políticas de seguridad global.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setPolicies(policies.map(p => 
      p.key === key ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleUpdate = async (key: string) => {
    try {
      setIsSaving(true);
      const policy = policies.find(p => p.key === key);
      if (policy) {
        await repo.update(key, { enabled: policy.enabled, config: policy.config });
        alert('Política actualizada correctamente.');
      }
    } catch (err) {
      alert('Error al guardar la política.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-surface-400 text-sm animate-pulse">Consultando directivas de endurecimiento de plataforma...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            Políticas de Seguridad Global
          </h1>
          <p className="section-subtitle mt-2">
            Configuración de directivas de autenticación, sesión y restricciones de plataforma.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Policies List */}
      <div className="space-y-6">
        {policies.length > 0 ? (
          policies.map((policy) => (
            <div key={policy.id} className="card group hover:border-brand-500/20 transition-all overflow-hidden border-l-4" style={{ borderLeftColor: policy.enabled ? '#10b981' : '#64748b' }}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl ${policy.enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-surface-800 border-surface-700'} border transition-colors`}>
                       {policy.type === 'auth' && <Smartphone className={policy.enabled ? 'text-emerald-400' : 'text-surface-500'} />}
                       {policy.type === 'session' && <Clock className={policy.enabled ? 'text-emerald-400' : 'text-surface-500'} />}
                       {policy.type === 'network' && <Globe className={policy.enabled ? 'text-emerald-400' : 'text-surface-500'} />}
                       {policy.type === 'support' && <ShieldCheck className={policy.enabled ? 'text-emerald-400' : 'text-surface-500'} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-surface-50">{policy.name}</h3>
                        <div className="px-2 py-0.5 rounded bg-surface-900 border border-surface-800 text-[10px] font-mono text-surface-500">{policy.key}</div>
                      </div>
                      <p className="text-sm text-surface-400 mt-1 max-w-lg">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <button 
                      onClick={() => handleToggle(policy.key)}
                      className={`text-2xl transition-colors ${policy.enabled ? 'text-brand-500' : 'text-surface-700 hover:text-surface-600'}`}
                    >
                      {policy.enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                    <button 
                      onClick={() => handleUpdate(policy.key)}
                      disabled={isSaving}
                      className="text-[10px] uppercase font-bold text-brand-400 hover:text-brand-300 tracking-widest flex items-center gap-2 bg-brand-500/5 px-3 py-1.5 rounded-lg border border-brand-500/10 hover:bg-brand-500/10 transition-all disabled:opacity-50"
                    >
                       <Save className="w-3.5 h-3.5" />
                       Guardar Directiva
                    </button>
                  </div>
                </div>

                {/* Policy Config Section (Dynamic) */}
                <div className="mt-6 pt-6 border-t border-surface-800/60 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(policy.config).map(([configKey, configValue]) => (
                    <div key={configKey} className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-surface-600 flex items-center gap-2">
                          {configKey.replace(/([A-Z])/g, ' $1')}
                          <HelpCircle className="w-3 h-3 opacity-30" />
                       </label>
                       <div className="relative group">
                          <input 
                            type={typeof configValue === 'number' ? 'number' : 'text'}
                            className="input text-xs font-mono py-2.5 bg-surface-950/40 border-surface-800/60 focus:border-brand-500/30"
                            value={String(configValue)}
                            onChange={(e) => {
                              // Actualizar config en el state local
                              const newValue = typeof configValue === 'number' ? Number(e.target.value) : e.target.value;
                              setPolicies(policies.map(p => 
                                p.key === policy.key ? { ...p, config: { ...p.config, [configKey]: newValue } } : p
                              ));
                            }}
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
           <div className="card py-20 flex flex-col items-center justify-center text-surface-500 text-sm italic">
             No se han definido políticas de seguridad en la plataforma.
           </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
         <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
         <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Información Crítica</h4>
            <p className="text-[11px] text-amber-500/70 mt-1 leading-relaxed">
               Cualquier cambio en las políticas de seguridad afecta globalmente a todos los niveles de acceso de la plataforma. 
               Las directivas de MFA son obligatorias para perfiles PlatformAdmin y no pueden ser desactivadas individualmente por estos usuarios.
            </p>
         </div>
      </div>
    </div>
  );
}
