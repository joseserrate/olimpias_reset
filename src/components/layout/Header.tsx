'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const Header: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <>
      {!isSupabaseConfigured && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Supabase Not Configured:</span> Using mock data.
              Add credentials to <code className="bg-yellow-100 px-1 rounded">.env.local</code> to enable full functionality.
            </p>
          </div>
        </div>
      )}
      
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-[#0B0B0D] hover:text-[#5B3DF5] transition-colors">
              Olimpias AI
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/casos" className="text-sm font-medium text-slate-600 hover:text-[#5B3DF5] transition-colors">
                Biblioteca
              </Link>
              
              {loading ? (
                <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-md"></div>
              ) : userEmail ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">{userEmail}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-slate-600 hover:text-[#5B3DF5] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-sm font-semibold text-white bg-[#5B3DF5] px-4 py-2 rounded-md hover:bg-[#4A2FD5] transition-colors"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};
