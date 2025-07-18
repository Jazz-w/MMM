import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import useStore from '../store/useStore';
import { 
  ArrowLeft, 
  Store, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Gift,
  Truck
} from 'lucide-react';
import { formatPrice } from '../utils/format';
import * as apiService from '../services/api';
import { OrderResponse } from '../types/models';
import { toast } from 'react-hot-toast';

interface OrderSummary {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, user, isAuthenticated, fetchCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Customer details form state
  const [customerDetails, setCustomerDetails] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    
    if (!cart || cart.length === 0) {
      navigate('/cart');
      return;
    }

    fetchCart();
  }, [isAuthenticated, cart, navigate, fetchCart]);

  useEffect(() => {
    if (user) {
      setCustomerDetails(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      }));
    }
  }, [user]);

  // Calculate order summary
  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce((total, item) => {
      const price = item.product.discount && item.product.discount.percentage
        ? item.product.price * (1 - item.product.discount.percentage / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);

    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return { subtotal, tax, total, itemCount };
  };

  const orderSummary = calculateOrderSummary();

  const handleInputChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!customerDetails.firstName.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!customerDetails.lastName.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!customerDetails.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!customerDetails.phoneNumber.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createOrder({
        deliveryType: 'pickup',
        notes: customerDetails.notes
      }) as OrderResponse;

      if (response.success) {
        // Show success toast immediately
        toast.success('Commande confirmée avec succès !', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          },
          icon: '✅',
        });

        setSuccess(true);
        setOrderId(response.order.orderNumber);
        // Refresh cart to reflect the cleared cart
        await fetchCart();
      } else {
        throw new Error(response.message || 'Erreur inconnue');
      }

    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error.message || 'Erreur lors de la création de la commande';
      setError(errorMessage);
      
      // Show error toast
      toast.error(`❌ ${errorMessage}`, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px 24px',
          borderRadius: '12px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success && orderId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-2xl">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Commande Confirmée !
          </h1>
          
          <p className="text-gray-700 mb-2 text-lg">
            Félicitations ! Votre commande a été créée avec succès.
          </p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 border border-green-200">
            <p className="text-gray-800 font-semibold text-xl">
              Numéro de commande : <span className="text-emerald-600">#{orderId}</span>
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-6 h-6" />
              <span className="font-bold text-lg">Retrait en magasin</span>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Votre commande sera prête <strong>demain dès 9h00</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Magasin principal - 123 Avenue Habib Bourguiba, Tunis</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>Paiement en espèces lors du retrait</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Informations importantes</span>
            </div>
            <ul className="text-sm text-amber-700 space-y-1 text-left">
              <li>• Un SMS de confirmation sera envoyé</li>
              <li>• Apportez une pièce d'identité pour le retrait</li>
              <li>• Commande disponible pendant 7 jours</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold shadow-lg"
            >
              📋 Voir mes commandes
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50 py-3 text-lg font-semibold"
            >
              🛍️ Continuer mes achats
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Customer Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Informations personnelles</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={customerDetails.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={customerDetails.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre@email.com"
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="phoneNumber">Téléphone *</Label>
              <Input
                id="phoneNumber"
                value={customerDetails.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+216 XX XXX XXX"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <textarea
                id="notes"
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                value={customerDetails.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Instructions spéciales pour votre commande..."
              />
            </div>
          </Card>

          {/* Pickup Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Retrait en magasin</h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Magasin principal</span>
              </div>
              <p className="text-blue-800 text-sm mb-3">
                123 Avenue Habib Bourguiba, Tunis 1000, Tunisie
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Clock className="w-4 h-4" />
                <span>Lun-Sam: 9h-19h | Dim: 10h-17h</span>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Mode de paiement</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">💰</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Paiement en espèces</span>
                <p className="text-sm text-gray-600">À payer lors du retrait</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Résumé de la commande</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{item.product.name}</span>
                    <span className="text-sm text-gray-600">Qté: {item.quantity}</span>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(
                      (item.product.discount && item.product.discount.percentage
                        ? item.product.price * (1 - item.product.discount.percentage / 100)
                        : item.product.price) * item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="mb-6" />

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total ({orderSummary.itemCount} articles)</span>
                <span>{formatPrice(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA (18%)</span>
                <span>{formatPrice(orderSummary.tax)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Économies Applicable</span>
                <span className="font-medium"> x %</span>
              </div>
              
              <Separator />
                  
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(orderSummary.total)}</span>
              </div>
            </div>

            {/* Estimated Pickup Date */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  Prêt demain à partir de 9h00
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              {loading ? 'Traitement...' : `Confirmer la commande • ${formatPrice(orderSummary.total)}`}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              En confirmant, vous acceptez nos conditions de vente
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 