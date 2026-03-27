'use client';

// ============================================================
// /login — Pantalla de acceso Terabound Backend
// Diseño Premium con Glassmorphism y Animaciones
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@terabound/firebase-client';
import { LogIn, Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.push('/admin');
    } catch (err: any) {
      console.error('[Login] Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Credenciales incorrectas. Verificá tu email y contraseña.');
      } else {
        setError('Error al iniciar sesión. Intentalo de nuevo más tarde.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      {/* Background Orbs para estética premium */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20 mb-4 ring-1 ring-white/10">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-surface-50 tracking-tight">
            Terabound <span className="text-brand-400">Admin</span>
          </h1>
          <p className="text-surface-400 text-sm mt-2 font-medium">
            Ingreso exclusivo para administradores de plataforma
          </p>
        </div>

        {/* Login Card (Glassmorphism) */}
        <div className="card-elevated p-8 bg-surface-900/40 backdrop-blur-xl border-surface-700/30 animate-fade-in-up [animation-delay:100ms]">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11 h-12 bg-surface-950/50 border-surface-700/50 focus:border-brand-500/50 focus:ring-brand-500/10"
                  placeholder="admin@terabound.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11 h-12 bg-surface-950/50 border-surface-700/50 focus:border-brand-500/50 focus:ring-brand-500/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-sm font-bold tracking-wide shadow-lg shadow-brand-500/20 overflow-hidden relative"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Ingresar al Sistema
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-surface-600 text-xs mt-8">
          &copy; 2026 Terabound Business Suite. Protegido por Firebase Security.
        </p>
      </div>
    </div>
  );
}
