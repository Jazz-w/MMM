import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal,
  Trash2,
  Sparkles,
  Package,
  ShoppingBag
} from "lucide-react";
import * as api from '../services/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
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

interface ProductFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Plus récents', icon: Sparkles },
  { value: 'price_asc', label: 'Prix croissant', icon: null },
  { value: 'price_desc', label: 'Prix décroissant', icon: null },
  { value: 'name_asc', label: 'Nom A-Z', icon: null },
  { value: 'name_desc', label: 'Nom Z-A', icon: null },
];

const pharmacyBrands = [
  'Avène', 'La Roche-Posay', 'Vichy', 'Eucerin', 'Bioderma',
  'Nuxe', 'Caudalie', 'Phytosun Arôms', 'Pileje', 'Arkopharma',
  'Boiron', 'Weleda', 'Mustela', 'Uriage', 'ISDIN'
];

export default function ProductFilter({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle,
  className = ""
}: ProductFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories();
        const categoryData = (response as { data: Category[] }).data || response;
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];
    updateFilters({ categories: newCategories });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    updateFilters({ brands: newBrands });
  };

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    count 
  }: { 
    title: string; 
    icon: any; 
    sectionKey: keyof typeof expandedSections; 
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full p-4 text-left hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 rounded-lg group"
    >
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-2 rounded-lg group-hover:from-emerald-200 group-hover:to-emerald-100 transition-all duration-300">
          <Icon className="h-4 w-4 text-emerald-700" />
        </div>
        <span className="font-semibold text-gray-900">{title}</span>
        {count !== undefined && count > 0 && (
          <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 text-xs px-2 py-1 border border-emerald-200">
            {count}
          </Badge>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-emerald-600 transition-colors duration-300" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-emerald-600 transition-colors duration-300" />
      )}
    </button>
  );

  return (
    <Card className={`h-fit overflow-hidden bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 shadow-2xl border-0 ring-1 ring-emerald-100/50 ${className}`}>
      {/* Header */}
      <CardHeader className="pb-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-teal-600/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
        </div>
        <div className="relative flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <span className="font-bold">Filtres</span>
          </CardTitle>
          {isOpen && (
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Search */}
        <div className="p-6 border-b border-emerald-100/50">
          <Label htmlFor="search" className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            Recherche
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Nom, marque, description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl bg-white/80 backdrop-blur-sm"
            />
            {filters.search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors duration-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="border-b border-emerald-100/50">
          <SectionHeader 
            title="Catégories" 
            icon={Package}
            sectionKey="categories" 
            count={filters.categories.length}
          />
          {expandedSections.categories && (
            <div className="px-6 pb-6 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                categories.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-2"
                    />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-700 transition-colors duration-300">{category.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Brands */}
        <div className="border-b border-emerald-100/50">
          <SectionHeader 
            title="Marques" 
            icon={ShoppingBag}
            sectionKey="brands" 
            count={filters.brands.length}
          />
          {expandedSections.brands && (
            <div className="px-6 pb-6 space-y-3 max-h-64 overflow-y-auto">
              {pharmacyBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-2"
                  />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-700 transition-colors duration-300">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="p-6 border-b border-emerald-100/50">
          <Label htmlFor="sort" className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            Trier par
          </Label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full mt-1 rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm bg-white/80 backdrop-blur-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-emerald-50 hover:border-emerald-400 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
          >
            <Trash2 className="h-4 w-4" />
            Effacer tous les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 