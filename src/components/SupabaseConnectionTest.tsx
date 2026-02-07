'use client';

import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking Supabase connection...');

  useEffect(() => {
    async function testConnection() {
      if (!isSupabaseConfigured) {
        setStatus('error');
        setMessage('❌ Supabase not configured - check .env.local');
        return;
      }

      try {
        // Test connection by querying cases table
        const { count, error } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        setStatus('connected');
        setMessage(`✅ Connected to Supabase! (${count ?? 0} cases found)`);
      } catch (err: any) {
        setStatus('error');
        setMessage(`❌ Connection failed: ${err.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div 
      className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
        status === 'connected' 
          ? 'bg-green-50 text-green-800 border-green-200' 
          : status === 'error' 
          ? 'bg-red-50 text-red-800 border-red-200' 
          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {status === 'checking' && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};
