import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column - Brand Info */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Nishanth Enterprises</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner for premium corporate gifts and promotional products. We specialize in high-quality branded merchandise that helps businesses make lasting impressions.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/1GJVfEYgXi/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Facebook className="w-5 h-5 text-black" />
              </a>
              <a 
                href="https://www.instagram.com/nishanthenterprises?igsh=N2ZsY2h1czI5MWtj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Instagram className="w-5 h-5 text-black" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/products?category=all" className="text-gray-300 hover:text-white transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products?category=apparel-wearables" className="text-gray-300 hover:text-white transition-colors">
                  Apparel & Wearables
                </a>
              </li>
              <li>
                <a href="/products?category=bags-travel-essentials" className="text-gray-300 hover:text-white transition-colors">
                  Bags & Travel Essentials
                </a>
              </li>
              <li>
                <a href="/products?category=eco-friendly-products" className="text-gray-300 hover:text-white transition-colors">
                  Eco-Friendly Products
                </a>
              </li>
              <li>
                <a href="/products?category=drinkware-kitchenware" className="text-gray-300 hover:text-white transition-colors">
                  Drinkware & Kitchenware
                </a>
              </li>
              <li>
                <a href="/products?category=writing-stationery" className="text-gray-300 hover:text-white transition-colors">
                  Writing & Stationery
                </a>
              </li>
              <li>
                <a href="/products?category=awards-recognition" className="text-gray-300 hover:text-white transition-colors">
                  Awards & Recognition
                </a>
              </li>
              <li>
                <a href="/products?category=gadgets-accessories" className="text-gray-300 hover:text-white transition-colors">
                  Gadgets & Accessories
                </a>
              </li>
             
              <li>
                <a href="/products?category=premium-gift-sets" className="text-gray-300 hover:text-white transition-colors">
                  Premium Gift Sets
                </a>
              </li>
              <li>
                <a href="/products?category=seasonal-products" className="text-gray-300 hover:text-white transition-colors">
                  Seasonal Products
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">+91 86677 93272</p>
                  <p className="text-gray-300">+91 98401 37959</p>
                  <p className="text-gray-300">08048046012</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">sales@nishanthenterprises.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Nishanth Enterprises</p>
                  <p className="text-gray-300">Subhashree Nagar Extension -II, 6th Cross St, Subasree Nagar Extension,</p>
                  <p className="text-gray-300">Mugalivakkam, Chennai, Tamil Nadu 600125</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Mon - Thu: 8:30 AM - 10:00 PM</p>
                  <p className="text-gray-300">Sat: 8:30 AM - 10:00 PM</p>
                  <p className="text-gray-300">Sun: 9:00 AM - 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Nishanth Enterprises. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;