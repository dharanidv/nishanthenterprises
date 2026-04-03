const BrandLogos = () => {
  const brands = [
    { name: 'Adidas', logo: '/Brand Logo/adidas.png' },
    { name: 'Puma', logo: '/Brand Logo/Puma.png' },
    { name: 'Castlay', logo: '/Brand Logo/castlay.png' },
    { name: 'Raymond', logo: '/Brand Logo/raymond.png' },
    { name: 'American Tourister', logo: '/Brand Logo/american tourister.png' },
    { name: 'Portronics', logo: '/Brand Logo/portronics.png' },
    { name: 'Pebble', logo: '/Brand Logo/pebble.png' },
    { name: 'Boat', logo: '/Brand Logo/boat.png' }
  ];

  return (
    <section className="bg-black py-3 md:py-6 lg:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-nowrap justify-center items-center gap-3 md:gap-6 lg:gap-4 xl:gap-6 overflow-x-auto lg:overflow-visible scrollbar-hide">
          {brands.map((brand, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center h-16 md:h-20 lg:h-24 w-32 md:w-40 lg:w-36 xl:w-40 px-1 md:px-2 lg:px-2 xl:px-3 py-1 md:py-2 lg:py-3 hover:opacity-80 transition-opacity duration-300 cursor-pointer flex-shrink-0"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error(`Failed to load brand logo: ${brand.logo}`);
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-white font-semibold text-xs md:text-sm lg:text-base text-center';
                  fallback.textContent = brand.name;
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default BrandLogos; 