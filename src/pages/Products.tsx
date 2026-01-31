import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSearchParams } from 'react-router-dom';

// Import all product data
import collarNeckData from '@/data/collarNeckTshirts.json';
import roundNeckData from '@/data/roundNeckTshirts.json';
import jerseysData from '@/data/jerseys.json';
import shirtsData from '@/data/shirts.json';
import corporateGiftsData from '@/data/corporateGifts.json';

// Import new structured JSON files
import apparelWearablesData from '@/data/apparelWearables.json';
import bagsTravelEssentialsData from '@/data/bagsTravelEssentials.json';
import ecoFriendlyProductsData from '@/data/ecoFriendlyProducts.json';
import drinkwareKitchenwareData from '@/data/drinkwareKitchenware.json';
import writingStationeryData from '@/data/writingStationery.json';
import awardsRecognitionData from '@/data/awardsRecognition.json';
import gadgetsAccessoriesData from '@/data/gadgetsAccessories.json';
import officeEssentialsData from '@/data/officeEssentials.json';
import premiumGiftSetsData from '@/data/premiumGiftSets.json';
import seasonalProductsData from '@/data/seasonalProducts.json';

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  extraImages?: string[];
  rating: number;
  reviews: number;
  isNew: boolean;
  isBestSeller: boolean;
  description: string;
}

interface SubCategory {
  id: string;
  name: string;
  image?: string;
  bgColor?: string;
  products: Product[];
}

interface CategoryData {
  category: string;
  subCategories: SubCategory[];
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);
  const navigate = useNavigate();

  // Carousel state for each subcategory
  const [carouselStates, setCarouselStates] = useState<{ [key: string]: number }>({});
  const [allProductsCarouselState, setAllProductsCarouselState] = useState(0);
  const [categoriesCarouselState, setCategoriesCarouselState] = useState(0);

  // Categories carousel navigation functions
  const nextCategoriesSlide = () => {
    const container = document.getElementById('categories-carousel');
    if (container) {
      const itemWidth = 200; // Approximate width of each category item
      const scrollAmount = itemWidth * 3; // Scroll by 3 items at a time
      container.scrollLeft += scrollAmount;
    }
  };

  const prevCategoriesSlide = () => {
    const container = document.getElementById('categories-carousel');
    if (container) {
      const itemWidth = 200; // Approximate width of each category item
      const scrollAmount = itemWidth * 3; // Scroll by 3 items at a time
      container.scrollLeft -= scrollAmount;
    }
  };

  // Animation refs and controls
  const refs = {
    header: useRef(null),
    categories: useRef(null),
    products: useRef(null)
  };

  const controls = {
    header: useAnimation(),
    categories: useAnimation(),
    products: useAnimation()
  };

  const isInView = {
    header: useInView(refs.header, { once: true }),
    categories: useInView(refs.categories, { once: true }),
    products: useInView(refs.products, { once: true })
  };

  useEffect(() => {
    Object.keys(isInView).forEach((key) => {
      if (isInView[key as keyof typeof isInView]) {
        controls[key as keyof typeof controls].start('visible');
      }
    });
  }, [isInView, controls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const productItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  // Carousel navigation functions
  const nextSlide = (subCategoryId: string, totalProducts: number) => {
    const currentState = carouselStates[subCategoryId] || 0;
    const maxSlides = Math.max(0, Math.ceil(totalProducts / 6) - 1);
    setCarouselStates(prev => ({
      ...prev,
      [subCategoryId]: Math.min(currentState + 1, maxSlides)
    }));
  };

  const prevSlide = (subCategoryId: string) => {
    const currentState = carouselStates[subCategoryId] || 0;
    setCarouselStates(prev => ({
      ...prev,
      [subCategoryId]: Math.max(currentState - 1, 0)
    }));
  };

  const nextAllProductsSlide = () => {
    const maxSlides = Math.max(0, Math.ceil(currentProducts.length / 6) - 1);
    setAllProductsCarouselState(prev => Math.min(prev + 1, maxSlides));
  };

  const prevAllProductsSlide = () => {
    setAllProductsCarouselState(prev => Math.max(prev - 1, 0));
  };

  // Get products for carousel display
  const getCarouselProducts = (products: Product[], subCategoryId: string) => {
    const currentState = carouselStates[subCategoryId] || 0;
    const startIndex = currentState * 6;
    return products.slice(startIndex, startIndex + 6);
  };

  const getAllProductsCarousel = () => {
    const startIndex = allProductsCarouselState * 6;
    return currentProducts.slice(startIndex, startIndex + 6);
  };

  // Get category from URL params
  const categoryFromUrl = searchParams.get('category') || 'all';
  const subcategoryFromUrl = searchParams.get('subcategory');

  // Define all category data
  const allCategoryData: { [key: string]: CategoryData } = {
    'apparel-wearables': apparelWearablesData,
    'bags-travel-essentials': bagsTravelEssentialsData,
    'eco-friendly-products': ecoFriendlyProductsData,
    'drinkware-kitchenware': drinkwareKitchenwareData,
    'writing-stationery': writingStationeryData,
    'awards-recognition': awardsRecognitionData,
    'gadgets-accessories': gadgetsAccessoriesData,
    'office-essentials': officeEssentialsData,
    'premium-gift-sets': premiumGiftSetsData,
    'seasonal-products': seasonalProductsData,
  };

  // Load all products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
    const allProductsData = [
      ...collarNeckData.products,
      ...roundNeckData.products,
      ...jerseysData.products,
      ...shirtsData.products,
      ...corporateGiftsData.products,
    ];

        // Add products from new structured JSON files
        Object.values(allCategoryData).forEach(categoryData => {
          categoryData.subCategories.forEach(subCategory => {
            allProductsData.push(...subCategory.products);
          });
        });

    setAllProducts(allProductsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Update active category and subcategory when URL changes
  useEffect(() => {
    setActiveCategory(categoryFromUrl);
    setActiveSubCategory(subcategoryFromUrl);
  }, [categoryFromUrl, subcategoryFromUrl]);

  // Scroll to top when component mounts or category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(null);
    navigate(`/products?category=${categoryId}`);
  };

  const handleSubCategoryClick = (subCategoryId: string) => {
    setActiveSubCategory(subCategoryId);
    // Scroll to the specific subcategory section
    const subcategorySection = document.getElementById(`subcategory-${subCategoryId}`);
    if (subcategorySection) {
      subcategorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleProductClick = (product: Product) => {
    // Find which category this product belongs to
    let category = 'collar-neck'; // Default fallback
    
    // Check each old category to find where this product belongs
    if (collarNeckData.products.find(p => p.id === product.id)) {
      category = 'collar-neck';
    } else if (roundNeckData.products.find(p => p.id === product.id)) {
      category = 'round-neck';
    } else if (jerseysData.products.find(p => p.id === product.id)) {
      category = 'jerseys';
    } else if (shirtsData.products.find(p => p.id === product.id)) {
      category = 'shirts';
    } else if (corporateGiftsData.products.find(p => p.id === product.id)) {
      category = 'corporate-gifts';
    } else {
      // Check new structured data
      for (const [catKey, catData] of Object.entries(allCategoryData)) {
        for (const subCat of catData.subCategories) {
          if (subCat.products.find(p => p.id === product.id)) {
            category = catKey;
            break;
          }
        }
        if (category !== 'collar-neck') break; // Break outer loop if found
      }
    }
    
    navigate(`/product/${category}/${product.id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Reset zoom states
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setIsZoomed(false);
    setIsDragging(false);
    setCurrentImageIndex(0);
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';
  };

  const handleNextImage = () => {
    if (selectedProduct && selectedProduct.extraImages) {
      const totalImages = 1 + selectedProduct.extraImages.length; // Main image + extra images
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
      // Reset zoom when changing images
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setIsZoomed(false);
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct && selectedProduct.extraImages) {
      const totalImages = 1 + selectedProduct.extraImages.length; // Main image + extra images
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
      // Reset zoom when changing images
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setIsZoomed(false);
    }
  };

  const handleImageClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setCurrentImageIndex(0); // Reset to first image
    setImageZoom(1); // Reset zoom
    setImagePosition({ x: 0, y: 0 }); // Reset position
    setIsZoomed(false); // Reset zoom state
    setIsDragging(false); // Reset drag state
    setIsModalOpen(true);
    // Disable body scrolling when modal opens
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(imageZoom + 0.5, 3);
    setImageZoom(newZoom);
    setImagePosition({ x: 0, y: 0 }); // Reset position when zooming
    setIsZoomed(newZoom > 1);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(imageZoom - 0.5, 0.5);
    setImageZoom(newZoom);
    setImagePosition({ x: 0, y: 0 }); // Reset position when zooming
    setIsZoomed(newZoom > 1);
  };

  // Double-click zoom toggle
  const handleDoubleClick = () => {
    if (imageZoom === 1) {
      setImageZoom(2);
      setIsZoomed(true);
    } else {
      setImageZoom(1);
      setIsZoomed(false);
    }
    setImagePosition({ x: 0, y: 0 }); // Reset position when zooming
  };

  // Single click zoom (mobile)
  const handleSingleClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;
    
    if (timeDiff < 300) { // Double tap detected
      handleDoubleClick();
    } else {
      setLastTapTime(currentTime);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setImagePosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom if Ctrl key is held (desktop) or on mobile
    if (e.ctrlKey || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Touch handlers for pinch-to-zoom and drag
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      // Pinch gesture started
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      setTouchStartDistance(distance);
      setInitialZoom(imageZoom);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Single touch - handle double tap or start drag
      if (imageZoom > 1) {
        // Start dragging if zoomed
        setIsDragging(true);
        setDragStart({ 
          x: e.touches[0].clientX - imagePosition.x, 
          y: e.touches[0].clientY - imagePosition.y 
        });
      } else {
        // Handle double tap for zoom
        handleSingleClick();
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      // Pinch gesture
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      
      if (touchStartDistance > 0) {
        const scale = distance / touchStartDistance;
        const newZoom = Math.max(0.5, Math.min(3, initialZoom * scale));
        setImageZoom(newZoom);
        setIsZoomed(newZoom > 1);
      }
      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging && imageZoom > 1) {
      // Single touch drag when zoomed
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setImagePosition({ x: newX, y: newY });
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchStartDistance(0);
    setInitialZoom(1);
    setIsDragging(false);
  };

  // Get current subcategories based on active category
  const getCurrentSubCategories = () => {
    if (activeCategory === 'all') {
      // Show all subcategories from all categories
      const allSubCategories: SubCategory[] = [];
      Object.values(allCategoryData).forEach(categoryData => {
        allSubCategories.push(...categoryData.subCategories);
      });
      return allSubCategories;
    }
    
    const categoryData = allCategoryData[activeCategory];
    return categoryData ? categoryData.subCategories : [];
  };

  // Get products to display
  const getProductsToDisplay = () => {
    if (activeCategory === 'all') {
      return allProducts;
    } else if (activeSubCategory) {
      const categoryData = allCategoryData[activeCategory];
      if (categoryData) {
        const subCategory = categoryData.subCategories.find(sc => sc.id === activeSubCategory);
        return subCategory ? subCategory.products : [];
      }
    } else {
      // Show all products from the selected main category
      const categoryData = allCategoryData[activeCategory];
      if (categoryData) {
        return categoryData.subCategories.flatMap(sc => sc.products);
      }
    }
    return [];
  };

  const currentProducts = getProductsToDisplay();
  const currentSubCategories = getCurrentSubCategories();

  // Force re-render when data is loaded
  useEffect(() => {
    if (!isLoading && currentSubCategories.length > 0) {
      // Trigger a re-render of the categories section
      controls.categories.start('visible');
    }
  }, [isLoading, currentSubCategories.length, controls.categories]);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Header />
      <main>
        {/* Page Header */}
        <motion.section 
          ref={refs.header}
          initial="hidden"
          animate={controls.header}
          variants={fadeInUp}
          className="py-4 md:py-6 lg:py-8 bg-gray-50"
        >
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2">
                Our Products
              </h1>
              {activeCategory === 'all' ? (
                <p className="text-lg md:text-xl text-gray-600">
                  All Products
                </p>
              ) : (
                <p className="text-lg md:text-xl text-gray-600 capitalize">
                  {activeCategory.replace(/-/g, ' ')}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* Category Circles - Similar to reference image */}
        {!isLoading && currentSubCategories.length > 0 && (
          <motion.section 
            ref={refs.categories}
            initial="hidden"
            animate={controls.categories}
            variants={fadeInUp}
            className="py-8 md:py-16 bg-white border-b border-gray-200"
            key={`categories-${activeCategory}`} // Force re-render when category changes
          >
            <div className="container mx-auto px-4">
              <div className="relative">
                {/* Navigation Buttons */}
                <button 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200"
                  onClick={prevCategoriesSlide}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                  <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200"
                  onClick={nextCategoriesSlide}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>

                {/* Fading overlay for left and right */}
                <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex justify-center">
                  <div 
                    id="categories-carousel"
                    className="flex gap-8 md:gap-16 overflow-x-auto scrollbar-hide pb-4 md:pb-6 px-4 md:px-8 scroll-smooth"
                    style={{
                      scrollBehavior: 'smooth'
                    }}
                  >
                    {currentSubCategories.map((subCategory, index) => (
                      <div
                        key={subCategory.id}
                        className={`flex flex-col items-center cursor-pointer group flex-shrink-0 transition-all duration-300 p-2 md:p-4 ${
                          activeSubCategory === subCategory.id ? 'scale-110' : ''
                        }`}
                        onClick={() => handleSubCategoryClick(subCategory.id)}
                      >
                        {/* Circular Image Container */}
                        <div 
                          className="relative w-20 h-20 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full mb-2 md:mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl flex items-center justify-center overflow-hidden border-2 border-gray-200"
                          style={{
                            backgroundColor: subCategory.bgColor === 'bg-orange-500' ? '#f97316' :
                                            subCategory.bgColor === 'bg-blue-500' ? '#3b82f6' :
                                            subCategory.bgColor === 'bg-gray-700' ? '#374151' :
                                            subCategory.bgColor === 'bg-green-600' ? '#16a34a' :
                                            subCategory.bgColor === 'bg-purple-500' ? '#8b5cf6' :
                                            subCategory.bgColor === 'bg-teal-700' ? '#0f766e' :
                                            subCategory.bgColor === 'bg-teal-600' ? '#0d9488' :
                                            subCategory.bgColor === 'bg-teal-500' ? '#14b8a6' :
                                            subCategory.bgColor === 'bg-green-600' ? '#16a34a' :
                                            subCategory.bgColor === 'bg-green-500' ? '#22c55e' :
                                            subCategory.bgColor === 'bg-green-400' ? '#4ade80' :
                                            subCategory.bgColor === 'bg-green-300' ? '#86efac' :
                                            subCategory.bgColor === 'bg-blue-500' ? '#3b82f6' :
                                            subCategory.bgColor === 'bg-blue-600' ? '#2563eb' :
                                            subCategory.bgColor === 'bg-blue-700' ? '#1d4ed8' :
                                            subCategory.bgColor === 'bg-blue-800' ? '#1e40af' :
                                            subCategory.bgColor === 'bg-purple-500' ? '#8b5cf6' :
                                            subCategory.bgColor === 'bg-purple-600' ? '#7c3aed' :
                                            subCategory.bgColor === 'bg-purple-700' ? '#6d28d9' :
                                            subCategory.bgColor === 'bg-purple-800' ? '#5b21b6' :
                                            subCategory.bgColor === 'bg-purple-900' ? '#4c1d95' :
                                            subCategory.bgColor === 'bg-yellow-500' ? '#eab308' :
                                            subCategory.bgColor === 'bg-yellow-600' ? '#ca8a04' :
                                            subCategory.bgColor === 'bg-gray-700' ? '#374151' :
                                            subCategory.bgColor === 'bg-gray-600' ? '#4b5563' :
                                            subCategory.bgColor === 'bg-gray-500' ? '#6b7280' :
                                            subCategory.bgColor === 'bg-gray-400' ? '#9ca3af' :
                                            subCategory.bgColor === 'bg-gray-300' ? '#d1d5db' :
                                            subCategory.bgColor === 'bg-green-500' ? '#22c55e' :
                                            subCategory.bgColor === 'bg-green-600' ? '#16a34a' :
                                            subCategory.bgColor === 'bg-green-700' ? '#15803d' :
                                            subCategory.bgColor === 'bg-green-800' ? '#166534' :
                                            '#6b7280' // Default gray color
                          }}
                        >
                          <img
                            src={subCategory.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'}
                            alt={subCategory.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Category Name */}
                        <h3 className="text-xs md:text-base font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight max-w-20 md:max-w-28 lg:max-w-32">
                          {subCategory.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Subcategory Products with Carousel */}
        {currentSubCategories.length > 0 && (
          <motion.section
            ref={refs.products}
            initial="hidden"
            animate={controls.products}
            variants={staggerContainer}
            className="py-6 md:py-12"
            id="products-section"
          >
            <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              {currentSubCategories.map((subCategory) => (
                <motion.div 
                  key={subCategory.id}
                  variants={fadeInUp}
                  className="mb-12"
                  id={`subcategory-${subCategory.id}`}
                >
                  {/* Section Header with Carousel Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                      {subCategory.name}
                      <svg className="w-6 h-6 ml-2 text-gray-600 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </h2>
                    <div className="hidden items-center space-x-2">
                      <button 
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => prevSlide(subCategory.id)}
                        disabled={(carouselStates[subCategory.id] || 0) === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => nextSlide(subCategory.id, subCategory.products.length)}
                        disabled={(carouselStates[subCategory.id] || 0) >= Math.ceil(subCategory.products.length / 6) - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Products Carousel */}
                  <div className="relative">
                    <div className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide">
                      {getCarouselProducts(subCategory.products, subCategory.id).map((product) => (
                        <motion.div 
                          key={product.id} 
                          variants={productItem}
                          className="group flex-shrink-0 w-64 md:w-72 lg:w-80"
                        >
                          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer border border-gray-200" onClick={() => handleProductClick(product)}>
                            {/* Product Image */}
                            <div className="relative overflow-hidden flex-shrink-0 p-2 md:p-3 bg-white">
                              <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-xl h-80 md:h-96 bg-white">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                  onClick={(e) => handleImageClick(product, e)}
                                />
                                
                                {/* Product Badges */}
                                <div className="absolute top-2 left-2">
                                  {product.isNew && (
                                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium mb-1">
                                      In-House
                                    </span>
                                  )}
                                  {product.isBestSeller && (
                                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      Branded
                                    </span>
                                  )}
                                </div>

                                {/* Discount Badge */}
                                {product.discount && product.discount.trim() !== '' && (
                                  <div className="absolute top-2 right-2">
                                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      {product.discount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-3 md:p-4 flex-1 flex flex-col">
                              {/* Product Name */}
                              <h3 className="text-xs font-bold text-black mb-1 line-clamp-2 flex-shrink-0">
                                {product.name}
                              </h3>

                              {/* Price */}
                              <div className="flex items-center space-x-1 mb-2 flex-shrink-0">
                                <span className="text-sm font-bold text-black">{product.price}</span>
                                <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* See More Button */}
                  <div className="text-center mt-6">
                    <button 
                      className="inline-flex items-center justify-center px-4 py-2 md:px-8 md:py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-300 min-w-[150px] md:min-w-[200px] text-sm md:text-base"
                      onClick={() => navigate(`/subcategory/${activeCategory}/${subCategory.id}`)}
                    >
                      <span>See More {subCategory.name}</span>
                      <div className="flex items-center ml-2 md:ml-3 space-x-1">
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Products Carousel - For when no subcategories or "All Products" */}
        {currentSubCategories.length === 0 && (
          <motion.section 
            ref={refs.products}
            initial="hidden"
            animate={controls.products}
            variants={staggerContainer}
            className="py-6 md:py-12"
            id="products-section"
          >
            <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              {/* Section Header */}
              <motion.div 
                variants={fadeInUp}
                className="mb-6 md:mb-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activeSubCategory 
                      ? currentSubCategories.find(sc => sc.id === activeSubCategory)?.name 
                      : activeCategory === 'all' 
                        ? 'All Products' 
                        : 'Products'
                    }
                  </h2>
          </div>
                <p className="text-gray-600 text-sm md:text-base mt-2">
                  Showing {currentProducts.length} products
                </p>
              </motion.div>

              {/* All Products Carousel */}
              <div className="relative">
                <div className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide">
                  {getAllProductsCarousel().map((product) => (
                    <motion.div 
                      key={product.id} 
                      variants={productItem}
                      className="group flex-shrink-0 w-64 md:w-72 lg:w-80"
                    >
                      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer border border-gray-200" onClick={() => handleProductClick(product)}>
                    {/* Product Image */}
                        <div className="relative overflow-hidden flex-shrink-0 p-3 md:p-4 bg-white">
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-xl h-80 md:h-96 bg-white">
                      <img
                        src={product.image}
                        alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={(e) => handleImageClick(product, e)}
                      />
                      
                      {/* Product Badges */}
                            <div className="absolute top-2 left-2">
                              {product.isNew && (
                                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium mb-1">
                                  NEW
                                </span>
                              )}
                              {product.isBestSeller && (
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  BEST SELLER
                                </span>
                              )}
                            </div>

                      {/* Discount Badge */}
                      {product.discount && product.discount.trim() !== '' && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {product.discount}
                          </span>
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button 
                              className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors duration-300" />
                      </button>
                          </div>
                    </div>

                    {/* Product Info */}
                        <div className="p-3 md:p-4 flex-1 flex flex-col">
                      {/* Product Name */}
                          <h3 className="text-sm md:text-base font-bold text-black mb-2 line-clamp-2 flex-shrink-0">
                        {product.name}
                      </h3>

                      {/* Price */}
                          <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
                            <span className="text-lg md:text-xl font-bold text-black">{product.price}</span>
                            <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      </div>

                          {/* Description */}
                          <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 flex-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                    </motion.div>
                  ))}
                </div>
            </div>

            {/* No Products Message */}
              {currentProducts.length === 0 && (
                <motion.div 
                  variants={fadeInUp}
                  className="text-center py-12"
                >
                <p className="text-gray-600 text-lg">No products found in this category.</p>
                </motion.div>
            )}
          </div>
          </motion.section>
        )}
      </main>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
          onTouchMove={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div 
            className="bg-white rounded-lg w-[300px] md:w-[600px] h-[500px] md:h-[900px] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Product Image */}
            <div className="flex-1 p-2 md:p-4 overflow-hidden relative">
              <div 
                className={`w-full h-full overflow-hidden rounded-lg ${
                  isZoomed ? 'cursor-grab' : 'cursor-zoom-in'
                } ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={currentImageIndex === 0 
                    ? selectedProduct.image 
                    : selectedProduct.extraImages?.[currentImageIndex - 1] || selectedProduct.image
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain object-center select-none"
                  style={{ 
                    transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    transformOrigin: 'center center',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  draggable={false}
                />
              </div>
              
              {/* Zoom Controls */}
              <div className="absolute top-3 left-3 flex flex-col space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={imageZoom >= 3}
                  title="Zoom In (Ctrl + Scroll)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={imageZoom <= 0.5}
                  title="Zoom Out (Ctrl + Scroll)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                {isZoomed && (
                  <button
                    onClick={() => {
                      setImageZoom(1);
                      setIsZoomed(false);
                      setImagePosition({ x: 0, y: 0 });
                    }}
                    className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl"
                    title="Reset Zoom"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Zoom Level Indicator */}
              {isZoomed && (
                <div className="absolute top-3 right-3 bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-gray-200">
                  {Math.round(imageZoom * 100)}%
                </div>
              )}
              
              {/* Image Navigation Buttons - Only show for bags & travel essentials */}
              {selectedProduct.extraImages && selectedProduct.extraImages.length > 0 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-gray-200">
                    {currentImageIndex + 1} / {1 + selectedProduct.extraImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery - Only show for bags & travel essentials */}
            {selectedProduct.extraImages && selectedProduct.extraImages.length > 0 && (
              <div className="p-2 md:p-4 border-t border-gray-200">
                <div className="flex justify-center">
                  <div className="flex space-x-2 overflow-x-auto scrollbar-hide max-w-full">
                    {/* Main Image Thumbnail */}
                    <button
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setImageZoom(1); // Reset zoom when changing image
                        setImagePosition({ x: 0, y: 0 }); // Reset position
                        setIsZoomed(false); // Reset zoom state
                      }}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        currentImageIndex === 0 
                          ? 'border-blue-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={selectedProduct.image}
                        alt={`${selectedProduct.name} - Main`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    
                    {/* Extra Images Thumbnails */}
                    {selectedProduct.extraImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index + 1);
                          setImageZoom(1); // Reset zoom when changing image
                          setImagePosition({ x: 0, y: 0 }); // Reset position
                          setIsZoomed(false); // Reset zoom state
                        }}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === index + 1 
                            ? 'border-blue-500 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${selectedProduct.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="p-3 md:p-6 border-t border-gray-200">
              <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                {selectedProduct.name}
              </h3>
              
              <div className="flex items-center space-x-2">
                <span className="text-base md:text-xl font-bold text-black">{selectedProduct.price}</span>
                <span className="text-xs md:text-sm text-gray-500 line-through">{selectedProduct.originalPrice}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default Products; 