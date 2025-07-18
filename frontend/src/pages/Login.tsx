import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { googleLogin, type ApiError } from '../services/api';
import useStore from '../store/useStore';
import { config } from '../config/env';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Mail, Lock, ArrowRight, Heart, Shield, Award, Stethoscope } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, error: storeError, loading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      // Check if there's a redirect URL stored
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || storeError);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Connexion Google échouée : Aucune information d\'identification reçue');
      return;
    }

    setError(null);

    try {
      await googleLogin(response.credential);
      // Check if there's a redirect URL stored
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    }
  };

  const handleGoogleError = () => {
    setError('Connexion Google échouée. Veuillez réessayer.');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative p-4"
      style={{
        backgroundImage: `url('/images/logo.png')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-green-50/90"></div>
      
      {/* Centered Login Form */}
      <div className="w-full max-w-md relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-emerald-200/50 mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Votre Partenaire Santé & Beauté
            </h1>
            <p className="text-gray-600">Parapharmacie de confiance</p>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-emerald-200/50">
              <Stethoscope className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Soins Professionnels</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-emerald-200/50">
              <Heart className="w-6 h-6 text-teal-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Bien-être & Beauté</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-emerald-200/50">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Qualité Garantie</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-emerald-200/50">
              <Award className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Professionnels Agréés</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-8">
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Bon Retour
            </CardTitle>
            <p className="text-center text-gray-600">
              Accédez à votre compte santé et beauté
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {(error || storeError) && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">
                      {error || storeError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Adresse Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Saisissez votre adresse email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all duration-200 bg-white/95"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mot de Passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Saisissez votre mot de passe"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-11 h-12 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all duration-200 bg-white/95"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Accéder à Mon Compte
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </Button>

              {config.oauth.google.clientId && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500 font-medium">
                        Ou continuer avec
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      type="standard"
                      theme="outline"
                      size="large"
                      width="100%"
                      text="signin_with"
                      shape="rectangular"
                    />
                  </div>
                </>
              )}

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Nouveau dans notre parapharmacie ?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
                  >
                    Créer votre compte
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/50">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Conforme RGPD
              </span>
              <span className="flex items-center">
                <Award className="w-3 h-3 mr-1" />
                Pharmacie Agréée
              </span>
            </div>
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez notre{' '}
              <a href="#" className="text-emerald-600 hover:underline">Politique de Confidentialité</a>
              {' '}et nos{' '}
              <a href="#" className="text-emerald-600 hover:underline">Conditions d'Utilisation</a>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-300/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-teal-300/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default Login; 