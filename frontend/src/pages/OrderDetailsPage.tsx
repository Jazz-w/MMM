import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import useStore from '../store/useStore';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Store,
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { formatPrice } from '../utils/format';
import * as apiService from '../services/api';
import { Order } from '../types/models';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrderById(orderId!) as { success: boolean; order: Order; error?: string };

      if (response.success) {
        setOrder(response.order);
      } else {
        setError(response.error || 'Erreur lors du chargement de la commande');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5" />;
      case 'ready':
        return <Package className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En préparation';
      case 'ready':
        return 'Prêt à retirer';
      case 'delivered':
        return 'Retiré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p>Chargement des détails de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Commande introuvable'}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/orders')}>
              Retour aux commandes
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-gray-600">Commandée le {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Statut de la commande</h2>
              <Badge className={`flex items-center gap-2 px-3 py-2 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </Badge>
            </div>
            
            {order.status === 'ready' && order.estimatedPickupDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Store className="w-5 h-5" />
                  <span className="font-semibold">Commande prête à retirer</span>
                </div>
                <p className="text-green-700 mt-1">
                  Vous pouvez venir récupérer votre commande en magasin.
                </p>
              </div>
            )}

            {order.status === 'processing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-semibold">Commande en préparation</span>
                </div>
                <p className="text-blue-700 mt-1">
                  Votre commande est actuellement en cours de préparation.
                </p>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Articles commandés</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border overflow-hidden">
                        <img
                          src={(() => {
                            // Use available screenshot images as fallbacks
                            const fallbackImages = [
                              '/images/Screenshot 2025-06-26 152648.png',
                              '/images/Screenshot 2025-06-26 152659.png',
                              '/images/test-image.png'
                            ];
                            
                            // Try to get a consistent image based on product name
                            const imageIndex = item.product.name.length % fallbackImages.length;
                            return fallbackImages[imageIndex];
                          })()}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Image load error for product:', item.product.name);
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `
                              <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                <div class="text-center px-1">
                                  <div class="text-xs font-medium text-gray-700 leading-tight">${item.product.name.substring(0, 8)}...</div>
                                  <div class="text-xs text-gray-500">Qté: ${item.quantity}</div>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{item.product.name}</span>
                          <span className="text-sm text-gray-600">Qté: {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-semibold text-gray-700">{formatPrice(item.price)} chacun</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Résumé de la commande</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
                             <div className="flex justify-between">
                 <span className="text-gray-600">TVA (18%)</span>
                 <span>{formatPrice(order.tax)}</span>
               </div>
               <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

                     {/* Customer Information */}
           <Card className="p-6">
             <h2 className="text-xl font-semibold mb-4">Informations client</h2>
             <div className="space-y-3">
               {typeof order.user === 'object' && order.user ? (
                 <>
                   <div className="flex items-center gap-3">
                     <User className="w-4 h-4 text-gray-500" />
                     <span>{order.user.firstName} {order.user.lastName}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <Mail className="w-4 h-4 text-gray-500" />
                     <span className="text-sm">{order.user.email}</span>
                   </div>
                   {order.user.phoneNumber && (
                     <div className="flex items-center gap-3">
                       <Phone className="w-4 h-4 text-gray-500" />
                       <span>{order.user.phoneNumber}</span>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="flex items-center gap-3">
                   <User className="w-4 h-4 text-gray-500" />
                   <span>Informations client</span>
                 </div>
               )}
               {order.shippingAddress && (
                 <div className="flex items-center gap-3">
                   <MapPin className="w-4 h-4 text-gray-500" />
                   <div className="text-sm">
                     <p>{order.shippingAddress.street}</p>
                     <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                   </div>
                 </div>
               )}
             </div>
           </Card>

          {/* Pickup Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de retrait</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Retrait en magasin</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div className="text-sm">
                  <p>Notre magasin</p>
                  <p className="text-gray-600">Adresse du magasin</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className="text-sm">
                  <p>Mode de paiement</p>
                  <p className="text-gray-600">Paiement en espèces lors du retrait</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage; 