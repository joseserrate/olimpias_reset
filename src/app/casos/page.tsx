'use client';

import React, { useEffect, useState } from 'react';
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

export default function CasosPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'exportacion' as CaseCategory,
    summary: '',
    body: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    loadCases();
    checkAuth();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, selectedCategory]);

  const checkAuth = async () => {
    if (!isSupabaseConfigured) return;
    const { data: { session } } = await supabase.auth.getSession();
    setUserEmail(session?.user?.email || null);
  };

  const loadCases = async () => {
    setLoading(true);
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading cases:', error);
        setCases(mockCases);
      } else {
        setCases(data || []);
      }
    } else {
      setCases(mockCases);
    }
    
    setLoading(false);
  };

  const filterCases = () => {
    let filtered = [...cases];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(query) ||
          c.summary.toLowerCase().includes(query) ||
          c.body.toLowerCase().includes(query)
      );
    }

    setFilteredCases(filtered);
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail && isSupabaseConfigured) {
      alert('You must be signed in to create a case');
      return;
    }

    const newCase: Partial<Case> = {
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: null,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('cases')
        .insert([newCase])
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        alert('Error creating case');
        return;
      }

      setCases([data, ...cases]);
    } else {
      // Mock mode: add to local state
      const mockCase: Case = {
        ...newCase,
        id: String(Date.now()),
      } as Case;
      setCases([mockCase, ...cases]);
    }

    // Reset form
    setFormData({
      title: '',
      category: 'exportacion',
      summary: '',
      body: '',
      status: 'draft',
    });
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-[#0B0B0D] mb-3">
            Biblioteca de Casos
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Explora casos reales de implementación de inteligencia artificial empresarial en Bolivia.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Buscar casos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
              />
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="h-[42px] px-6 text-sm font-semibold text-white bg-[#5B3DF5] rounded-md hover:bg-[#4A2FD5] transition-colors whitespace-nowrap"
            >
              {showCreateForm ? 'Cancelar' : 'Crear Caso'}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#5B3DF5] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#5B3DF5] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 border border-slate-200 rounded-lg p-6 bg-slate-50">
            <h2 className="text-xl font-semibold text-[#0B0B0D] mb-4">
              Crear Nuevo Caso
            </h2>
            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resumen
                </label>
                <textarea
                  required
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción Completa
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  Crear Caso
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-sm font-semibold text-slate-600 bg-white border-2 border-slate-200 rounded-md hover:border-slate-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cases Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2 w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No se encontraron casos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCases.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-[#0B0B0D] flex-1">
                    {caso.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-[#5B3DF5] rounded-full">
                    {categoryLabels[caso.category]}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      caso.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {caso.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                
                <p className="text-slate-600 text-sm line-clamp-3">
                  {caso.summary}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
