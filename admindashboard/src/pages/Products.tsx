import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { productsAPI, categoriesAPI } from '@/api';
import { Product, Category, ProductFormData, DialogState } from '@/types';
import { Package, Edit, Trash2, Plus } from 'lucide-react';
import { formatPrice, getProductImageOrPlaceholder } from '@/lib/utils';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    type: null,
  });
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    categoryId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      if (dialog.type === 'create') {
        await productsAPI.create(formData);
      } else if (dialog.type === 'edit' && dialog.data) {
        await productsAPI.update(dialog.data.id, formData);
      }

      await fetchProducts();
      setDialog({ open: false, type: null });
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await productsAPI.delete(productId);
      await fetchProducts();
      setDialog({ open: false, type: null });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image: '',
      categoryId: '',
      isActive: true,
    });
  };

  const openDialog = (type: 'create' | 'edit' | 'delete', product?: Product) => {
    if (type === 'edit' && product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId: product.category.id,
        isActive: product.isActive,
      });
    } else {
      resetForm();
    }
    setDialog({ open: true, type, data: product });
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-muted-foreground">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => openDialog('create')} variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-white bg-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={getProductImageOrPlaceholder(product.image)} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-md object-cover mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getProductImageOrPlaceholder();
                          }}
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category.name}</td>
                    <td className="px-6 py-4">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.isActive 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog('edit', product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDialog('delete', product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open, type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.type === 'create' ? 'Add New Product' : 
               dialog.type === 'edit' ? 'Edit Product' : 
               'Delete Product'}
            </DialogTitle>
          </DialogHeader>

          {dialog.type === 'delete' ? (
            <div className="space-y-4">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialog({ open: false, type: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => dialog.data && handleDelete(dialog.data.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-center text-red-700">
                    <div className="h-5 w-5 bg-red-500 rounded-full mr-3"></div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (optionnel)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Laisser vide pour utiliser l'image par défaut"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 rounded-md border"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialog({ open: false, type: null })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="gradient"
                    disabled={submitLoading}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white mr-2"></div>
                        {dialog.type === 'create' ? 'Création...' : 'Mise à jour...'}
                      </div>
                    ) : (
                      dialog.type === 'create' ? 'Créer' : 'Mettre à Jour'
                    )}
                  </Button>
                </DialogFooter>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 