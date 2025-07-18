import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import ProductGrid from '../components/ProductGrid';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import { Sparkles, Zap, Star } from 'lucide-react';
import useStore from '../store/useStore';

interface Product {
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

export default function HomePage() {
  const [sampleDiscountedProducts] = useState<Product[]>([
    {
      _id: 'sample-1',
      name: 'Vitamine C 1000mg - Promotion',
      description: 'Complément alimentaire vitamine C, idéal pour renforcer le système immunitaire. Offre spéciale limitée!',
      price: 45.000,
      images: [{ url: '/images/test-image.png', isMain: true }],
      category: { name: 'Compléments' },
      stock: 50,
      brand: 'ParaPharmacie',
      discount: {
        percentage: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      _id: 'sample-2',
      name: 'Crème Hydratante Bio - En Promo',
      description: 'Crème hydratante naturelle pour tous types de peau. Promotion exceptionnelle!',
      price: 35.000,
      images: [{ url: '/images/test-image.png', isMain: true }],
      category: { name: 'Cosmétiques' },
      stock: 30,
      brand: 'ParaPharmacie',
      discount: {
        percentage: 40,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ]);

  const { addToWishlist } = useStore();

  const handleAddToWishlist = async (productId: string) => {
    try {
      await addToWishlist(productId);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="mx-auto max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="relative z-10 lg:col-span-4">
              <div className="relative px-6 py-20 sm:py-28 lg:px-8 lg:py-32">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Votre santé, notre priorité
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Découvrez notre sélection de produits parapharmaceutiques de qualité. 
                    Des solutions adaptées pour prendre soin de vous et de votre famille.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <Link
                      to="/products"
                      className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Voir nos produits
                    </Link>
                    <Link to="/categories" className="text-sm font-semibold leading-6 text-gray-900">
                      Parcourir les catégories <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 flex items-center justify-center">
              <div className="w-full">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Products Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <span className="text-yellow-200 text-sm font-medium uppercase tracking-wide">Parapharmacie Premium</span>
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Nos Produits de
              <span className="block text-yellow-300">Qualité</span>
            </h2>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Découvrez notre large gamme de produits de parapharmacie sélectionnés par nos experts pour votre santé et votre bien-être
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">1000+</div>
                <div className="text-emerald-200 text-sm">Produits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
                <div className="text-emerald-200 text-sm">Marques</div>
              </div>
            </div>

            <div className="mt-10">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg rounded-xl font-semibold"
              >
                Découvrir nos produits
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white">
        <div className="container">
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50">
        <div className="container">
          <div className="py-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="h-6 w-6 text-yellow-500 fill-current" />
              <h2 className="text-2xl font-bold text-gray-900">Produits en vedette</h2>
            </div>
            <ProductGrid />
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="bg-white">
        <div className="container">
          <div className="py-16">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">Promotions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleDiscountedProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    product={{
                      ...product,
                      category: product.category.name
                    }}
                    onAddToWishlist={handleAddToWishlist}
                  />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                to="/products?hasDiscount=true"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                <Zap className="h-5 w-5 mr-2" />
                Voir toutes les promotions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 