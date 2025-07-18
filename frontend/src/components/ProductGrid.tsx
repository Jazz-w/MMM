import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import ProductCard from './ProductCard';
import useStore from '../store/useStore';
import { Loader2, Package, TrendingUp, Star } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{ url: string; isMain: boolean }>;
  category: string;
  stock: number;
  brand?: string;
  averageRating?: number;
  discount?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{ url: string; isMain: boolean }>;
  category: { name: string };
  stock: number;
  brand?: string;
  averageRating?: number;
  discount?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

interface ProductResponse {
  products: ApiProduct[];
  currentPage: number;
  totalPages: number;
  total: number;
}

interface FilterState {
  search: string;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  rating: number;
  sort: string;
  inStock: boolean;
  hasDiscount: boolean;
}

interface ProductGridProps {
  categoryId?: string;
  searchQuery?: string;
  filters?: FilterState;
  className?: string;
}

export default function ProductGrid({ 
  categoryId, 
  searchQuery, 
  filters,
  className = "" 
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const { addToWishlist } = useStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        
        // Legacy support for direct props
        if (categoryId) params.category = categoryId;
        if (searchQuery) params.search = searchQuery;
        
        // New filter system
        if (filters) {
          if (filters.search) params.search = filters.search;
          if (filters.categories.length > 0) {
            // Try both category and categoryId parameters
            params.categoryId = filters.categories[0];
            params.category = filters.categories[0];
          }
          if (filters.brands.length > 0) {
            // Join brands with OR logic - backend needs to support this
            params.brand = filters.brands.join('|');
          }
          if (filters.priceRange[0] > 0) {
            params.minPrice = filters.priceRange[0].toString();
          }
          if (filters.priceRange[1] < 1000) {
            params.maxPrice = filters.priceRange[1].toString();
          }
          if (filters.rating > 0) {
            params.minRating = filters.rating.toString();
          }
          if (filters.sort) {
            params.sort = filters.sort;
          }
          if (filters.inStock) {
            params.inStock = 'true';
          }
          if (filters.hasDiscount) {
            params.hasDiscount = 'true';
          }
        }

        console.log('Fetching products with params:', params);
        const response = await api.getProducts(params) as ProductResponse;
        console.log('Products API response:', response);
        const mappedProducts = response.products.map(mapApiProductToProduct);
        setProducts(mappedProducts);
        
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          total: response.total || mappedProducts.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // More specific error messages
        let errorMessage = 'Échec du chargement des produits';
        if (filters && filters.categories && filters.categories.length > 0) {
          errorMessage = `Échec du chargement des produits pour la catégorie sélectionnée`;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchQuery, filters]);

  const handleAddToWishlist = async (productId: string) => {
    try {
      await addToWishlist(productId);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      _id: apiProduct._id,
      name: apiProduct.name,
      description: apiProduct.description,
      price: apiProduct.price,
      images: apiProduct.images,
      category: apiProduct.category.name,
      stock: apiProduct.stock,
      brand: apiProduct.brand,
      averageRating: apiProduct.averageRating,
      discount: apiProduct.discount,
    };
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[500px] p-12">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-6" />
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-emerald-600/20 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Chargement des produits...
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Nous recherchons les meilleurs produits de parapharmacie pour vous
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span>Produits certifiés et approuvés</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
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

  if (products.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-lg mx-auto p-12">
          <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-50 p-6 mb-8">
            <Package className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucun produit trouvé</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Nous n'avons trouvé aucun produit correspondant à vos critères. 
            Essayez de modifier vos filtres ou votre recherche.
          </p>
          <button 
            onClick={() => window.location.href = '/products'} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Voir tous les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      <div className="p-4 lg:p-6 xl:p-8">
        {/* Results Header */}
        {filters && (
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {pagination.total} produit{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                </span>
              </div>
              {pagination.total > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm text-gray-600">Qualité certifiée</span>
                </div>
              )}
            </div>
            {filters.search && (
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                Résultats pour <span className="font-semibold">"{filters.search}"</span>
              </div>
            )}
          </div>
        )}

        {/* Products Grid - 4 products per row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="animate-fadeIn hover:scale-[1.02] transition-all duration-300"
              style={{
                animationDelay: `${Math.min(index * 0.1, 1)}s`,
              }}
            >
              <ProductCard
                product={product}
                onAddToWishlist={handleAddToWishlist}
              />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 sm:mt-16 flex justify-center">
            <div className="flex items-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    pagination.currentPage === i + 1
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 