import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import useStore from '../store/useStore';
import { Trash2, ShoppingBag, Plus, Minus, Store, Clock } from 'lucide-react';
import { formatPrice, calculateDiscountedPrice } from '../utils/format';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string; isMain: boolean }>;
    stock: number;
    discount?: {
      percentage: number;
    };
  };
  quantity: number;
}

// Using the utility function from ../utils/format

const CartPage: React.FC = () => {
  const { cart, updateCartItemQuantity, removeFromCart, fetchCart, isCartLoading, user } = useStore();
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const getItemPrice = (item: CartItem): number => {
    if (!item?.product?.price || typeof item.product.price !== 'number') {
      return 0;
    }
    return item.product.price;
  };

  const getDiscountedPrice = (item: CartItem): number => {
    const basePrice = getItemPrice(item);
    if (item?.product?.discount?.percentage && item.product.discount.percentage > 0) {
      return basePrice * (1 - item.product.discount.percentage / 100);
    }
    return basePrice;
  };

  const calculateItemTotal = (item: CartItem): number => {
    return getDiscountedPrice(item) * item.quantity;
  };

  const calculateTotal = (): number => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    setError(null);
    setLoadingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
      setError('Failed to update quantity. Please try again.');
      console.error('Error updating quantity:', error);
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setError(null);
    setLoadingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      setError('Failed to remove item. Please try again.');
      console.error('Error removing item:', error);
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading cart...</h2>
        </Card>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">
            Découvrez notre sélection de produits et ajoutez vos favoris au panier.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Découvrir nos produits
          </Button>
        </Card>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
        <Badge variant="secondary" className="ml-2">
          {itemCount} {itemCount === 1 ? 'article' : 'articles'}
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center">
            <span className="text-red-800 text-sm">!</span>
          </div>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className="relative">
                  <img
                    src={item.product.images.find(img => img.isMain)?.url || item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  {item.product.discount && item.product.discount.percentage > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500">
                      -{item.product.discount.percentage}%
                    </Badge>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Stock disponible: {item.product.stock}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                      disabled={loadingItems[item._id]}
                      title="Supprimer du panier"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.product.stock)}
                        disabled={item.quantity <= 1 || loadingItems[item._id]}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                        {loadingItems[item._id] ? '...' : item.quantity}
                      </span>
                      <button
                        className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.product.stock)}
                        disabled={item.quantity >= item.product.stock || loadingItems[item._id]}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price Display */}
                    <div className="text-right">
                      {item.product.discount && item.product.discount.percentage > 0 ? (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(calculateItemTotal(item))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(calculateItemTotal(item))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4 border-2">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Résumé de la commande</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total ({itemCount} articles)</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA (18%)</span>
                <span>{formatPrice(calculateTotal() * 0.18)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(calculateTotal() * 1.18)}</span>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Retrait en magasin</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Clock className="w-4 h-4" />
                <span>Prêt demain - Gratuit</span>
              </div>
            </div>

            <Button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              disabled={isCartLoading}
            >
              Procéder à la commande
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Paiement à la livraison uniquement
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 