import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag,
  Grid,
  Bell,
  Settings,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble'
    },
    {
      path: '/products',
      label: 'Produits',
      icon: Package,
      description: 'Gestion des produits'
    },
    {
      path: '/categories',
      label: 'Catégories',
      icon: Grid,
      description: 'Organisation'
    },
    {
      path: '/orders',
      label: 'Commandes',
      icon: ShoppingBag,
      description: 'Suivi des ventes'
    },
    {
      path: '/users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des comptes'
    }
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <img 
                    src="/images/logo.png" 
                    alt="MMPara Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-slate-900">MMPara</h1>
                  <p className="text-xs text-slate-500">Administration</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex ml-10 space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
              </button>

              {/* Settings */}
              <button className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100">
                <Settings className="h-5 w-5" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">
                      {user.firstName?.[0] || 'A'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}
                    </p>
                    <p className="text-xs text-slate-500">Administrateur</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
