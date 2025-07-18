import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
}

interface CategoryResponse {
  data: Category[];
}

const categoryColors = [
  'bg-blue-100 hover:bg-blue-200',
  'bg-green-100 hover:bg-green-200',
  'bg-purple-100 hover:bg-purple-200',
  'bg-pink-100 hover:bg-pink-200',
  'bg-yellow-100 hover:bg-yellow-200',
  'bg-red-100 hover:bg-red-200',
  'bg-indigo-100 hover:bg-indigo-200',
  'bg-orange-100 hover:bg-orange-200'
];

const textColors = [
  'text-blue-700',
  'text-green-700',
  'text-purple-700',
  'text-pink-700',
  'text-yellow-700',
  'text-red-700',
  'text-indigo-700',
  'text-orange-700'
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories();
        console.log('API Response:', response);
        const categoryData = (response as CategoryResponse).data;
        console.log('Category Data:', categoryData);
        setCategories(categoryData || []); // Provide empty array as fallback
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white">
        <div className="container py-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Chargement des catégories...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="container py-16">
          <h2 className="text-4xl font-bold text-red-600 mb-8 text-center">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container py-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Nos Catégories</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {categories.map((category, index) => (
            <div key={category._id} className="flex flex-col items-center">
              <Link to={`/categories/${category.slug}`} 
                className={`group w-full h-40 rounded-lg shadow-sm transition-all duration-200 ${categoryColors[index % categoryColors.length]} flex items-center justify-center mb-4 p-4`}>
                <h3 className={`text-2xl font-bold ${textColors[index % textColors.length]} text-center leading-tight`}>
                  {category.name}
                </h3>
              </Link>
              <h4 className="text-black text-lg font-light mb-2 text-center">{category.name}</h4>
              <p className="text-black text-sm font-light text-center max-w-xs">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 