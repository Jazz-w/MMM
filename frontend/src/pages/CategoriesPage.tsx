import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package, Loader2, Grid3X3, ArrowRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.getCategories();
        const categoryData = (response as { data: Category[] }).data || response;
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Échec du chargement des catégories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="flex flex-col items-center justify-center min-h-[500px] p-12">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-6" />
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-emerald-600/20 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Chargement des catégories...
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Nous préparons toutes nos catégories de produits pour vous
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-lg mx-auto p-12">
          <div className="rounded-full bg-gradient-to-br from-red-100 to-red-50 p-6 mb-8">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Grid3X3 className="h-6 w-6 text-yellow-300" />
              <span className="text-yellow-200 text-sm font-medium uppercase tracking-wide">Nos Catégories</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Explorez nos
              <span className="block text-yellow-300">Catégories</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
              Découvrez notre large gamme de produits organisés par catégories pour répondre à tous vos besoins de santé et bien-être
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune catégorie trouvée</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Il n'y a actuellement aucune catégorie disponible. Revenez plus tard pour découvrir nos produits.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.length} Catégorie{categories.length > 1 ? 's' : ''} Disponible{categories.length > 1 ? 's' : ''}
                </h2>
              </div>
              <p className="text-gray-600">
                Cliquez sur une catégorie pour voir tous les produits qu'elle contient
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category._id}
                  to={`/categories/${category.slug}`}
                  className="block group animate-fadeIn"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <Card className="h-full overflow-hidden bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <CardHeader className="p-0 relative">
                      <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-16 w-16 text-emerald-600/60" />
                          </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-all duration-300"></div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 flex-1 bg-white">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 mb-2">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-emerald-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-100 transition-all duration-300">
                          Voir les produits
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Breadcrumb for SEO */}
      <div className="hidden">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">Accueil</a></li>
            <li>/</li>
            <li>Catégories</li>
          </ol>
        </nav>
      </div>
    </div>
  );
} 