'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
      if (mode === 'reset') {
        // Password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        setMessage('Password reset email sent! Check your inbox.');
        setEmail('');
      } else if (mode === 'signup') {
        // Validate password confirmation
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (!fullName.trim()) {
          setError('El nombre completo es requerido');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          if (data.user.identities && data.user.identities.length === 0) {
            setError('Este email ya está registrado. Por favor inicia sesión.');
          } else if (data.user.confirmed_at) {
            setMessage('Cuenta creada exitosamente! Redirigiendo...');
            setTimeout(() => {
              router.push('/casos');
            }, 1500);
          } else {
            setMessage('Cuenta creada! Por favor revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Better error message for unconfirmed email
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email no confirmado. Por favor revisa tu correo y confirma tu cuenta antes de iniciar sesión.');
          }
          throw error;
        }

        if (data.user) {
          setMessage('Sesión iniciada exitosamente! Redirigiendo...');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-16 px-6">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-slate-600 hover:text-[#5B3DF5] mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0B0B0D] mb-3">
            {mode === 'signin' ? 'Bienvenido' : mode === 'signup' ? 'Crear Cuenta' : 'Restablecer Contraseña'}
          </h1>
          <p className="text-slate-600 text-base">
            {mode === 'signin'
              ? 'Accede a tu cuenta para gestionar casos'
              : mode === 'signup'
              ? 'Crea una cuenta para comenzar a crear casos'
              : 'Ingresa tu email para recibir instrucciones'}
          </p>
        </div>

        {/* Supabase Not Configured Warning */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Supabase Not Configured:</span> Authentication is disabled.
              Add credentials to <code className="bg-yellow-100 px-1 rounded">.env.local</code> to enable auth.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          {/* Mode Toggle - Only show for signin/signup */}
          {mode !== 'reset' && (
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#5B3DF5] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#5B3DF5] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name - Only for signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none transition-all"
                  disabled={!isSupabaseConfigured}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none transition-all"
                disabled={!isSupabaseConfigured}
              />
            </div>

            {mode !== 'reset' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none transition-all"
                    disabled={!isSupabaseConfigured}
                  />
                  {mode === 'signup' && (
                    <p className="mt-2 text-xs text-slate-500">
                      Mínimo 6 caracteres
                    </p>
                  )}
                </div>

                {/* Confirm Password - Only for signup */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none transition-all"
                      disabled={!isSupabaseConfigured}
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full py-3.5 text-sm font-bold text-white bg-[#5B3DF5] rounded-xl hover:bg-[#4A2FD5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading
                ? 'Cargando...'
                : mode === 'signin'
                ? 'Iniciar Sesión'
                : mode === 'signup'
                ? 'Crear Cuenta'
                : 'Enviar Email'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center space-y-3">
            {mode === 'reset' ? (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-sm font-medium text-[#5B3DF5] hover:underline"
              >
                Volver a iniciar sesión
              </button>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="font-semibold text-[#5B3DF5] hover:underline"
                  >
                    {mode === 'signin' ? 'Crear cuenta' : 'Iniciar sesión'}
                  </button>
                </p>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="block w-full text-sm font-medium text-slate-600 hover:text-[#5B3DF5] transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

