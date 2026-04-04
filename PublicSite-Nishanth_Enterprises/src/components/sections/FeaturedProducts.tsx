import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCatalogProducts,
  firstProductImageUrl,
  formatPriceRs,
  slugifyCategoryName,
  type CatalogProduct
} from '@/lib/catalogApi';

type UiProduct = {
  id: string;
  categorySlug: string;
  name: string;
  description: string;
  offerPrice: string;
  originalPrice: string;
  image: string;
};

function mapToUi(row: CatalogProduct): UiProduct {
  return {
    id: row.id,
    categorySlug: slugifyCategoryName(row.category_name),
    name: row.product_name,
    description: row.description?.trim() ?? '',
    offerPrice: formatPriceRs(row.offer_price),
    originalPrice: formatPriceRs(row.original_price),
    image: firstProductImageUrl(row)
  };
}

const PLACEHOLDER_IMG = 'https://via.placeholder.com/600x600?text=No+image';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchCatalogProducts({ isPopularProduct: true })
      .then((rows) => {
        if (!active) return;
        setProducts(rows.map(mapToUi));
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
  }, [products.length]);

  const nextSlide = useCallback(() => {
    if (products.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [products.length]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide || products.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % products.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const currentProduct = products[currentSlide];

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-white relative">
        <div className="container mx-auto px-4 text-center text-gray-600">Loading popular products…</div>
      </section>
    );
  }

  if (!currentProduct) {
    return (
      <section className="py-12 md:py-20 bg-white relative">
        <div className="container mx-auto px-4 text-center text-gray-600">
          No popular products are listed yet.
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <div className="flex items-center justify-center mb-4 md:mb-8">
            <div className="w-4 md:w-8 h-px bg-gray-400 mr-2 md:mr-4"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black">Most Popular Products</h2>
            <div className="w-4 md:w-8 h-px bg-gray-400 ml-2 md:ml-4"></div>
          </div>
          <p className="text-gray-600 text-sm md:text-lg lg:text-xl max-w-3xl mx-auto px-4">
            Products marked as popular in our catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 items-center min-h-[400px] md:min-h-[600px] relative">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="relative h-full flex flex-col justify-center">
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
                }`}
              >
                <div className="mb-4 md:mb-6">
                  <span className="bg-amber-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                    Popular
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-black mb-4 md:mb-6 leading-tight">
                  {currentProduct.name}
                </h3>

                {currentProduct.description ? (
                  <p className="text-gray-600 text-sm md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 max-w-2xl">
                    {currentProduct.description}
                  </p>
                ) : null}

                <div className="flex items-center space-x-3 md:space-x-4 mb-6 md:mb-8">
                  {currentProduct.offerPrice ? (
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">{currentProduct.offerPrice}</span>
                  ) : null}
                  {currentProduct.originalPrice ? (
                    <span className="text-lg md:text-xl text-gray-500 line-through">{currentProduct.originalPrice}</span>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    className="border-2 border-black text-black px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-black hover:text-white transition-colors duration-300 text-sm md:text-lg font-semibold"
                    onClick={() => void navigate(`/product/${currentProduct.categorySlug}/${currentProduct.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2 relative">
            <div className="relative h-full flex items-center justify-center">
              <div
                className={`relative w-full max-w-sm md:max-w-md transition-all duration-500 ease-in-out ${
                  isTransitioning ? 'opacity-0 scale-95 rotate-3' : 'opacity-100 scale-100 rotate-0'
                }`}
              >
                <div className="relative bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl overflow-hidden">
                  <div
                    className="w-full h-80 md:h-[500px] lg:h-[600px] xl:h-[700px] flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                    onClick={() => void navigate(`/product/${currentProduct.categorySlug}/${currentProduct.id}`)}
                    role="presentation"
                  >
                    <img
                      src={currentProduct.image || PLACEHOLDER_IMG}
                      alt={currentProduct.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                      }}
                    />
                  </div>
                </div>

                <div className="absolute -top-2 md:-top-4 -left-2 md:-left-4 w-6 h-6 md:w-8 md:h-8 border-2 border-gray-200 rounded-full animate-pulse"></div>
                <div
                  className="absolute -bottom-2 md:-bottom-4 -right-2 md:-right-4 w-4 h-4 md:w-6 md:h-6 border-2 border-gray-200 rounded-full animate-pulse"
                  style={{ animationDelay: '1s' }}
                ></div>
              </div>

              {products.length > 1 ? (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={isTransitioning}
                    className="lg:hidden absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors duration-300" />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={isTransitioning}
                    className="lg:hidden absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors duration-300" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {products.length > 1 ? (
            <>
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="hidden lg:flex absolute -left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white border-2 border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors duration-300" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white border-2 border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group z-20"
                aria-label="Next product"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors duration-300" />
              </button>
            </>
          ) : null}
        </div>

        {products.length > 1 ? (
          <>
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
            <div className="text-center mt-4 md:mt-6">
              <span className="text-xs md:text-sm text-gray-500 font-medium">
                {currentSlide + 1} of {products.length}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default FeaturedProducts;
