import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import screenshot1 from '../images/Screenshot 2025-06-26 152648.png';
import screenshot2 from '../images/Screenshot 2025-06-26 152659.png';
import type { CarouselApi } from "./ui/carousel";

const carouselData = [
  {
    image: screenshot1,
    title: "Summer Collection 2024",
    description: "Discover our latest arrivals with up to 40% off",
    ctaText: "Shop Now",
    ctaLink: "/category/summer"
  },
  {
    image: screenshot2,
    title: "Health & Wellness",
    description: "Premium healthcare products for your well-being",
    ctaText: "Explore",
    ctaLink: "/category/health"
  },
  {
    image: screenshot1,
    title: "Special Offers",
    description: "Limited time deals on selected items",
    ctaText: "View Deals",
    ctaLink: "/offers"
  },
];

// Preload images
const preloadImages = () => {
  carouselData.forEach(slide => {
    const img = new Image();
    img.src = slide.image;
  });
};

export default function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images on mount
  useEffect(() => {
    preloadImages();
    const loadPromises = carouselData.map(slide => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.src = slide.image;
      });
    });
    
    Promise.all(loadPromises).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Autoplay functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {carouselData.map((slide, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={16 / 9} className="bg-muted">
                <div 
                  className={`w-full h-full overflow-hidden rounded-lg relative group contain-paint`}
                  style={{ 
                    opacity: imagesLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    willChange: 'transform',
                    contain: 'content'
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)'
                    }}
                  />
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h2 className="text-4xl font-bold mb-3">{slide.title}</h2>
                    <p className="text-xl mb-4 opacity-90">{slide.description}</p>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="bg-white text-black hover:bg-black hover:text-white transition-colors duration-300"
                    >
                      {slide.ctaText}
                    </Button>
                  </div>
                </div>
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced navigation controls */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white transition-colors duration-200" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white transition-colors duration-200" />

        {/* Progress indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselData.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                current === index ? "bg-white w-6" : "bg-red/50"
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </Carousel> 
    </div>
  );
} 