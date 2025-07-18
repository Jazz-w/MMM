import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ordersAPI } from '@/api';
import { Order, OrderStatus } from '@/types';
import { ShoppingBag, Eye, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };



  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'pret_a_porter':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'payee':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En traitement';
      case 'pret_a_porter':
        return 'Prêt à porter';
      case 'payee':
        return 'Payée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(''); // Reset new status
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    try {
      await ordersAPI.updateStatus(selectedOrder.id, newStatus);
      await fetchOrders();
      setIsStatusDialogOpen(false);
      setNewStatus('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchMatch = 
      (order.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus;
    
    return searchMatch && statusMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-muted-foreground">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Gestion des Commandes
            </h1>
            <p className="text-slate-600 mt-1">
              {filteredOrders.length} commande(s) • {/* Assuming stats.totalRevenue is available or will be added */}0 TND de revenus
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="pret_a_porter">Prêt à porter</option>
              <option value="payee">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="pret_a_porter">Prêt à porter</option>
              <option value="payee">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-600">#{order.id.slice(-6)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {order.user.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {order.user.firstName} {order.user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{order.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(order)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-pharmacy-200/50 shadow-xl">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-pharmacy-300" />
              <h3 className="text-xl font-semibold text-pharmacy-800 mb-2">Aucune commande trouvée</h3>
              <p className="text-pharmacy-600">
                {searchTerm || selectedStatus !== 'all' 
                  ? "Aucune commande ne correspond à vos critères de recherche."
                  : "Aucune commande n'a encore été passée."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Détails de la commande #{selectedOrder?.id.slice(-6)}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Commande passée le {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Client</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {selectedOrder.user.firstName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                      </p>
                      <p className="text-sm text-slate-600">{selectedOrder.user.email}</p>
                      {selectedOrder.user.phoneNumber && (
                        <p className="text-sm text-slate-600">{selectedOrder.user.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Adresse de livraison</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-900">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-slate-600">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Articles</h3>
                <div className="bg-slate-50 rounded-lg divide-y divide-slate-200">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src="/images/Screenshot 2025-06-26 152648.png"
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.product.name}</p>
                          <p className="text-sm text-slate-600">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Récapitulatif</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>TVA (18%)</span>
                    <span>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-medium text-slate-900">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Mettre à jour le statut
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Commande #{selectedOrder?.id.slice(-6)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nouveau statut</Label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="processing">En traitement</option>
                <option value="pret_a_porter">Prêt à porter</option>
                <option value="payee">Payée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 