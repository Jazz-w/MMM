import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/api';

export default function AuthTest() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuth = async () => {
    setResults([]);
    
    // Check if token exists
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    addResult(`Token exists: ${!!token}`);
    addResult(`User data exists: ${!!user}`);
    
    if (token) {
      addResult(`Token: ${token.substring(0, 20)}...`);
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        addResult(`User ID: ${userData.id}`);
        addResult(`Is Admin: ${userData.isAdmin}`);
        addResult(`Role: ${userData.role}`);
      } catch (e) {
        addResult(`Error parsing user data: ${e}`);
      }
    }

    // Test API endpoints
    try {
      addResult('Testing /api/admin/stats...');
      const statsResponse = await axiosInstance.get('/admin/stats');
      addResult(`✅ Stats endpoint: ${statsResponse.status}`);
    } catch (error: any) {
      addResult(`❌ Stats endpoint failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    try {
      addResult('Testing /api/admin/categories...');
      const categoriesResponse = await axiosInstance.get('/admin/categories');
      addResult(`✅ Categories endpoint: ${categoriesResponse.status} - ${categoriesResponse.data.length} categories`);
    } catch (error: any) {
      addResult(`❌ Categories endpoint failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    try {
      addResult('Testing /api/admin/products...');
      const productsResponse = await axiosInstance.get('/admin/products');
      addResult(`✅ Products endpoint: ${productsResponse.status} - ${productsResponse.data.length} products`);
    } catch (error: any) {
      addResult(`❌ Products endpoint failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
  };

  const testCreateCategory = async () => {
    addResult('Testing category creation...');
    try {
      const response = await axiosInstance.post('/admin/categories', {
        name: `Test Category ${Date.now()}`,
        description: 'Test description',
        image: '/images/Screenshot 2025-06-26 152648.png',
        isActive: true
      });
      addResult(`✅ Category created: ${response.status} - ID: ${response.data.category?._id}`);
    } catch (error: any) {
      addResult(`❌ Category creation failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      console.error('Full error details:', error.response?.data);
    }
  };

  const testCreateProduct = async () => {
    addResult('Testing product creation...');
    try {
      // First get a category ID
      const categoriesResponse = await axiosInstance.get('/admin/categories');
      const firstCategory = categoriesResponse.data[0];
      
      if (!firstCategory) {
        addResult('❌ No categories available for testing product creation');
        return;
      }

      const response = await axiosInstance.post('/admin/products', {
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 29.99,
        stock: 10,
        image: '/images/Screenshot 2025-06-26 152659.png',
        categoryId: firstCategory._id,
        isActive: true
      });
      addResult(`✅ Product created: ${response.status} - ID: ${response.data.product?._id}`);
    } catch (error: any) {
      addResult(`❌ Product creation failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      console.error('Full error details:', error.response?.data);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 Authentication & API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testAuth}>Test Authentication</Button>
            <Button onClick={testCreateCategory} variant="outline">Test Create Category</Button>
            <Button onClick={testCreateProduct} variant="outline">Test Create Product</Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg h-80 overflow-y-auto">
            <div className="text-sm font-mono space-y-1">
              {results.length === 0 ? (
                <p className="text-gray-500">Click "Test Authentication" to run diagnostics...</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="border-b border-gray-200 pb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 