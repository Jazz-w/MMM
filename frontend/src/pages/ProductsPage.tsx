import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import { Button } from '../components/ui/button';
import { Filter, X, Search } from 'lucide-react';

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

const defaultFilters: FilterState = {
  search: '',
  categories: [],
  brands: [],
  priceRange: [0, 1000],
  rating: 0,
  sort: 'newest',
  inStock: false,
  hasDiscount: false,
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters: FilterState = { ...defaultFilters };

    // Read from URL params
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const brandParam = searchParams.get('brand');
    const sortParam = searchParams.get('sort');

    if (searchParam) urlFilters.search = searchParam;
    if (categoryParam) urlFilters.categories = [categoryParam];
    if (brandParam) urlFilters.brands = brandParam.split('|');
    if (sortParam) urlFilters.sort = sortParam;

    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.categories.length > 0) params.set('category', newFilters.categories[0]);
    if (newFilters.brands.length > 0) params.set('brand', newFilters.brands.join('|'));
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

    setSearchParams(params);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...defaultFilters };
    setFilters(clearedFilters);
    setSearchParams({});
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const hasActiveFilters = filters.search || 
    filters.categories.length > 0 || 
    filters.brands.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16">
      {/* Active Filters Section */}
      {hasActiveFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres actifs:
              </span>
              
              {filters.search && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                  <Search className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[120px]">"{filters.search}"</span>
                  <button
                    onClick={() => handleFiltersChange({ ...filters, search: '' })}
                    className="ml-2 hover:text-emerald-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {filters.categories.length > 0 && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 shadow-sm">
                  {filters.categories.length} catégorie{filters.categories.length > 1 ? 's' : ''}
                  <button
                    onClick={() => handleFiltersChange({ ...filters, categories: [] })}
                    className="ml-2 hover:text-blue-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {filters.brands.length > 0 && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200 shadow-sm">
                  {filters.brands.length} marque{filters.brands.length > 1 ? 's' : ''}
                  <button
                    onClick={() => handleFiltersChange({ ...filters, brands: [] })}
                    className="ml-2 hover:text-purple-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              <Button
                onClick={handleClearFilters}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-1" />
                Tout effacer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={toggleSidebar}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 shadow-lg rounded-xl"
            size="lg"
          >
            <Filter className="h-5 w-5 mr-2" />
            Ouvrir les filtres
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                isOpen={false}
                onToggle={() => {}}
                className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50"
              />
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
              <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white shadow-2xl overflow-y-auto">
                <ProductFilter
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  isOpen={isSidebarOpen}
                  onToggle={toggleSidebar}
                  className="h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              filters={filters}
              className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50/30"
            />
          </div>
        </div>
      </div>

      {/* Breadcrumb for SEO */}
      <div className="hidden">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">Accueil</a></li>
            <li>/</li>
            <li>Produits</li>
            {filters.categories.length === 1 && (
              <>
                <li>/</li>
                <li>Catégorie</li>
              </>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
} 