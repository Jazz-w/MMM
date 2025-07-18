import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authAPI } from '@/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email });
      const response = await authAPI.login(email, password);
      console.log('Login response:', { 
        success: response.success,
        hasToken: !!response.token,
        user: response.user
      });
      
      if (!response.success) {
        setError(response.error || 'Connexion échouée. Veuillez réessayer.');
        return;
      }

      if (!response.token) {
        setError('Erreur serveur : Aucun token d\'authentification reçu');
        return;
      }

      if (!response.user) {
        setError('Erreur serveur : Aucune donnée utilisateur reçue');
        return;
      }

      // Verify admin status
      if (!response.user.isAdmin) {
        console.error('Login failed: Not an admin user');
        setError('Accès refusé. Privilèges administrateur requis.');
        return;
      }

      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Auth data stored successfully');

      // Update auth state and redirect
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle different types of errors with better messaging
      if (err.response?.data?.error) {
        // Use the specific error message from the server (e.g., "Invalid email or password")
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        // Handle 401 specifically for authentication failures
        setError('Email ou mot de passe invalide');
      } else if (err.message === 'Network Error') {
        setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
      } else if (err.response?.status >= 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        // Only use generic message as last resort
        setError(err.message || 'Connexion échouée. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pharmacy-50 via-pharmacy-100/50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Parapharmacy Admin Branding & Information */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <img 
              src="/images/logo.png" 
              alt="Logo Parapharmacie" 
              className="h-16 w-auto mx-auto lg:mx-0 mb-8"
            />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Gestion Parapharmacie
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Plateforme administrative complète pour gérer vos opérations pharmaceutiques, stocks et services de santé clients.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Gestion des Stocks</h3>
                <p className="text-gray-600">Suivi des produits pharmaceutiques, dates d'expiration et niveaux de stock</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Dossiers Médicaux</h3>
                <p className="text-gray-600">Informations de santé clients sécurisées et historique des consultations</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Conformité & Rapports</h3>
                <p className="text-gray-600">Suivi de conformité réglementaire et rapports automatisés</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Analyses en Temps Réel</h3>
                <p className="text-gray-600">Insights des ventes, tendances clients et métriques opérationnelles</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="flex items-center space-x-3 mb-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h4 className="font-semibold text-gray-800">Système Conforme RGPD</h4>
            </div>
            <p className="text-sm text-gray-600">
              Notre plateforme garantit une conformité totale avec les réglementations de santé et maintient les plus hauts standards de sécurité des données patients.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="space-y-4 text-center pt-8 pb-6">
              {/* Mobile Logo */}
              <div className="lg:hidden">
                <img 
                  src="/images/logo.png" 
                  alt="Logo Parapharmacie" 
                  className="h-12 w-auto mx-auto mb-4"
                />
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-gray-800">
                  Portail Administrateur
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Accès sécurisé au système de gestion pharmaceutique
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Pharmacien
                  </Label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <Input
                      id="email"
                      type="email"
                      placeholder="pharmacien@parapharmacie.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                      className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Mot de Passe Sécurisé
                  </Label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Saisissez votre mot de passe sécurisé"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input 
                      id="remember-me" 
                      name="remember-me" 
                      type="checkbox" 
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Se souvenir de cet appareil
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                      Réinitialiser le mot de passe ?
                    </a>
                  </div>
                </div>
              </form>
            </CardContent>

            <CardFooter className="px-8 pb-8">
                              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full h-12 bg-gradient-to-r from-pharmacy-500 to-pharmacy-600 hover:from-pharmacy-600 hover:to-pharmacy-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Authentification...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Accéder au Système de Gestion</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Conforme RGPD
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Cryptage 256-bit
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Conforme ANSM
              </span>
            </div>
            <p className="text-center text-xs text-gray-500">
              Système de gestion pharmaceutique agréé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

