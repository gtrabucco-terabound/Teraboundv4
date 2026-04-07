'use client';

import { useState } from 'react';
import { useAuth } from '@terabound/auth';
import { Shield, Key, Loader2, ArrowRight, Github, Chrome } from 'lucide-react';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email, password);
      window.location.href = '/';
    } catch (err: any) {
      console.error('[Login Error]', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error de conexión o cuenta no autorizada.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface-950 font-sans selection:bg-brand-500/30">
      
      {/* Left Side: Visual & Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-surface-900 border-r border-surface-800/50">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
           <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full animate-pulse-slow"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Shield className="w-10 h-10 text-brand-500" />
          <h1 className="text-3xl font-display font-black text-surface-50 tracking-tighter uppercase italic">Terabound <span className="text-brand-500">Hub</span></h1>
        </div>

        <div className="relative z-10 space-y-4">
           <h2 className="text-4xl font-display font-black text-surface-50 leading-tight">
             Navega con <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Aislamiento Total</span>
           </h2>
           <p className="text-surface-400 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-widest opacity-60 italic">
             Infraestructura de identidad y contexto unificado para el ecosistema ERP de alto rendimiento.
           </p>
        </div>

        <div className="relative z-10 text-[10px] font-mono text-surface-700 uppercase tracking-widest">
           &copy; 2026 Terabound Enterprise Systems — Secure Gatekeeper
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-10 animate-fade-in-up">
           
           <div className="text-center lg:text-left space-y-2">
              <h3 className="text-2xl font-display font-black text-surface-50">Acceso HUB</h3>
              <p className="text-sm text-surface-500">Ingresa tus credenciales de plataforma para continuar.</p>
           </div>

           <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-surface-600 tracking-widest px-1">Email</label>
                 <input 
                   type="email" 
                   required
                   className="input" 
                   placeholder="nombre@empresa.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-surface-600 tracking-widest">Password</label>
                    <a href="#" className="text-[10px] font-black uppercase text-brand-500 hover:text-brand-400 transition-colors">¿Olvidaste?</a>
                 </div>
                 <input 
                   type="password" 
                   required
                   className="input" 
                   placeholder="••••••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                 />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                   {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full group py-4 hover:shadow-brand-500/40"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Key className="w-4 h-4" />
                    INGRESAR AL ECOSISTEMA
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
           </form>

           <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-800/50"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-surface-950 px-4 text-surface-600">O ingresa con</span></div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => signInWithGoogle()}
                className="btn-secondary py-3 text-xs flex items-center justify-center gap-2"
              >
                <Chrome className="w-4 h-4" /> Google
              </button>
              <button className="btn-secondary py-3 text-xs flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
                <Github className="w-4 h-4" /> Github
              </button>
           </div>

           <p className="text-center text-[10px] text-surface-600 uppercase font-black tracking-widest">
              ¿No tienes cuenta? <a href="#" className="text-brand-500 hover:text-brand-400">Solicitar Acceso SRE</a>
           </p>

        </div>
      </div>

    </div>
  );
}
