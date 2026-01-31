import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of 5 slides using the same banner image
  const slides = [
    {
      id: 1,
      image: '/banner_1.png'
    },
    {
      id: 2,
      image: '/banner_2.png'
    },
    {
      id: 3,
      image: '/banner_3.png'
    },
    {
      id: 4,
      image: '/banner_4.png'
    },
    {
      id: 5,
      image: '/banner_5.png'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Mobile Wave Graphics - Top */}
      <div className="md:hidden relative">
        <div className="bg-gray-100 py-2">
          <svg
            className="w-full h-8"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C300,60 600,60 1200,0 L1200,120 L0,120 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Carousel Container - responsive height for 1920x600 image */}
      <div className="relative w-full" style={{ 
        height: 'auto',
        minHeight: '100px',
        aspectRatio: '16/5' // Desktop ratio
      }}>
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image - responsive sizing */}
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt="Banner"
                className="w-full h-full object-cover md:object-cover object-contain sm:object-contain"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-black" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-black" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-white bg-opacity-30 z-20">
          <div
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Mobile Wave Graphics - Bottom */}
      <div className="md:hidden relative">
        <div className="bg-gray-100 py-2">
          <svg
            className="w-full h-8"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 C300,60 600,60 1200,120 L1200,0 L0,0 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;