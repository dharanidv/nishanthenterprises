import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Truck, Shield, RotateCcw } from 'lucide-react';
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
  rating: number;
  reviews: number;
  isNew: boolean;
  isBestSeller: boolean;
  description: string;
}

const ProductDetail = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    console.log('=== ProductDetail Debug ===');
    console.log('Category:', category);
    console.log('Product ID:', id);
    
    setLoading(true);
    
    // Define all category data
    const allCategoryData = {
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

    // Combine all products from old structure
    const oldProducts = [
      ...collarNeckData.products,
      ...roundNeckData.products,
      ...jerseysData.products,
      ...shirtsData.products,
      ...corporateGiftsData.products
    ];

    // Combine all products from new structured data
    const newProducts: Product[] = [];
    Object.values(allCategoryData).forEach(categoryData => {
      categoryData.subCategories.forEach(subCategory => {
        newProducts.push(...subCategory.products);
      });
    });

    // Combine all products
    const allProducts = [...oldProducts, ...newProducts];
    
    console.log('Total products:', allProducts.length);
    console.log('Looking for product ID:', parseInt(id || '0'));
    
    const foundProduct = allProducts.find(p => p.id === parseInt(id || '0'));
    console.log('Found product:', foundProduct);
    
    if (foundProduct) {
      setProduct(foundProduct);
    }
    
    setLoading(false);
  }, [category, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Product not found.</p>
            <p className="text-gray-500 text-sm mb-6">
              Category: {category} | Product ID: {id}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const keyFeatures = [
    "Premium cotton fabric for ultimate comfort",
    "Breathable and moisture-wicking material",
    "Durable construction for long-lasting wear",
    "Modern fit with stretchable fabric",
    "Easy care - machine washable",
    "Available in multiple sizes",
    "Professional finish and quality stitching",
    "Perfect for everyday wear and special occasions"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Breadcrumb */}
        <section className="py-4 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => navigate('/products')}
                className="hover:text-black transition-colors"
              >
                Products
              </button>
              <span>/</span>
              <button
                onClick={() => navigate(`/products?category=${category}`)}
                className="hover:text-black transition-colors capitalize"
              >
                {category?.replace('-', ' ')}
              </button>
              <span>/</span>
              <span className="text-black">{product.name}</span>
            </div>
          </div>
        </section>

        {/* Product Detail */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[600px] md:h-[800px] lg:h-[900px] object-cover"
                  />
                  
                  {/* Product Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        NEW
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        BEST SELLER
                      </span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {product.discount} OFF
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg">
                    <Heart className="w-6 h-6 text-gray-600 hover:text-red-500 transition-colors duration-300" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Product Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-black">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center space-x-4">
                  <span className="text-3xl md:text-4xl font-bold text-black">{product.price}</span>
                  <span className="text-xl text-gray-500 line-through">{product.originalPrice}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>

                {/* Size Selection */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-black">Select Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 text-gray-700 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Free Shipping</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Quality Guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail; 