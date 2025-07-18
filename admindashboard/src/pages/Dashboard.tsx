import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { statsAPI } from '@/api';
import { DashboardStats, Order } from '@/types';
import { 
  Users, Package, ShoppingBag, DollarSign, 
  TrendingUp, Activity, ArrowUpIcon
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsAPI.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/30 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white rounded-lg p-6 border border-slate-200 shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tableau de bord
          </h1>
          <p className="text-slate-600 mt-1">
            Vue d'ensemble • {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <div className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg shadow">
            <Activity className="h-4 w-4 mr-2" />
            <span className="font-medium">En ligne</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Users Card */}
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Utilisateurs</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-2">{stats?.totalUsers || 0}</div>
            <div className="flex items-center text-sm text-slate-600">
              <ArrowUpIcon className="h-4 w-4 mr-1 text-emerald-500" />
              <span>{stats?.customers || 0} clients • {stats?.admins || 0} admins</span>
            </div>
            {/* Visual Progress */}
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${stats?.totalUsers ? (stats.admins / stats.totalUsers) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Admins</span>
                <span>{stats?.totalUsers ? ((stats.admins / stats.totalUsers) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Produits</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-2">{stats?.totalProducts || 0}</div>
            <div className="flex items-center text-sm text-slate-600">
              <TrendingUp className="h-4 w-4 mr-1 text-emerald-500" />
              <span>En stock</span>
            </div>
            {/* Stock Level Indicator */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level}
                  className={`h-2 rounded-full ${
                    level <= 3 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Niveau de stock: Bon</p>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Commandes</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-2">{stats?.totalOrders || 0}</div>
            <div className="flex items-center text-sm text-slate-600">
              <ArrowUpIcon className="h-4 w-4 mr-1 text-purple-500" />
              <span>Ce mois</span>
            </div>
            {/* Order Status Distribution */}
            <div className="mt-4 space-y-2">
              {stats?.ordersByStatus?.map((status, index) => (
                <div key={status.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 capitalize">{status.status}</span>
                    <span className="text-slate-500">{status.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        status.status === 'pret_a_porter' ? 'bg-emerald-500' :
                        status.status === 'processing' ? 'bg-blue-500' :
                        status.status === 'pending' ? 'bg-amber-500' :
                        'bg-slate-500'
                      }`}
                      style={{ 
                        width: `${(status.count / stats.totalOrders) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Revenus (Payés)</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {formatPrice(stats?.totalRevenue)}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <ArrowUpIcon className="h-4 w-4 mr-1 text-emerald-500" />
              <span>Commandes payées</span>
            </div>
            {/* Revenue Chart */}
            <div className="mt-4 h-16">
              <div className="h-full flex items-end space-x-1">
                {stats?.dailyRevenue?.map((day, i) => {
                  const maxRevenue = Math.max(...stats.dailyRevenue.map(d => d.revenue));
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-purple-500/20 rounded-t group relative"
                      style={{ height: `${height}%` }}
                    >
                      <div
                        className="w-full bg-purple-500 rounded-t transition-all duration-300 group-hover:bg-purple-600"
                        style={{ height: `${height}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {`${formatPrice(day.revenue)} - ${new Date(day.date).toLocaleDateString('fr-FR', { 
                          day: 'numeric',
                          month: 'short'
                        })}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Overview Chart */}
        <Card className="bg-white border-0 shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Aperçu des ventes</CardTitle>
            <p className="text-sm text-slate-600">Évolution quotidienne du chiffre d'affaires</p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.dailyRevenue?.map(item => ({
                    ...item,
                    formattedDate: new Date(item.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short',
                      day: 'numeric'
                    })
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatPrice(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [formatPrice(value), 'Revenus']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Product Categories Distribution */}
        <Card className="bg-white border-0 shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Distribution des catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Donut chart segments */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  {stats?.categoryDistribution?.map((category, index) => {
                    const previousPercentages = stats.categoryDistribution
                      .slice(0, index)
                      .reduce((sum, cat) => sum + cat.percentage, 0);
                    
                    return (
                      <circle
                        key={category.category.id}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={[
                          '#3b82f6',
                          '#10b981',
                          '#f59e0b',
                          '#6366f1',
                          '#ec4899'
                        ][index % 5]}
                        strokeWidth="20"
                        strokeDasharray={`${category.percentage * 2.51} 251`}
                        strokeDashoffset={`${-previousPercentages * 2.51}`}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{stats?.totalProducts || 0}</div>
                    <div className="text-sm text-slate-500">Produits</div>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="ml-8 space-y-3">
                {stats?.categoryDistribution?.map((category, index) => (
                  <div key={category.category.id} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: [
                          '#3b82f6',
                          '#10b981',
                          '#f59e0b',
                          '#6366f1',
                          '#ec4899'
                        ][index % 5]
                      }}
                    />
                    <span className="text-sm text-slate-600">
                      {category.category.name} ({category.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Activity Chart */}
        <Card className="bg-white border-0 shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Activité des clients</CardTitle>
            <p className="text-sm text-slate-600">Nombre de visites quotidiennes</p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.customerActivity?.map(item => ({
                    ...item,
                    formattedDate: new Date(item.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short',
                      day: 'numeric'
                    })
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`${value} visites`, 'Activité']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#activityGradient)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                  />
                  {stats?.customerActivity && (
                    <ReferenceLine 
                      y={stats.customerActivity.reduce((sum, item) => sum + item.visits, 0) / stats.customerActivity.length} 
                      stroke="#64748b" 
                      strokeDasharray="5 5" 
                      label={{ value: "Moyenne", position: "top", fontSize: 10 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Performance */}
        <Card className="bg-white border-0 shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Performance des produits</CardTitle>
            <p className="text-sm text-slate-600">Top vendeurs par revenus générés</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topProducts?.slice(0, 6).map((item, index) => ({
                    name: item.product.name.length > 15 ? item.product.name.substring(0, 15) + '...' : item.product.name,
                    fullName: item.product.name,
                    revenue: item.revenue,
                    totalSold: item.totalSold,
                    formattedRevenue: formatPrice(item.revenue)
                  }))}
                  layout="horizontal"
                  margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number"
                    stroke="#475569"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatPrice(value)}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    stroke="#475569"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      formatPrice(value),
                      `Revenus • ${props.payload.totalSold} ventes`
                    ]}
                    labelFormatter={(label, payload) => 
                      payload && payload[0] ? `${payload[0].payload.fullName}` : ''
                    }
                  />
                  <Bar 
                    dataKey="revenue" 
                    radius={[0, 8, 8, 0]}
                    stroke="#ffffff"
                    strokeWidth={1}
                  >
                    {stats?.topProducts?.slice(0, 6).map((item, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={[
                          '#3b82f6', '#10b981', '#f59e0b', 
                          '#ef4444', '#8b5cf6', '#06b6d4'
                        ][index % 6]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Additional stats below chart */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                             <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                 <div className="text-sm text-blue-600 font-medium mb-1">Meilleur vendeur</div>
                 <div className="text-lg font-bold text-blue-900">
                   {stats?.topProducts?.[0]?.product.name || 'N/A'}
                 </div>
                <div className="text-sm text-blue-700">
                  {formatPrice(stats?.topProducts?.[0]?.revenue || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                <div className="text-sm text-emerald-600 font-medium mb-1">Total des ventes</div>
                <div className="text-lg font-bold text-emerald-900">
                  {stats?.topProducts?.reduce((sum, item) => sum + item.totalSold, 0) || 0} unités
                </div>
                <div className="text-sm text-emerald-700">
                  {formatPrice(stats?.topProducts?.reduce((sum, item) => sum + item.revenue, 0) || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white border-0 shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-800">Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order: Order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-600">#{order.id.slice(-6)}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {`${order.user.firstName} ${order.user.lastName}` || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 