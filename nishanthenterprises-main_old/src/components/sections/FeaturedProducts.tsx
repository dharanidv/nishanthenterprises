import { ChevronLeft, ChevronRight, Heart, TrendingUp, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import popularProductsData from '@/data/popularProducts.json';
import apparelWearablesData from '@/data/apparelWearables.json';
import gadgetsAccessoriesData from '@/data/gadgetsAccessories.json';
import premiumGiftSetsData from '@/data/premiumGiftSets.json';
import writingStationeryData from '@/data/writingStationery.json';
import awardsRecognitionData from '@/data/awardsRecognition.json';
import drinkwareKitchenwareData from '@/data/drinkwareKitchenware.json';
import bagsTravelEssentialsData from '@/data/bagsTravelEssentials.json';
import ecoFriendlyProductsData from '@/data/ecoFriendlyProducts.json';
import seasonalProductsData from '@/data/seasonalProducts.json';

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  isBestSeller: boolean;
}

interface DataProduct {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  isBestSeller: boolean;
  description?: string;
  extraImages?: string[];
}

const FeaturedProducts = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Static collection of curated product images with their details
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Polo T-Shirt",
      price: "₹300.00",
      originalPrice: "₹350.00",
      discount: "",
      image: "/apparel_wearables/Polo_Tshirts/Poly_cotton/black.png",
      category: "apparel-wearables",
      subCategory: "corporate-tshirts-polo",
      rating: 4.8,
      reviews: 178,
      isNew: true,
      isBestSeller: false,
      description: "Premium polo t-shirt collection with tipping design in multiple colors"
    },
    {
      id: 2,
      name: "240 GSM Cotton T-Shirt",
      price: "₹390.00",
      originalPrice: "₹488.00",
      discount: "50",
      image: "/apparel_wearables/Polo_Tshirts/black.jpg",
      category: "gadgets-accessories",
      subCategory: "bluetooth-speakers",
      rating: 4.5,
      reviews: 112,
      isNew: true,
      isBestSeller: false,
      description: "Compact Stone 135 speaker for everyday use"
    },
    {
      id: 3,
      name: "Cotton Polo T-Shirt with Tipping Collection",
      price: "₹400",
      originalPrice: "₹500",
      discount: "50",
      image: "/apparel_wearables/Polo_Tshirts/Polo_tshirt_plain_with_tipping/Black%20Polo%20t-shirt%20tipping.png",
      category: "writing-stationery",
      subCategory: "plastic-pens",
      rating: 4.6,
      reviews: 89,
      isNew: false,
      isBestSeller: true,
      description: "High-quality plastic pen with smooth writing experience"
    },
    {
      id: 5,
      name: "Corporate Metal Trophy",
      price: "₹899.00",
      originalPrice: "₹1798.00",
      discount: "50",
      image: "/awards_and_recgonition/corporate_metal_trophy/134.png",
      category: "awards-recognition",
      subCategory: "corporate-metal-trophy",
      rating: 4.9,
      reviews: 234,
      isNew: false,
      isBestSeller: true,
      description: "Elegant corporate metal trophy for recognition and awards"
    },
    {
      id: 6,
      name: "M2122 Stainless Steel Insulated Hot and Cold Capacity 500ml",
      price: "₹360.00",
      originalPrice: "₹663.00",
      discount: "50",
      image: "/drinkware_kitchenware/vacuum_flask/M2122.jpg",
      category: "drinkware-kitchenware",
      subCategory: "personalized-bottles",
      rating: 4.6,
      reviews: 167,
      isNew: true,
      isBestSeller: false,
      description: "Custom personalized water bottle for corporate branding"
    },
    {
      id: 7,
      name: "AS23 - LAPTOP WITH DOUBLE BOTTLE & RAIN COVER",
      price: "₹950.00",
      originalPrice: "₹1125.00",
      discount: "50",
      image: "/bags_travel_essentials/bags/7.png",
      category: "bags-travel-essentials",
      subCategory: "bags",
      rating: 4.7,
      reviews: 145,
      isNew: false,
      isBestSeller: true,
      description: "Professional executive laptop bag with multiple compartments"
    },
    {
      id: 8,
      name: "Pen Stand with Calendar",
      price: "₹350.00",
      originalPrice: "₹438.00",
      discount: "50",
      image: "/gadgets_accessories/accessories/AH131.jpg",
      category: "eco-friendly-products",
      subCategory: "cups",
      rating: 4.5,
      reviews: 98,
      isNew: true,
      isBestSeller: false,
      description: "Eco-friendly bamboo coffee mug for sustainable living"
    },
    {
      id: 9,
      name: "J302 Welcome Gift Set",
      price: "₹2100.00",
      originalPrice: "₹2750.00",
      discount: "50",
      image: "/premium_gift_sets/welcome_gifts/J302.jpg",
      category: "seasonal-products",
      subCategory: "rain-coat",
      rating: 4.4,
      reviews: 76,
      isNew: false,
      isBestSeller: true,
      description: "High-quality rain protection gear for all seasons"
    },
   
    {
      id: 11,
      name: "Elite Fabric Sports Jersey",
      price: "₹550.00",
      originalPrice: "₹675.00",
      discount: "50",
      image: "/apparel_wearables/jersey/premium%20fabric%20jersey_.jpg",
      category: "gadgets-accessories",
      subCategory: "smart-watch",
      rating: 4.8,
      reviews: 189,
      isNew: true,
      isBestSeller: true,
      description: "Advanced smart watch with premium features and design"
    },
    {
      id: 12,
      name: "J09 Tech Gift Set",
      price: "₹1200.00",
      originalPrice: "₹2100.00",
      discount: "50",
      image: "/premium_gift_sets/tech_gifts/JDPB09.jpg",
      category: "gadgets-accessories",
      subCategory: "power-bank",
      rating: 4.7,
      reviews: 156,
      isNew: false,
      isBestSeller: true,
      description: "High-capacity power bank for all your charging needs"
    },
    {
      id: 14,
      name: "Professional Diary",
      price: "₹350.00",
      originalPrice: "₹700.00",
      discount: "50",
      image: "/writing_stationery/diary/A3B.jpg",
      category: "writing-stationery",
      subCategory: "diary",
      rating: 4.5,
      reviews: 134,
      isNew: false,
      isBestSeller: true,
      description: "Professional diary for organized planning and note-taking"
    }
  ];

  // Use featured products directly
  const products: Product[] = featuredProducts;

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-advance slides every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const currentProduct = products[currentSlide];

  return (
    <section className="py-12 md:py-20 bg-white relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="flex items-center justify-center mb-4 md:mb-8">
            <div className="w-4 md:w-8 h-px bg-gray-400 mr-2 md:mr-4"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black">Most Popular Products</h2>
            <div className="w-4 md:w-8 h-px bg-gray-400 ml-2 md:ml-4"></div>
          </div>
          <p className="text-gray-600 text-sm md:text-lg lg:text-xl max-w-3xl mx-auto px-4">
            Discover our most popular products that customers love. Premium quality, innovative designs, and exceptional value across all categories.
          </p>
        </div>

        {/* Main Content Grid - Mobile: Stacked, Desktop: 60% Text, 40% Image */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 items-center min-h-[400px] md:min-h-[600px] relative">
          {/* Left Side - Text Content (Mobile: Full width, Desktop: 60%) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="relative h-full flex flex-col justify-center">
              {/* Content with slide transition */}
              <div 
                className={`transition-all duration-500 ease-in-out ${
                  isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
                }`}
              >
                {/* Product Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  {currentProduct.isNew && (
                    <span className="bg-blue-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      NEW ARRIVAL
                    </span>
                  )}
                  {currentProduct.isBestSeller && (
                    <span className="bg-yellow-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      BEST SELLER
                    </span>
                  )}
                 
                </div>

                {/* Product Name */}
                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-black mb-4 md:mb-6 leading-tight">
                  {currentProduct.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 max-w-2xl">
                  Experience ultimate quality with our premium {currentProduct.name.toLowerCase()}. 
                  Crafted with the finest materials and designed for excellence, this product combines 
                  style and functionality perfectly. Perfect for corporate gifts, personal use, and special occasions.
                </p>

                {/* Price */}
                <div className="flex items-center space-x-3 md:space-x-4 mb-6 md:mb-8">
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">{currentProduct.price}</span>
                  <span className="text-lg md:text-xl text-gray-500 line-through">{currentProduct.originalPrice}</span>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
                    </div>
                    <span className="text-sm md:text-base text-gray-700">Premium Quality</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-600" />
                    </div>
                    <span className="text-sm md:text-base text-gray-700">Customer Approved</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-600" />
                    </div>
                    <span className="text-sm md:text-base text-gray-700">Best Seller</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm md:text-base text-gray-700">Fast Delivery</span>
                  </div>
                </div>

                                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button 
                    variant="outline" 
                    className="border-2 border-black text-black px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-black hover:text-white transition-colors duration-300 text-sm md:text-lg font-semibold"
                    onClick={() => {
                      // Navigate to the product category page
                      const categoryPath = `/products?category=all`;
                      window.location.href = categoryPath;
                    }}
                  >
                      View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image (Mobile: Full width, Desktop: 40%) */}
          <div className="lg:col-span-2 order-1 lg:order-2 relative">
            <div className="relative h-full flex items-center justify-center">
              {/* Image with slide transition */}
              <div 
                className={`relative w-full max-w-sm md:max-w-md transition-all duration-500 ease-in-out ${
                  isTransitioning ? 'opacity-0 scale-95 rotate-3' : 'opacity-100 scale-100 rotate-0'
                }`}
              >
                {/* Main Product Image */}
                <div className="relative bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl overflow-hidden">
                  <div className="w-full h-80 md:h-[500px] lg:h-[600px] xl:h-[700px] flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                       onClick={() => {
                         // Navigate to the product category page
                         const categoryPath = `/${currentProduct.category}`;
                         window.location.href = categoryPath;
                       }}>
                    <img
                      src={currentProduct.image}
                      alt={currentProduct.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-lg transform -rotate-6">
                    <Heart className="w-4 h-4 md:w-6 md:h-6 text-red-500" />
                  </div>
                  <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-lg transform rotate-6">
                    <Heart className="w-4 h-4 md:w-6 md:h-6 text-red-500" />
                  </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute -top-2 md:-top-4 -left-2 md:-left-4 w-6 h-6 md:w-8 md:h-8 border-2 border-gray-200 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 md:-bottom-4 -right-2 md:-right-4 w-4 h-4 md:w-6 md:h-6 border-2 border-gray-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              {/* Mobile Navigation Arrows - Positioned on Image */}
              {/* Previous Button - Mobile Only */}
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="lg:hidden absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors duration-300" />
              </button>

              {/* Next Button - Mobile Only */}
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="lg:hidden absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
                aria-label="Next product"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors duration-300" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Arrows - Positioned in middle of section */}
          {/* Previous Button - Left Side - Desktop Only */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="hidden lg:flex absolute -left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white border-2 border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
            aria-label="Previous product"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors duration-300" />
          </button>

          {/* Next Button - Right Side - Desktop Only */}
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white border-2 border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
            aria-label="Next product"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors duration-300" />
          </button>
        </div>

        {/* Slide Indicators - Bottom Center */}
        <div className="flex justify-center items-center mt-8 md:mt-12">
          <div className="flex space-x-2 md:space-x-3">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`transition-all duration-300 ease-in-out ${
                  currentSlide === index 
                    ? 'w-8 md:w-12 h-2 md:h-3 bg-black' 
                    : 'w-2 md:w-3 h-2 md:h-3 bg-gray-300 hover:bg-gray-400'
                } rounded-full disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4 md:mt-6">
          <span className="text-xs md:text-sm text-gray-500 font-medium">
            {currentSlide + 1} of {products.length}
          </span>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;