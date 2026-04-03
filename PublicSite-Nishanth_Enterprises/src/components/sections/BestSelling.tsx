import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import bestSellingData from '@/data/bestSellingProducts.json';

interface Product {
  id: number;
  name: string;
  currentPrice: string;
  originalPrice: string;
  image: string;
  isNew: boolean;
}

interface Category {
  id: number;
  name: string;
  link: string;
  products: Product[];
}

const BestSelling = () => {
  const [selectedCategory, setSelectedCategory] = useState('Collar Neck T-shirt');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const categories: Category[] = bestSellingData.categories;

  const handleCategoryChange = (categoryName: string) => {
    if (isTransitioning || categoryName === selectedCategory) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(categoryName);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 200);
  };

  const nextCategory = () => {
    const currentIndex = categories.findIndex(cat => cat.name === selectedCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    handleCategoryChange(categories[nextIndex].name);
  };

  const prevCategory = () => {
    const currentIndex = categories.findIndex(cat => cat.name === selectedCategory);
    const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
    handleCategoryChange(categories[prevIndex].name);
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 relative">
          <div className="flex items-center justify-center mb-4 md:mb-8">
            <div className="w-4 md:w-8 h-px bg-gray-400 mr-2 md:mr-4"></div>
            <h2 className="text-xl md:text-2xl font-bold text-black">Best Selling</h2>
            <div className="w-4 md:w-8 h-px bg-gray-400 ml-2 md:ml-4"></div>
          </div>
          
          {/* See More Link - Top Right */}
          <div className="absolute top-0 right-0 hidden md:block">
            <a
              href={categories.find(category => category.name === selectedCategory)?.link}
              className="inline-flex items-center text-black hover:text-gray-600 transition-colors duration-300 text-sm md:text-base font-medium"
            >
              See More {'->'}
            </a>
          </div>
          
          {/* Desktop Category Filters */}
          <div className="hidden md:flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.name)}
                disabled={isTransitioning}
                className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm md:text-base transform ${
                  selectedCategory === category.name
                    ? 'bg-black text-white scale-105'
                    : 'bg-white text-black border border-black hover:bg-gray-50 hover:scale-102'
                } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Mobile Category Carousel */}
          <div className="md:hidden relative">
            {/* Category Display - Same as Desktop */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.name)}
                  disabled={isTransitioning}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm transform ${
                    selectedCategory === category.name
                      ? 'bg-black text-white scale-105'
                      : 'bg-white text-black border border-black hover:bg-gray-50 hover:scale-102'
                  } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* See More Link - New Row (Mobile Only) */}
            <div className="flex justify-end">
              <a
                href={categories.find(category => category.name === selectedCategory)?.link}
                className="text-black hover:text-gray-600 transition-colors duration-300 text-sm font-medium"
              >
                See More {'->'}
              </a>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {categories
            .find(category => category.name === selectedCategory)
            ?.products.map((product, index) => (
            <div 
              key={product.id} 
              className={`bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-500 ease-in-out transform ${
                isTransitioning 
                  ? 'opacity-0 translate-y-4 scale-95' 
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* NEW Tag */}
              {product.isNew && (
                <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10">
                  <span className="bg-black text-white px-2 py-1 rounded text-xs font-medium">
                    NEW
                  </span>
                </div>
              )}
              
              {/* Discount Badge */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {Math.round(((parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) - parseFloat(product.currentPrice.replace(/[^\d.]/g, ''))) / parseFloat(product.originalPrice.replace(/[^\d.]/g, ''))) * 100)}% OFF
                </span>
              </div>
              
              {/* Product Image */}
              <div className="relative mb-3 md:mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 md:h-64 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                />
                <button className="absolute bottom-2 md:bottom-4 right-2 md:right-4 w-6 h-6 md:w-8 md:h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-200 hover:scale-110">
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </button>
              </div>
              
              {/* Product Info */}
              <h3 className="font-semibold text-black mb-2 text-sm md:text-base line-clamp-2">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-black text-sm md:text-base">{product.currentPrice}</span>
                <span className="text-gray-500 line-through text-xs md:text-sm">{product.originalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSelling; 