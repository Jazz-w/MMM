import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { categoriesAPI } from '@/api';
import { Category, CategoryFormData, DialogState } from '@/types';
import { Grid, Edit, Trash2, Plus } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    type: null,
  });
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      if (dialog.type === 'create') {
        await categoriesAPI.create(formData);
      } else if (dialog.type === 'edit' && dialog.data) {
        await categoriesAPI.update(dialog.data.id, formData);
      }

      await fetchCategories();
      setDialog({ open: false, type: null });
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await categoriesAPI.delete(categoryId);
      await fetchCategories();
      setDialog({ open: false, type: null });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true,
    });
  };

  const openDialog = (type: 'create' | 'edit' | 'delete', category?: Category) => {
    if (type === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive,
      });
    } else {
      resetForm();
    }
    setDialog({ open: true, type, data: category });
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-muted-foreground">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button onClick={() => openDialog('create')} variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-white bg-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog('edit', category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDialog('delete', category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 object-cover rounded-md"
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  {category.description || 'No description available'}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    category.isActive 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open, type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.type === 'create' ? 'Add New Category' : 
               dialog.type === 'edit' ? 'Edit Category' : 
               'Delete Category'}
            </DialogTitle>
            <DialogDescription>
              {dialog.type === 'create' ? 'Create a new category for your products.' :
               dialog.type === 'edit' ? 'Edit the selected category details.' :
               'Are you sure you want to delete this category?'}
            </DialogDescription>
          </DialogHeader>

          {dialog.type === 'delete' ? (
            <div className="space-y-4">
              <p>Are you sure you want to delete this category? This action cannot be undone.</p>
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
                  />
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