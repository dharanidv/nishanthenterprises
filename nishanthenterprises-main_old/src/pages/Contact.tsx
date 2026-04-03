import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendQuoteEmail, QuoteFormData, EmailResponse } from '@/lib/email';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Contact = () => {
  const refs = {
    hero: useRef(null),
    contact: useRef(null),
    map: useRef(null),
    quote: useRef(null)
  };

  const controls = {
    hero: useAnimation(),
    contact: useAnimation(),
    map: useAnimation(),
    quote: useAnimation()
  };

  const isInView = {
    hero: useInView(refs.hero, { once: true }),
    contact: useInView(refs.contact, { once: true }),
    map: useInView(refs.map, { once: true }),
    quote: useInView(refs.quote, { once: true })
  };

  useEffect(() => {
    Object.keys(isInView).forEach((key) => {
      if (isInView[key as keyof typeof isInView]) {
        controls[key as keyof typeof controls].start('visible');
      }
    });
  }, [isInView, controls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Get Quote Form State
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'rate_limit'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    max_requests: number;
    window_minutes: number;
    retry_after: number;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setRateLimitInfo(null);

    try {
      const response: EmailResponse = await sendQuoteEmail(formData);
      
      if (response.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', mobile: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        // Handle rate limiting specifically
        if (response.error === 'rate_limit_exceeded') {
          setSubmitStatus('rate_limit');
          setErrorMessage(response.message || 'Rate limit exceeded');
          setRateLimitInfo(response.limit_info || null);
        } else {
          setSubmitStatus('error');
          setErrorMessage(response.message || 'Something went wrong');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section ref={refs.hero} className="relative min-h-[50vh] lg:min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate={controls.hero}
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold text-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Get In Touch
              </motion.span>
              <motion.span 
                className="block text-gray-600"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                We'd Love to Hear From You
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Ready to start your custom apparel journey? Contact us today and let's bring your vision to life.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button 
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => window.open('https://wa.me/918667793272?text=Hello! I would like to discuss my custom apparel project with Nishanth Enterprises.', '_blank')}
              >
                WhatsApp Us
              </motion.button>
              <motion.button 
                className="border-2 border-black text-black px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors font-semibold"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "black",
                  color: "white"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Quote
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section ref={refs.contact} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.contact}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Contact Information
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reach out to us through any of these channels
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={controls.contact}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Phone</h3>
              <p className="text-gray-600 mb-2">+91 86677 93272</p>
              <p className="text-gray-600 mb-2">+91 98401 37959</p>
              <p className="text-gray-600 text-sm">Mon-Fri: 9AM-6PM</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Email</h3>
              <p className="text-gray-600 mb-2">sales@nishanthenterprises.com</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Address</h3>
              <p className="text-gray-600 mb-2">Subhashree Nagar Extension -II, 6th Cross St, Subasree Nagar Extension,</p>
              <p className="text-gray-600 text-sm">Mugalivakkam, Chennai, Tamil Nadu 600125</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Business Hours</h3>
              <p className="text-gray-600 mb-2">Mon - Thu: 8:30 AM - 10:00 PM</p>
              <p className="text-gray-600 text-sm">Sat: 8:30 AM - 10:00 PM, Sun: 9:00 AM - 3:00 PM</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section ref={refs.map} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.map}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Find Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit our workshop and see our craftsmanship in action
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={controls.map}
            variants={fadeInUp}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Live Map - Using Google Maps Embed */}
              <div className="relative h-96 lg:h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Nishanth+Enterprises+Chennai&zoom=16"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Nishanth Enterprises Location"
                ></iframe>
              </div>
              
              {/* Location Info Overlay */}
              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-4">Our Workshop</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-black mt-1" />
                        <div>
                          <p className="font-semibold text-black">Nishanth Enterprises</p>
                          <p className="text-gray-600">Subhashree Nagar Extension -II, 6th Cross St, Subasree Nagar Extension,</p>
                          <p className="text-gray-600">Mugalivakkam, Chennai - 600125, Tamil Nadu, India</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-black mt-1" />
                        <div>
                          <p className="font-semibold text-black">Business Hours</p>
                          <p className="text-gray-600">Mon - Thu: 8:30 AM - 10:00 PM</p>
                          <p className="text-gray-600">Sat: 8:30 AM - 10:00 PM</p>
                          <p className="text-gray-600">Sun: 9:00 AM - 3:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-4">Getting Here</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-black mb-1">By Metro:</p>
                        <p className="text-gray-600">Chennai Metro Station - 10 min walk</p>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">By Bus:</p>
                        <p className="text-gray-600">Bus routes to Porur - Mugalivakkam stop</p>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">By Car:</p>
                        <p className="text-gray-600">Parking available on premises</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Get Quote Section */}
      <section ref={refs.quote} className="py-20 bg-white" id="quote-section">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.quote}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Get a Quote
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ready to start your custom t-shirt project? Fill out the form below and we'll get back to you with a personalized quote.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls.quote}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Quote Request Sent Successfully!</h3>
                    <p className="text-green-700 text-sm">
                      Thank you for your inquiry. We've sent a confirmation email to {formData.email} and will get back to you within 2-4 business hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limit Error Message */}
            {submitStatus === 'rate_limit' && (
              <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">⏱️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 mb-2">Rate Limit Exceeded</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      {errorMessage}
                    </p>
                    {rateLimitInfo && (
                      <div className="bg-orange-100 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-orange-800 font-medium">Limit Details:</span>
                          <span className="text-orange-700">
                            {rateLimitInfo.max_requests} requests per {rateLimitInfo.window_minutes} minutes
                          </span>
                        </div>
                        <div className="text-orange-700">
                          <span className="font-medium">Please wait:</span> {rateLimitInfo.window_minutes} minutes before trying again
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✕</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Something went wrong</h3>
                    <p className="text-red-700 text-sm">
                      {errorMessage || 'We couldn\'t send your quote request. Please try again or contact us directly.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Form */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-black mb-2">
                    Mobile Number *
                  </label>
                  <Input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="Enter your mobile number"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                    Project Details *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none disabled:opacity-50"
                    placeholder="Tell us about your project requirements, quantity, design preferences, timeline, etc."
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <Button 
                    type="submit" 
                    disabled={true}
                    className="bg-gray-400 text-white px-8 py-4 rounded-lg transition-colors font-semibold text-lg min-w-[200px] opacity-50 cursor-not-allowed"
                  >
                    Submit Quote Request
                  </Button>
                </div>

                {/* Form Footer */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>By submitting this form, you agree to our privacy policy and terms of service.</p>
                  <p className="mt-2">We typically respond within 2-4 business hours.</p>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Quick Response</h3>
                <p className="text-gray-600 text-sm">Get a quote within 2-4 hours</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Free Consultation</h3>
                <p className="text-gray-600 text-sm">No cost for design consultation</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">★</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Quality Guarantee</h3>
                <p className="text-gray-600 text-sm">Premium quality t-shirts guaranteed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.quote}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Follow Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Stay updated with our latest designs, offers, and behind-the-scenes content
            </p>
            
            <div className="flex justify-center gap-6">
              <a 
                href="https://www.instagram.com/nishanthenterprises?igsh=N2ZsY2h1czI5MWtj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-16 h-16 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Instagram className="w-8 h-8 text-white" />
              </a>
              <a 
                href="https://www.facebook.com/share/1GJVfEYgXi/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-16 h-16 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Facebook className="w-8 h-8 text-white" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact; 