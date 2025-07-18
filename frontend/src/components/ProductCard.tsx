import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShoppingCart, Heart, Check, Star, Eye, Zap } from "lucide-react";
import useStore from '../store/useStore';
import { toast } from 'react-hot-toast';
import placeholderImage from '../images/Screenshot 2025-06-26 152648.png';
import { formatPrice, calculateDiscountedPrice, isDiscountValid } from '../utils/format';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{ url: string; isMain: boolean }>;
  category: string;
  stock: number;
  discount?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToWishlist: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToWishlist,
}) => {
  const { addToCart, isAuthenticated } = useStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount?.percentage);
  const hasValidDiscount = product.discount && isDiscountValid(product.discount.startDate, product.discount.endDate);
  const showDiscountedPrice = hasValidDiscount && discountedPrice !== product.price;
  
  // Check if product has valid images (not placeholder/example URLs)
  const hasValidImages = product.images && product.images.length > 0 && 
    product.images.some(img => img.url && !img.url.includes('example.com') && !img.url.includes('placeholder'));
  
  // Get main image or fallback to screenshot
  const mainImage = hasValidImages 
    ? (product.images.find(img => img.isMain)?.url || product.images[0]?.url)
    : placeholderImage;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product._id, 1);
      setIsAddedToCart(true);
      toast.success('Produit ajouté au panier', {
        duration: 2000,
        position: 'top-center'
      });
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (error: any) {
      // Handle auth errors
      if (error?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.', {
          duration: 3000,
          position: 'top-center'
        });
      } else {
        // Handle other errors
        const errorMessage = error.message || 'Erreur lors de l\'ajout au panier';
        toast.error(errorMessage, {
          duration: 3000,
          position: 'top-center'
        });
      }
      
      // Reset states if there was an error
      setIsAddedToCart(false);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onAddToWishlist(product._id);
    toast.success('Ajouté à votre liste de souhaits', {
      duration: 2000,
      position: 'top-center'
    });
  };

  return (
    <Card className="group h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-2 border-gray-200 hover:border-emerald-300">
      <Link to={`/products/${product._id}`} className="block flex-1">
        <CardHeader className="p-0 relative">
          <AspectRatio ratio={1} className="bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
            {/* Image Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
            )}
            
            <img
              src={mainImage}
              alt={product.name}
              className={`object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = placeholderImage;
                setImageLoaded(true);
              }}
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-black/10 transition-all duration-300"></div>
            
            {/* Stock Status */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-6 py-2 shadow-xl transform -rotate-2 bg-red-600">
                  Rupture de stock
                </Badge>
              </div>
            )}
            
            {/* Discount Badge */}
            {hasValidDiscount && (
              <div className="absolute top-3 right-3 transform rotate-3 z-10">
                <div className="relative">
                  {/* Pulsing background for emphasis */}
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div>
                  {/* Main badge */}
                  <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-3 py-2 rounded-full text-sm font-extrabold shadow-2xl flex items-center gap-1 border-2 border-white">
                    <Zap className="h-4 w-4 fill-current animate-bounce" />
                    <span className="text-shadow-sm">-{product.discount!.percentage}%</span>
                  </div>
                  {/* Sparkle effect */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
            
            {/* Low Stock Warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 text-xs font-medium shadow-lg">
                  Plus que {product.stock} en stock
                </Badge>
              </div>
            )}
            
            {/* View Product Button - Appears on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-gray-900 font-medium text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Voir le produit
              </div>
            </div>
          </AspectRatio>
        </CardHeader>
        
        <CardContent className="p-4 lg:p-5 flex-1 bg-white">
          <div className="flex items-start justify-between gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base lg:text-lg leading-tight mb-1 lg:mb-2 text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 rounded-full w-8 h-8 lg:w-10 lg:h-10"
              onClick={handleWishlist}
            >
              <Heart className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2 flex-wrap mb-2 lg:mb-4">
            <Badge variant="secondary" className="rounded-full px-2 lg:px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              {product.category}
            </Badge>
            {product.stock > 0 && (
              <Badge className="rounded-full px-2 lg:px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ En stock
              </Badge>
            )}
          </div>
          
          {/* Rating placeholder */}
          <div className="flex items-center gap-1 mb-2 lg:mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 lg:h-4 lg:w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs lg:text-sm text-gray-600 ml-1">(4.0)</span>
          </div>
        </CardContent>
      </Link>
      
      {/* Footer with price and button - outside Link to prevent nesting issues */}
      <CardFooter className="p-4 lg:p-5 pt-0 mt-auto border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between w-full gap-2 lg:gap-4">
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {showDiscountedPrice ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg lg:text-xl font-bold text-emerald-600">
                    {formatPrice(discountedPrice)}
                  </span>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-bold">
                    Économie: {formatPrice(product.price - discountedPrice)}
                  </div>
                </div>
                <span className="text-xs lg:text-sm font-medium text-gray-500 line-through decoration-red-500 decoration-2">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg lg:text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            size="sm"
            className={`transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0 rounded-xl px-3 lg:px-4 py-2 font-semibold text-xs lg:text-sm min-w-[80px] lg:min-w-[100px] ${
              isAddedToCart 
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
            } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-3 w-3 lg:h-4 lg:w-4 border-2 border-white border-t-transparent rounded-full mr-1 lg:mr-2" />
                <span className="text-xs lg:text-sm text-white">Ajout...</span>
              </div>
            ) : isAddedToCart ? (
              <div className="flex items-center justify-center">
                <Check className="mr-1 h-3 w-3 lg:h-4 lg:w-4 text-white" />
                <span className="text-xs lg:text-sm text-white">Ajouté !</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ShoppingCart className="mr-1 h-3 w-3 lg:h-4 lg:w-4 text-white" />
                <span className="text-xs lg:text-sm text-white font-semibold">Ajouter</span>
              </div>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard; 