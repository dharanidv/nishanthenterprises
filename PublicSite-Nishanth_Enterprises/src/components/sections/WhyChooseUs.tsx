import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Users, Package, Palette, Truck, Star, Shield, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhyChooseUs = () => {
  const navigate = useNavigate();
  const features = [
    {
      id: 1,
      title: "Premium Quality",
      icon: <Star className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />,
      description: "100% Premium Quality Products",
      content: "Top-grade materials, superior craftsmanship, lasting durability",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      borderColor: "border-blue-400"
    },
    {
      id: 2,
      title: "24/7 Support",
      icon: <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      description: "Round-the-clock Customer Support",
      content: "Always available, quick response, expert assistance",
      bgColor: "bg-gradient-to-br from-gray-700 to-gray-800",
      borderColor: "border-gray-600"
    },
    {
      id: 3,
      title: "Bulk Orders",
      icon: <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />,
      description: "Special Pricing for Bulk Orders",
      content: "Volume discounts, corporate rates, flexible terms",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      borderColor: "border-blue-400"
    },
    {
      id: 4,
      title: "Custom Design",
      icon: <Palette className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      description: "Personalized Design Solutions",
      content: "Brand integration, unique artwork, custom colors",
      bgColor: "bg-gradient-to-br from-gray-700 to-gray-800",
      borderColor: "border-gray-600"
    },
    {
      id: 5,
      title: "Fast Delivery",
      icon: <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />,
      description: "Guaranteed On-Time Delivery",
      content: "Express shipping, tracking updates, reliable logistics",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      borderColor: "border-blue-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-pulse-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl animate-bounce"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-block"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 tracking-tight">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Nishanth Enterprises?
              </span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Discover our unique advantages that make us the preferred choice for corporate gifts and promotional products
          </motion.p>
        </div>

        {/* Features Grid - Creative Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group relative"
            >
              {/* Hexagon Background */}
              <div className="relative">
                <div className={`absolute inset-0 ${feature.bgColor} transform rotate-45 rounded-2xl opacity-20 group-hover:opacity-30 transition-all duration-500`}></div>
                
                {/* Main Content Container */}
                <div className={`relative p-6 md:p-8 rounded-2xl border-2 ${feature.borderColor} bg-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 overflow-hidden h-48 md:h-52`}>
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  {/* Floating Background Elements */}
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 left-3 w-2 h-2 bg-blue-300/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-ping"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center h-full flex flex-col justify-center">
                    {/* Icon Container - Hexagon Shape */}
                    <div className="mb-3 md:mb-4 flex justify-center">
                      <div className={`relative w-12 h-12 md:w-14 md:h-14 ${feature.bgColor} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:scale-110 transform rotate-12 group-hover:rotate-0`}>
                        <div className="transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                          {feature.icon}
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-sm md:text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs md:text-sm text-gray-300 mb-2 leading-tight">
                      {feature.description}
                    </p>

                    {/* Additional Content */}
                    <p className="text-xs text-gray-400 leading-tight">
                      {feature.content}
                    </p>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400 transition-all duration-500"></div>
                  
                  {/* Corner Decorations */}
                  <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"></div>
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12 md:mt-16"
        >
          <button 
            onClick={() => navigate('/products')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden group"
          >
            <span className="relative z-10 font-semibold">Experience the Difference</span>
            <ChevronRight className="w-5 h-5 animate-pulse relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse-delayed {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-delayed {
          animation: pulse-delayed 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs; 