'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add your credentials to .env.local');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push('/casos');
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Signed in successfully! Redirecting...');
          setTimeout(() => {
            router.push('/casos');
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#0B0B0D] mb-2">
            {mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-slate-600">
            {mode === 'signin'
              ? 'Accede a tu cuenta para gestionar casos'
              : 'Crea una cuenta para comenzar a crear casos'}
          </p>
        </div>

        {/* Supabase Not Configured Warning */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Supabase Not Configured:</span> Authentication is disabled.
              Add credentials to <code className="bg-yellow-100 px-1 rounded">.env.local</code> to enable auth.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-white text-[#5B3DF5] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-[#5B3DF5] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                disabled={!isSupabaseConfigured}
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-slate-500">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full py-3 text-sm font-semibold text-white bg-[#5B3DF5] rounded-md hover:bg-[#4A2FD5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Cargando...'
                : mode === 'signin'
                ? 'Iniciar Sesión'
                : 'Crear Cuenta'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-medium text-[#5B3DF5] hover:underline"
              >
                {mode === 'signin' ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
