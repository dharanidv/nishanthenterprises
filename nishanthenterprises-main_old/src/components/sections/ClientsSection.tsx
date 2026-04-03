import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ClientsSection = () => {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [secondRowIndex, setSecondRowIndex] = useState(0);

  const clients = [
    { id: 1, name: 'Client 1', logo: '/client/client1.png' },
    { id: 2, name: 'Client 2', logo: '/client/client2.png' },
    { id: 3, name: 'Client 3', logo: '/client/client3.png' },
    { id: 4, name: 'Client 4', logo: '/client/client4.png' },
    { id: 5, name: 'Client 5', logo: '/client/client5.png' },
    { id: 6, name: 'Client 6', logo: '/client/client6.png' },
    { id: 7, name: 'Client 7', logo: '/client/client7.png' },
    { id: 8, name: 'Client 8', logo: '/client/client8.png' },
    { id: 9, name: 'Client 9', logo: '/client/client9.png' },
    { id: 10, name: 'Client 10', logo: '/client/client10.png' },
    { id: 11, name: 'Client 11', logo: '/client/client11.png' },
    { id: 12, name: 'Client 12', logo: '/client/client12.png' },
    { id: 13, name: 'Client 13', logo: '/client/client13.png' },
    { id: 14, name: 'Client 14', logo: '/client/client14.png' },
    { id: 15, name: 'Client 15', logo: '/client/client15.png' },
    { id: 16, name: 'Client 16', logo: '/client/client16.png' },
    { id: 17, name: 'Client 17', logo: '/client/client17.png' },
    { id: 18, name: 'Client 18', logo: '/client/client18.png' },
    { id: 19, name: 'Client 19', logo: '/client/client19.png' },
    { id: 20, name: 'Client 20', logo: '/client/client20.png' },
    { id: 21, name: 'Client 21', logo: '/client/client21.png' },
    { id: 22, name: 'Client 22', logo: '/client/client22.png' },
    { id: 23, name: 'Client 23', logo: '/client/client23.png' },
    { id: 24, name: 'Client 24', logo: '/client/client24.png' },
    { id: 25, name: 'Client 25', logo: '/client/client25.png' },
    { id: 26, name: 'Client 26', logo: '/client/client26.png' },
    { id: 27, name: 'Client 27', logo: '/client/client27.png' },
    { id: 28, name: 'Client 28', logo: '/client/client28.png' },
  ];

  // Split clients into two halves for the two rows (14 each)
  const firstHalfClients = clients.slice(0, 14);
  const secondHalfClients = clients.slice(14);

  // Create circular arrays with just 2 copies for true circular behavior
  const createCircularArray = (clientArray: typeof clients) => {
    // Create 2 copies for seamless circular scrolling
    return [...clientArray, ...clientArray];
  };

  const circularFirstRowClients = createCircularArray(firstHalfClients);
  const circularSecondRowClients = createCircularArray(secondHalfClients);

  // Calculate precise item dimensions
  const itemWidth = 180; // Width per client
  const gap = 12; // Gap between clients
  const totalItemWidth = itemWidth + gap;

  // Calculate transform values for circular movement
  const firstRowTransform = -firstRowIndex * totalItemWidth;
  const secondRowTransform = -secondRowIndex * totalItemWidth;

  // Handle manual navigation for both rows simultaneously
  const handleManualNavigation = (direction: 'prev' | 'next') => {
    // Move both rows together
    const newFirstIndex = direction === 'next' 
      ? firstRowIndex + 1
      : firstRowIndex - 1;
    
    const newSecondIndex = direction === 'next' 
      ? secondRowIndex + 1
      : secondRowIndex - 1;
    
    setFirstRowIndex(newFirstIndex);
    setSecondRowIndex(newSecondIndex);

    // Reset to beginning when reaching the end for true circular behavior
    if (newFirstIndex >= firstHalfClients.length) {
      setTimeout(() => setFirstRowIndex(0), 300);
    } else if (newFirstIndex < 0) {
      setTimeout(() => setFirstRowIndex(firstHalfClients.length - 1), 300);
    }

    if (newSecondIndex >= secondHalfClients.length) {
      setTimeout(() => setSecondRowIndex(0), 300);
    } else if (newSecondIndex < 0) {
      setTimeout(() => setSecondRowIndex(secondHalfClients.length - 1), 300);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center text-gray-800 mb-8 md:mb-12"
        >
          Our Valued Clients
        </motion.h2>

        <div className="relative py-4">
          {/* Single Navigation Buttons for Both Rows */}
          <div className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={() => handleManualNavigation('prev')}
              className="w-8 h-8 md:w-10 md:h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={() => handleManualNavigation('next')}
              className="w-8 h-8 md:w-10 md:h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl"
              title="Next"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* First Row - Truly Circular Carousel */}
          <div className="overflow-hidden mb-8">
            <div 
              className="flex items-center gap-3 transition-transform duration-300 ease-in-out"
              style={{ 
                transform: `translateX(${firstRowTransform}px)`,
                width: `${circularFirstRowClients.length * totalItemWidth}px`
              }}
            >
              {circularFirstRowClients.map((client, index) => (
                <motion.div
                  key={`${client.id}-${index}-rtl`}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="group flex-shrink-0"
                  style={{ width: `${itemWidth}px`, minWidth: `${itemWidth}px` }}
                >
                  <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center h-16 md:h-20 w-full border border-gray-100 hover:border-gray-200">
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="w-full h-full object-contain transition-all duration-300"
                      onError={(e) => {
                        console.error(`Failed to load image: ${client.logo}`);
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-gray-500 text-xs';
                        fallback.textContent = client.name;
                        e.currentTarget.parentNode?.appendChild(fallback);
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Second Row - Truly Circular Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex items-center gap-3 transition-transform duration-300 ease-in-out"
              style={{ 
                transform: `translateX(${secondRowTransform}px)`,
                width: `${circularSecondRowClients.length * totalItemWidth}px`
              }}
            >
              {circularSecondRowClients.map((client, index) => (
                <motion.div
                  key={`${client.id}-${index}-ltr`}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="group flex-shrink-0"
                  style={{ width: `${itemWidth}px`, minWidth: `${itemWidth}px` }}
                >
                  <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center h-16 md:h-20 w-full border border-gray-100 hover:border-gray-200">
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="w-full h-full object-contain transition-all duration-300"
                      onError={(e) => {
                        console.error(`Failed to load image: ${client.logo}`);
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-gray-500 text-xs';
                        fallback.textContent = client.name;
                        e.currentTarget.parentNode?.appendChild(fallback);
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default ClientsSection; 