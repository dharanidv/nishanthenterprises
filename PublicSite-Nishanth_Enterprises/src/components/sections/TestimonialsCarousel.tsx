import { useState, useEffect } from 'react';
import testimonialsData from '@/data/testimonials.json';

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  rating: number;
  text: string;
  orderSize: string;
}

const TestimonialsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials: Testimonial[] = testimonialsData.testimonials;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate items per slide based on screen size
  const itemsPerSlide = isMobile ? 1 : 2;
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);
  
  const currentTestimonials = testimonials.slice(
    currentSlide * itemsPerSlide, 
    (currentSlide * itemsPerSlide) + itemsPerSlide
  );

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (totalSlides <= 1) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, totalSlides, isTransitioning]);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, totalSlides]);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-8 h-px bg-gray-400 mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-black">Client Testimonials</h2>
            <div className="w-8 h-px bg-gray-400 ml-4"></div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about their experience with Nisanth T-shirts.
          </p>
        </div>

        {/* Testimonial Cards Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 -ml-6 md:-ml-8 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Previous testimonials"
              >
                <svg 
                  className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 -mr-6 md:-mr-8 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Next testimonials"
              >
                <svg 
                  className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Testimonial Cards with Smooth Transitions */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-75 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {currentTestimonials.map((testimonial, index) => (
              <div 
                key={`${testimonial.id}-${currentSlide}`}
                className={`bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-500 ease-out transform ${
                  isTransitioning 
                    ? 'translate-x-4 opacity-0' 
                    : 'translate-x-0 opacity-100'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="flex flex-col">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with name and rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <h3 className="font-semibold text-black text-lg">{testimonial.name}</h3>
                        <div className="flex space-x-1">
                          {Array.from({ length: testimonial.rating }).map((_, index) => (
                            <span key={index} className="text-yellow-400 text-sm animate-pulse" style={{ animationDelay: `${index * 100}ms` }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Position and Company */}
                    <div className="mb-3">
                      <p className="text-gray-700 font-medium text-sm">{testimonial.position}</p>
                      <p className="text-gray-500 text-sm">{testimonial.company}</p>
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 italic">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Order Size */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Order: {testimonial.orderSize}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center space-x-3 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`transition-all duration-300 ease-in-out ${
                  currentSlide === index 
                    ? 'w-8 h-3 bg-black' 
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                } rounded-full disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        {totalSlides > 1 && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500 font-medium">
              {currentSlide + 1} of {totalSlides}
            </span>
          </div>
        )}

        {/* Keyboard Navigation Hint */}
        {totalSlides > 1 && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400">
              Use ← → arrow keys or click dots to navigate
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsCarousel;