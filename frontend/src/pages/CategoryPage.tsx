import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import * as api from '../services/api';
import { Package, Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  slug: string;
}

const defaultFilters = {
  search: '',
  categories: [] as string[],
  brands: [],
  priceRange: [0, 1000] as [number, number],
  rating: 0,
  sort: 'newest',
  inStock: false,
  hasDiscount: false,
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await api.getCategories();
        const categories = (response as { data: Category[] }).data;
        const foundCategory = categories.find(cat => cat.slug === slug);
        
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          setError('Catégorie non trouvée');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Échec du chargement de la catégorie');
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="flex flex-col items-center justify-center min-h-[500px] p-12">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-6" />
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-emerald-600/20 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Chargement de la catégorie...
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Nous préparons les produits de cette catégorie pour vous
          </p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-lg mx-auto p-12">
          <div className="rounded-full bg-gradient-to-br from-red-100 to-red-50 p-6 mb-8">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Catégorie introuvable</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error || 'Cette catégorie n\'existe pas ou a été supprimée.'}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Create filters with the category ID instead of name
  const categoryFilters = {
    ...defaultFilters,
    categories: [category._id]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
      {/* Category Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-yellow-300" />
              <span className="text-yellow-200 text-sm font-medium uppercase tracking-wide">Catégorie</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProductGrid
          filters={categoryFilters}
          className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50/30"
        />
      </div>

      {/* Breadcrumb for SEO */}
      <div className="hidden">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">Accueil</a></li>
            <li>/</li>
            <li><a href="/categories" className="hover:text-gray-700">Catégories</a></li>
            <li>/</li>
            <li>{category.name}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
} 