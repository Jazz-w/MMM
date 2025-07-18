import React, { Fragment, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useStore from '../store/useStore';
import logo from '../images/logo.png';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Produits', href: '/products' },
  { name: 'Catégories', href: '/categories' },
  { name: 'FAQ', href: '/faq' },
];

export default function Navbar() {
  const { isAuthenticated, user, cart, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Link to="/" className="flex-shrink-0">
                  <img className="h-8 w-auto sm:h-10" src={logo} alt="Parapharmacie" />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'border-b-2 border-emerald-500 text-emerald-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:px-6 lg:max-w-md">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="search"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-full border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all duration-200"
                    />
                  </div>
                </form>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Mobile search button */}
                <button
                  onClick={() => navigate('/products')}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-emerald-600 rounded-full min-w-[1.25rem] h-5">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                {isAuthenticated ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex rounded-full bg-white p-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                        {getInitials()}
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                              <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                              <div className="text-gray-500 text-xs">{user?.email}</div>
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/orders"
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              Mes commandes
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/cart"
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              Mon panier ({cartItemCount})
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              Déconnexion
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="hidden sm:flex sm:items-center sm:space-x-2">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Inscription
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                <Disclosure.Button className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2 px-4 bg-white border-t border-gray-200">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="search"
                    placeholder="Rechercher des produits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive(item.href)
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}

              {/* Mobile Auth Links */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Connexion
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-3 py-2 text-base font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 mx-3"
                  >
                    Inscription
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 