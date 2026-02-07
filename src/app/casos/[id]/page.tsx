'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { mockCases } from '@/lib/mockCases';
import { Case, CaseCategory } from '@/types/case';

const categories: CaseCategory[] = [
  'exportacion',
  'camaras',
  'cumplimiento',
  'finanzas',
  'operaciones',
  'gobierno',
];

const categoryLabels: Record<CaseCategory, string> = {
  exportacion: 'Exportación',
  camaras: 'Cámaras',
  cumplimiento: 'Cumplimiento',
  finanzas: 'Finanzas',
  operaciones: 'Operaciones',
  gobierno: 'Gobierno',
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [caso, setCaso] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'exportacion' as CaseCategory,
    summary: '',
    body: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    loadCase();
    checkAuth();
  }, [resolvedParams.id]);

  const checkAuth = async () => {
    if (!isSupabaseConfigured) return;
    const { data: { session } } = await supabase.auth.getSession();
    setUserEmail(session?.user?.email || null);
  };

  const loadCase = async () => {
    setLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) {
        console.error('Error loading case:', error);
        const mockCase = mockCases.find((c) => c.id === resolvedParams.id);
        setCaso(mockCase || null);
      } else {
        setCaso(data);
      }
    } else {
      const mockCase = mockCases.find((c) => c.id === resolvedParams.id);
      setCaso(mockCase || null);
    }

    setLoading(false);
  };

  const handleEdit = () => {
    if (!caso) return;
    setFormData({
      title: caso.title,
      category: caso.category,
      summary: caso.summary,
      body: caso.body,
      status: caso.status,
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso) return;

    const updatedCase = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('cases')
        .update(updatedCase)
        .eq('id', caso.id);

      if (error) {
        console.error('Error updating case:', error);
        alert('Error updating case');
        return;
      }
    }

    setCaso({ ...caso, ...updatedCase });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!caso) return;
    
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este caso? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caso.id);

      if (error) {
        console.error('Error deleting case:', error);
        alert('Error deleting case');
        return;
      }
    }

    router.push('/casos');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#0B0B0D] mb-4">
              Caso no encontrado
            </h1>
            <Link
              href="/casos"
              className="text-[#5B3DF5] hover:underline"
            >
              Volver a la biblioteca
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Back Link */}
        <Link
          href="/casos"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#5B3DF5] mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la biblioteca
        </Link>

        {isEditing ? (
          /* Edit Form */
          <div>
            <h1 className="text-3xl font-semibold text-[#0B0B0D] mb-8">
              Editar Caso
            </h1>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as CaseCategory,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resumen
                </label>
                <textarea
                  required
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción Completa
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'draft' | 'published',
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#5B3DF5] rounded-md hover:bg-[#4A2FD5] transition-colors"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 text-sm font-semibold text-slate-600 bg-white border-2 border-slate-200 rounded-md hover:border-slate-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Read View */
          <div>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-semibold text-[#0B0B0D] mb-4">
                {caso.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-[#5B3DF5] rounded-full">
                  {categoryLabels[caso.category]}
                </span>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    caso.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {caso.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(caso.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Action Buttons */}
              {(userEmail || !isSupabaseConfigured) && (
                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2 text-sm font-semibold text-white bg-[#5B3DF5] rounded-md hover:bg-[#4A2FD5] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 text-sm font-semibold text-red-600 bg-white border-2 border-red-200 rounded-md hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#0B0B0D] mb-3">
                  Resumen
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {caso.summary}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#0B0B0D] mb-3">
                  Descripción Completa
                </h2>
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {caso.body}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
