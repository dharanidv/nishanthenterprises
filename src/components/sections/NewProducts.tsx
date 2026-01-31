import { useState } from 'react';
import { Sparkles, Star, ShoppingBag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  image: string;
  rating?: number;
}

const NewProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 9 new products with sample data
  const newProducts: Product[] = [
    {
      id: 1,
      name: "Eco-Friendly Wireless Charger with Digital Clock & Night Lamp (6-in-1)",
      price: "₹450.00",
      originalPrice: "₹550.00",
      description: "A stylish eco-friendly desk essential that combines a wireless charger, digital clock, alarm, temperature display, night lamp, and stand. Ideal for modern workspaces and premium corporate gifting.",
      image: "/new_products/1.jpeg",
      rating: 4.9
    },
    {
      id: 2,
      name: "3-in-1 Portable Desktop Wireless Charger Station (15W)",
      price: "₹390.00",
      originalPrice: "₹488.00",
      description: "A compact, folding magnetic wireless charger designed for mobile phones, smartwatches, and earbuds. Travel-friendly, space-saving, and perfect for everyday use at home or office.",
      image: "/new_products/2.jpeg",
      rating: 4.8
    },
    {
      id: 3,
      name: "Eco-Friendly Premium Corporate Gift Set (7-in-1)",
      price: "₹500.00",
      originalPrice: "₹650.00",
      description: "A thoughtfully curated premium gift set made with eco-conscious materials. Includes multiple utility items suitable for corporate events, employee appreciation, and festive gifting.",
      image: "/new_products/3.jpeg",
      rating: 4.7
    },
    {
      id: 4,
      name: "New Year Executive Gift Set (4-in-1)",
      price: "₹1,200.00",
      originalPrice: "₹1,800.00",
      description: "An elegant executive gift set designed for New Year celebrations. A perfect blend of utility and style, ideal for clients, employees, and business associates.",
      image: "/new_products/4.jpeg",
      rating: 4.9
    },
    {
      id: 5,
      name: "Bamboo Tool Pen (6-in-1)",
      price: "₹450.00",
      originalPrice: "₹663.00",
      description: "A smart eco-friendly bamboo pen with multiple built-in tools. Compact, durable, and practical—great for daily use and promotional gifting.",
      image: "/new_products/5.jpeg",
      rating: 4.6
    },
    {
      id: 6,
      name: "Corporate Combo Gift Set – 6-in-1 (Wood/Bamboo, Black)",
      price: "₹1,100.00",
      originalPrice: "₹1,500.00",
      description: "A premium corporate combo set featuring a flask, coffee mug, card holder, keychain, diary, and pen. Designed for professionals who value style and functionality.",
      image: "/new_products/6.jpeg",
      rating: 4.8
    },
    {
      id: 7,
      name: "Eco-Friendly Bamboo Digital Clock (3-in-1 Set)",
      price: "₹2,400.00",
      originalPrice: "₹3,200.00",
      description: "A minimalist bamboo digital clock set that adds a natural touch to any desk. Includes clock functionality with additional accessories, making it an ideal eco-conscious gift.",
      image: "/new_products/7.jpeg",
      rating: 4.7
    },
    {
      id: 8,
      name: "5-in-1 Eco-Friendly Bamboo Desk Set",
      price: "₹650.00",
      originalPrice: "₹850.00",
      description: "A complete eco-friendly desk solution featuring a Bluetooth speaker, travel cable, diary, pen, and mini desk pen stand with calendar. Perfect for modern professionals and corporate gifting.",
      image: "/new_products/8.jpeg",
      rating: 4.8
    },
    {
      id: 9,
      name: "eco-friendly bamboo corporate gift set",
      price: "₹1,500.00",
      originalPrice: "₹2,100.00",
      description: "The set typically includes a stainless steel water bottle with a bamboo exterior, a bamboo-covered notebook, a pen, and a keychain. ",
      image: "/new_products/9.jpeg",
      rating: 4.6
    }
  ];

  const handleImageClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <section className="py-12 md:py-20 bg-gray-700 relative overflow-hidden">
        {/* Large visible animated gradient orbs with movement */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div 
            className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-cyan-400 rounded-full blur-3xl animate-float"
            style={{
              top: '5%',
              left: '-10%',
              animationDuration: '20s',
              animationDelay: '0s'
            }}
          ></div>
          <div 
            className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-white rounded-full blur-3xl animate-float-reverse"
            style={{
              bottom: '5%',
              right: '-10%',
              animationDuration: '25s',
              animationDelay: '3s'
            }}
          ></div>
          <div 
            className="absolute w-[550px] h-[550px] md:w-[750px] md:h-[750px] bg-cyan-300 rounded-full blur-3xl animate-float"
            style={{
              top: '40%',
              right: '10%',
              animationDuration: '22s',
              animationDelay: '6s'
            }}
          ></div>
          <div 
            className="absolute w-[450px] h-[450px] md:w-[650px] md:h-[650px] bg-yellow-500 rounded-full blur-3xl animate-float-reverse"
            style={{
              top: '60%',
              left: '15%',
              animationDuration: '18s',
              animationDelay: '4s'
            }}
          ></div>
        </div>

        {/* Large moving circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={`big-circle-${i}`}
              className="absolute border-4 border-yellow-400/40 rounded-full animate-big-float"
              style={{
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                left: `${10 + i * 20}%`,
                top: `${15 + i * 15}%`,
                animationDuration: `${15 + i * 5}s`,
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`shape-${i}`}
              className="absolute border border-yellow-400/30 animate-float"
              style={{
                width: `${20 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 40}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDuration: `${10 + Math.random() * 15}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.2
              }}
            />
          ))}
        </div>

        {/* Moving particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.6
              }}
            />
          ))}
        </div>

        {/* Animated sparkles with movement */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Large rotating rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute border-4 border-yellow-400/30 rounded-full animate-spin-slow"
              style={{
                width: `${300 + i * 200}px`,
                height: `${300 + i * 200}px`,
                left: `${15 + i * 25}%`,
                top: `${5 + i * 18}%`,
                animationDuration: `${25 + i * 10}s`
              }}
            />
          ))}
        </div>

        {/* Large moving squares */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={`big-square-${i}`}
              className="absolute border-4 border-yellow-400/25 animate-big-float"
              style={{
                width: `${100 + i * 60}px`,
                height: `${100 + i * 60}px`,
                left: `${20 + i * 25}%`,
                top: `${30 + i * 20}%`,
                transform: `rotate(${i * 45}deg)`,
                animationDuration: `${18 + i * 4}s`,
                animationDelay: `${i * 3}s`,
              }}
            />
          ))}
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(20px, -20px) rotate(90deg);
            }
            50% {
              transform: translate(-15px, 15px) rotate(180deg);
            }
            75% {
              transform: translate(15px, 20px) rotate(270deg);
            }
          }
          
          @keyframes float-reverse {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(-20px, 20px) rotate(-90deg);
            }
            50% {
              transform: translate(15px, -15px) rotate(-180deg);
            }
            75% {
              transform: translate(-15px, -20px) rotate(-270deg);
            }
          }
          
          @keyframes particle {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translate(100px, -100px) scale(0);
              opacity: 0;
            }
          }
          
          @keyframes particle2 {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translate(-80px, 120px) scale(0);
              opacity: 0;
            }
          }
          
          @keyframes particle3 {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translate(120px, 80px) scale(0);
              opacity: 0;
            }
          }
          
          @keyframes sparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0) translate(0, 0);
            }
            50% {
              opacity: 1;
              transform: scale(1.5) translate(20px, -20px);
            }
          }
          
          .animate-particle:nth-child(3n+1) {
            animation-name: particle;
          }
          
          .animate-particle:nth-child(3n+2) {
            animation-name: particle2;
          }
          
          .animate-particle:nth-child(3n+3) {
            animation-name: particle3;
          }
          
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes big-float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(50px, -50px) scale(1.1);
            }
            50% {
              transform: translate(-40px, 40px) scale(0.9);
            }
            75% {
              transform: translate(40px, 50px) scale(1.05);
            }
          }
          
          @keyframes pop-up {
            0% {
              opacity: 0;
              transform: translateY(50px) scale(0.8);
            }
            60% {
              transform: translateY(-10px) scale(1.05);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .animate-float {
            animation: float infinite ease-in-out;
          }
          
          .animate-float-reverse {
            animation: float-reverse infinite ease-in-out;
          }
          
          .animate-big-float {
            animation: big-float infinite ease-in-out;
          }
          
          .animate-particle {
            animation: particle infinite;
          }
          
          .animate-sparkle {
            animation: sparkle infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow linear infinite;
          }
          
          .animate-pop-up {
            animation: pop-up 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-16">
            <div className="flex items-center justify-center mb-4 md:mb-8">
              <div className="w-4 md:w-8 h-px bg-white/40 mr-2 md:mr-4"></div>
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-yellow-400 animate-pulse" />
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                  New Products
                </h2>
                <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-yellow-400 animate-pulse" />
              </div>
              <div className="w-4 md:w-8 h-px bg-white/40 ml-2 md:ml-4"></div>
            </div>
            <p className="text-gray-300 text-sm md:text-lg lg:text-xl max-w-3xl mx-auto px-4">
              Discover our latest collection of premium products. Fresh designs, innovative features, and exceptional quality that will exceed your expectations.
            </p>
          </div>

          {/* Products - horizontally scrollable row */}
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:rgba(250,204,21,0.5)_transparent]">
            {newProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl md:rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:-translate-y-2 animate-pop-up snap-start"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* NEW Badge */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" />
                    NEW
                  </span>
                </div>

                {/* Product Image Container - Bigger */}
                <div 
                  className="relative h-72 md:h-96 lg:h-[400px] bg-gradient-to-br from-gray-800 to-black overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(product)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 md:p-4 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-all duration-500 flex items-center justify-center z-20">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4 border-2 border-white/30">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4">
                  {/* Product Name */}
                  <h3 className="text-white text-sm md:text-base font-semibold mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleImageClick(product)}
                    className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-white/50 text-sm"
                  >
                    View Details
                  </button>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full bg-black border-gray-800 text-white">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl text-white mb-2">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                {/* Large Image */}
                <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden mb-6">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain p-8"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/800x600?text=Product+Image';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Product Details</h4>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {selectedProduct.description}
                  </p>
                  {selectedProduct.rating && (
                    <div className="flex items-center gap-2 mt-4">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">{selectedProduct.rating}</span>
                      <span className="text-gray-400 text-sm">Rating</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button
                    onClick={() => {
                      const phoneNumber = '+918667793272';
                      const message = `Hello! I'm interested in ${selectedProduct.name}.`;
                      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                      closeModal();
                    }}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewProducts;

