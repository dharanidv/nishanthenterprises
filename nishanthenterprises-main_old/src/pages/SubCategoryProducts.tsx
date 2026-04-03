import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

const SubCategoryProducts = () => {
  const { categoryId, subCategoryId } = useParams();
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [mainCategory, setMainCategory] = useState<string>('');
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
  const [sortOrder, setSortOrder] = useState<'default' | 'price-high-low' | 'price-low-high'>('default');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Animation refs and controls
  const refs = {
    header: useRef(null),
    products: useRef(null)
  };

  const controls = {
    header: useAnimation(),
    products: useAnimation()
  };

  const isInView = {
    header: useInView(refs.header, { once: true }),
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
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

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

  // Load subcategory data
  useEffect(() => {
    const loadSubCategoryData = async () => {
      setIsLoading(true);
      // Reset filtered products when loading new data
      setFilteredProducts([]);
      try {
        if (categoryId && subCategoryId) {
          
          // Handle "all" category - search through all categories
          if (categoryId === 'all') {
            console.log('Searching through all categories for subcategory:', subCategoryId);
            
            // Search through all category data
            for (const [catId, categoryData] of Object.entries(allCategoryData)) {
              const foundSubCategory = categoryData.subCategories.find(sc => sc.id === subCategoryId);
              if (foundSubCategory) {
                console.log('Found subcategory in category:', catId, foundSubCategory);
                setSubCategory(foundSubCategory);
                setMainCategory(catId); // Set the actual category ID, not 'all'
                setIsLoading(false);
                return;
              }
            }
            
            // If not found in new structured data, check old data
            const oldCategories = {
              'collar-neck': collarNeckData,
              'round-neck': roundNeckData,
              'jerseys': jerseysData,
              'shirts': shirtsData,
              'corporate-gifts': corporateGiftsData,
            };

            for (const [catId, oldCategoryData] of Object.entries(oldCategories)) {
              if (oldCategoryData.category === subCategoryId || catId === subCategoryId) {
                console.log('Found old category data:', oldCategoryData);
                const oldSubCategory: SubCategory = {
                  id: subCategoryId,
                  name: oldCategoryData.category || catId,
                  products: oldCategoryData.products,
                  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
                  bgColor: 'bg-gray-500'
                };
                setSubCategory(oldSubCategory);
                setMainCategory(catId);
                setIsLoading(false);
                return;
              }
            }
          } else {
            // Check if it's from new structured data
            const categoryData = allCategoryData[categoryId];
            if (categoryData) {
              const foundSubCategory = categoryData.subCategories.find(sc => sc.id === subCategoryId);
              if (foundSubCategory) {
                setSubCategory(foundSubCategory);
                setMainCategory(categoryId);
                setIsLoading(false);
                return;
              }
            }

            // Check old data structure
            const oldCategories = {
              'collar-neck': collarNeckData,
              'round-neck': roundNeckData,
              'jerseys': jerseysData,
              'shirts': shirtsData,
              'corporate-gifts': corporateGiftsData,
            };

            const oldCategoryData = oldCategories[categoryId as keyof typeof oldCategories];
            if (oldCategoryData) {
              console.log('Found old category data:', oldCategoryData);
              // For old structure, create a subcategory object
              const oldSubCategory: SubCategory = {
                id: subCategoryId,
                name: oldCategoryData.category || categoryId,
                products: oldCategoryData.products,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
                bgColor: 'bg-gray-500'
              };
              setSubCategory(oldSubCategory);
              setMainCategory(categoryId);
            }
          }
        }
      } catch (error) {
        console.error('Error loading subcategory data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubCategoryData();
  }, [categoryId, subCategoryId]);

  // Force re-render when data is loaded
  useEffect(() => {
    if (!isLoading && subCategory) {
      controls.header.start('visible');
      controls.products.start('visible');
    }
  }, [isLoading, subCategory, controls.header, controls.products]);

  // Initialize filtered products when subcategory loads
  useEffect(() => {
    if (subCategory && subCategory.products && filteredProducts.length === 0) {
      setFilteredProducts([...subCategory.products]);
    }
  }, [subCategory, filteredProducts.length]);

  // Sort products based on sort order
  useEffect(() => {
    if (subCategory && subCategory.products) {
      let sortedProducts = [...subCategory.products];
      
      if (sortOrder === 'price-high-low') {
        sortedProducts.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[₹,]/g, ''));
          const priceB = parseFloat(b.price.replace(/[₹,]/g, ''));
          return priceB - priceA;
        });
      } else if (sortOrder === 'price-low-high') {
        sortedProducts.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[₹,]/g, ''));
          const priceB = parseFloat(b.price.replace(/[₹,]/g, ''));
          return priceA - priceB;
        });
      }
      // For 'default', keep original order
      
      setFilteredProducts(sortedProducts);
    }
  }, [subCategory, sortOrder]);

  // Get the products to display (use filteredProducts if available, otherwise use subCategory.products)
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : (subCategory?.products || []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProductClick = (product: Product) => {
    // Product click disabled - no navigation
    return;
  };

  const handleBackToProducts = () => {
    navigate(`/products?category=${mainCategory}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!subCategory) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subcategory Not Found</h1>
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" key={`subcategory-${subCategory?.id || 'loading'}`}>
      <Header />
      <main>
        {/* Page Header */}
        {subCategory && (
          <motion.section 
            ref={refs.header}
            initial="hidden"
            animate={controls.header}
            variants={fadeInUp}
            className="py-2 md:py-6 lg:py-8 bg-gray-50"
          >
            <div className="container mx-auto px-2 md:px-4">
              <div className="text-center">
                <button 
                  onClick={handleBackToProducts}
                  className="flex items-center justify-center mx-auto mb-2 md:mb-4 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </button>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mb-1 md:mb-2">
                  {subCategory.name}
                </h1>
                <p className="text-sm md:text-lg lg:text-xl text-gray-600">
                  {subCategory.products.length} products available
                </p>
              </div>
            </div>
          </motion.section>
        )}



        {/* Products Grid */}
        {subCategory && (
          <motion.section 
            ref={refs.products}
            initial="hidden"
            animate={controls.products}
            variants={staggerContainer}
            className="py-3 md:py-12"
          >
            <div className="container mx-auto px-2 md:px-4">
              {/* Section Header */}
              <motion.div 
                variants={fadeInUp}
                className="mb-3 md:mb-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
                    All {subCategory.name}
                  </h2>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-xs md:text-base font-medium text-gray-700">
                      Filter by Price
                    </span>
                    <div className="flex items-center gap-1 md:gap-3">
                      <button
                        onClick={() => setSortOrder('price-low-high')}
                        className={`w-6 h-6 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 relative group ${
                          sortOrder === 'price-low-high'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Price: Low to High"
                      >
                        <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Price: Low to High
                        </div>
                      </button>
                      <button
                        onClick={() => setSortOrder('price-high-low')}
                        className={`w-6 h-6 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 relative group ${
                          sortOrder === 'price-high-low'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Price: High to Low"
                      >
                        <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Price: High to Low
                        </div>
                      </button>
                      <button
                        onClick={() => setSortOrder('default')}
                        className={`w-6 h-6 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 relative group ${
                          sortOrder === 'default'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Reset to default order"
                      >
                        <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Reset to default order
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-xs md:text-base mt-1 md:mt-2">
                  Showing {displayProducts.length} products
                </p>
              </motion.div>

              {/* Products Grid - 2 columns on mobile, 3-4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2 md:gap-6">
                {displayProducts && displayProducts.length > 0 ? displayProducts.map((product) => (
                  <motion.div 
                    key={product.id} 
                    variants={productItem}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-200">
                      {/* Product Image */}
                      <div className="relative overflow-hidden flex-shrink-0 p-1 md:p-4 bg-white">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-xl h-64 md:h-96 bg-white">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={(e) => handleImageClick(product, e)}
                          />
                          
                          {/* Product Badges */}
                          <div className="absolute top-1 md:top-2 left-1 md:left-2">
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
                            <div className="absolute top-1 md:top-2 right-1 md:right-2">
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {product.discount}
                              </span>
                            </div>
                          )}

                          {/* Extra Images Indicator */}
                          {product.extraImages && product.extraImages.length > 0 && (
                            <div 
                              className="absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg cursor-pointer hover:bg-green-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(product, e);
                              }}
                            >
                              +{product.extraImages.length} more
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-2 md:p-4 flex-1 flex flex-col">
                        {/* Product Name */}
                        <h3 
                          className="text-xs md:text-base font-bold text-black mb-1 md:mb-2 line-clamp-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div 
                          className="flex items-center space-x-1 mb-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-sm font-bold text-black">{product.price}</span>
                          <span 
                            className="text-xs text-gray-500 line-through"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {product.originalPrice}
                          </span>
                        </div>
                        <div 
                          className="flex items-center space-x-1 mb-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                        <p className="text-xs text-gray-500">Excluded Tax</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">No products available at the moment.</p>
                  </div>
                )}
              </div>

              {/* No Products Message */}
              {displayProducts.length === 0 && (
                <motion.div 
                  variants={fadeInUp}
                  className="text-center py-8 md:py-12"
                >
                  <p className="text-gray-600 text-base md:text-lg">No products found in this subcategory.</p>
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

export default SubCategoryProducts; 