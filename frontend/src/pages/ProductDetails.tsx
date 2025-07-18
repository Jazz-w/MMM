import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { 
  Star, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Heart, 
  Share2, 
  TruckIcon,
  Shield,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import useStore from '../store/useStore';
import { formatPrice, calculateDiscountedPrice, isDiscountValid } from '../utils/format';
import type { CarouselApi } from '../components/ui/carousel';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  images: Array<{ url: string; isMain: boolean }>;
  stock: number;
  specifications: {
    weight: string;
    dimensions: string;
    ingredients: string[];
    usage: string;
    warnings: string[];
    storageInstructions: string;
  };
  averageRating: number;
  discount?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

// The backend returns the product directly, not wrapped in a data object
interface ProductResponse extends Product {}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const { addToCart, isAuthenticated } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get<ProductResponse>(`/products/${productId}`);
        // The backend returns the product directly in response.data
        const productData = response.data as unknown as Product;
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Sync carousel with selected image index
  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setSelectedImageIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    carouselApi?.scrollTo(index);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      // Show success toast or notification here
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      // Show error toast or notification here
    } finally {
      setAddingToCart(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount?.percentage);
  const isOutOfStock = product.stock <= 0;
  const isDiscounted = product.discount && isDiscountValid(product.discount.startDate, product.discount.endDate);
  
  // Placeholder images for carousel
  const placeholderImages = [
    '/images/Screenshot 2025-06-26 152648.png',
    '/images/Screenshot 2025-06-26 152659.png'
  ];
  
  // Filter out invalid/placeholder URLs from database and use our screenshots instead
  const hasValidImages = product.images && product.images.length > 0 && 
    product.images.some(img => img.url && !img.url.includes('example.com') && !img.url.includes('placeholder'));
  
  // Use screenshot placeholders if no valid product images available
  const imagesToShow = hasValidImages 
    ? product.images.filter(img => img.url && !img.url.includes('example.com') && !img.url.includes('placeholder'))
    : placeholderImages.map(url => ({ url, isMain: false }));
  
  // Debug logs for troubleshooting
  console.log('=== ProductDetails Debug ===');
  console.log('Product images array:', product.images);
  console.log('Has valid images?', hasValidImages);
  console.log('Images to show in carousel:', imagesToShow);
  console.log('Using placeholder images?', !hasValidImages);
  console.log('==========================');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          {/* Main Image Carousel */}
          <div className="relative">
            <Carousel 
              className="w-full" 
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: false,
              }}
            >
              <CarouselContent>
                {imagesToShow.map((image, index) => (
                  <CarouselItem key={index}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="aspect-square relative cursor-zoom-in">
                          <img
                            src={image.url}
                            alt={`${product.name} ${index + 1}`}
                            className="object-cover w-full h-full rounded-lg transition-transform hover:scale-105"
                            onError={(e) => {
                              console.error('Image failed to load:', image.url);
                              // Fallback to our local screenshot
                              (e.target as HTMLImageElement).src = '/images/Screenshot 2025-06-26 152648.png';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', image.url);
                            }}
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-auto max-h-[80vh] object-contain"
                          onError={(e) => {
                            console.error('Dialog image failed to load:', image.url);
                            (e.target as HTMLImageElement).src = '/images/Screenshot 2025-06-26 152648.png';
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
            
            {/* Discount Badge */}
            {isDiscounted && (
              <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600">
                -{product.discount!.percentage}% OFF
              </Badge>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {imagesToShow.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imagesToShow.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Thumbnail image failed to load:', image.url);
                      (e.target as HTMLImageElement).src = '/images/Screenshot 2025-06-26 152648.png';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Section */}
        <div className="space-y-6">
          {/* Product Title & Brand */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.brand}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              ({product.averageRating}/5)
            </span>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-600">
                {formatPrice(discountedPrice)}
              </span>
              {isDiscounted && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {isDiscounted && (
              <p className="text-sm text-green-600 font-medium">
                You save {formatPrice(product.price - discountedPrice)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            <Badge 
              variant={isOutOfStock ? "destructive" : "default"}
              className={isOutOfStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
            >
              {isOutOfStock ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Out of Stock
                </>
              ) : (
                `✓ In Stock (${product.stock} available)`
              )}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Add to Cart Section */}
          {!isOutOfStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}

          {/* Pickup Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TruckIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Free pickup available at our store</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">2-year warranty included</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="usage">Usage & Warnings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{product.description}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Brand</h4>
                <p className="text-gray-600">{product.brand}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Average Rating</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(product.averageRating)}
                  </div>
                  <span className="text-gray-600">({product.averageRating}/5)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.specifications.weight && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-medium">Weight:</span>
                  <span className="sm:col-span-2 text-gray-600">{product.specifications.weight}</span>
                </div>
              )}
              {product.specifications.dimensions && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-medium">Dimensions:</span>
                  <span className="sm:col-span-2 text-gray-600">{product.specifications.dimensions}</span>
                </div>
              )}
              {product.specifications.ingredients?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-medium">Ingredients:</span>
                  <div className="sm:col-span-2">
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {product.specifications.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {product.specifications.storageInstructions && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-medium">Storage:</span>
                  <span className="sm:col-span-2 text-gray-600">{product.specifications.storageInstructions}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions & Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.specifications.usage && (
                <div>
                  <h4 className="font-medium mb-2 text-green-700">How to Use</h4>
                  <p className="text-gray-600 bg-green-50 p-4 rounded-md">{product.specifications.usage}</p>
                </div>
              )}
              
              {product.specifications.warnings?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Important Warnings
                  </h4>
                  <div className="bg-red-50 p-4 rounded-md">
                    <ul className="list-disc list-inside text-red-800 space-y-1">
                      {product.specifications.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetails; 