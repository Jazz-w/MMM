import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import useStore from '../store/useStore';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Store,
  Eye,
  Calendar,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { formatPrice } from '../utils/format';
import * as apiService from '../services/api';
import { OrdersListResponse, OrderStatsResponse, Order, OrderStats } from '../types/models';

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    
    fetchOrders();
    fetchOrderStats();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async (status?: string, pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      
      const params = {
        page: pageNum,
        limit: 10,
        ...(status && status !== 'all' && { status })
      };

      const response = await apiService.getUserOrders(params) as OrdersListResponse;

      if (response.success) {
        if (pageNum === 1) {
          setOrders(response.orders);
        } else {
          setOrders(prev => [...prev, ...response.orders]);
        }
        setHasMore(response.pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await apiService.getUserOrderStats() as OrderStatsResponse;

      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setPage(1);
    fetchOrders(status === 'all' ? undefined : status, 1);
  };

  const loadMore = () => {
    fetchOrders(activeTab === 'all' ? undefined : activeTab, page + 1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p>Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total des commandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mode de retrait</p>
                <p className="text-lg font-semibold text-gray-900">En magasin</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Orders List */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="processing">En préparation</TabsTrigger>
            <TabsTrigger value="ready">Prêtes</TabsTrigger>
            <TabsTrigger value="delivered">Retirées</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune commande trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'all' 
                    ? "Vous n'avez pas encore passé de commande." 
                    : `Aucune commande avec le statut "${getStatusText(activeTab)}".`
                  }
                </p>
                <Button onClick={() => navigate('/')}>
                  Commencer mes achats
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Commande #{order.orderNumber}
                          </h3>
                          <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </div>
                          {order.estimatedPickupDate && order.status === 'ready' && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Store className="w-4 h-4" />
                              Prêt à retirer
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'article' : 'articles'}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                                alt={`${item.product.name} - Qté: ${item.quantity}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log('OrderHistory - Image load error for product:', item.product.name);
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
                          </div>
                        ))}
                      {order.items.length > 3 && (
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les détails
                      </Button>
                      
                      {order.status === 'ready' && (
                        <Badge className="bg-green-100 text-green-800 px-3 py-1">
                          <Store className="w-4 h-4 mr-1" />
                          Commande prête - Retrait en magasin
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-6">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                      Charger plus de commandes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default OrderHistoryPage; 