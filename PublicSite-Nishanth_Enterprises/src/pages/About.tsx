import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Users, 
  Award, 
  Heart, 
  Shield, 
  Target, 
  TrendingUp, 
  Star, 
  CheckCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const About = () => {
  const refs = {
    hero: useRef(null),
    story: useRef(null),
    values: useRef(null),
    achievements: useRef(null)
  };

  const controls = {
    hero: useAnimation(),
    story: useAnimation(),
    values: useAnimation(),
    achievements: useAnimation()
  };

  const isInView = {
    hero: useInView(refs.hero, { once: true }),
    story: useInView(refs.story, { once: true }),
    values: useInView(refs.values, { once: true }),
    achievements: useInView(refs.achievements, { once: true })
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



  const values = [
    {
      icon: Heart,
      title: "Passion for Quality",
      description: "Every stitch reflects our commitment to excellence and attention to detail."
    },
    {
      icon: Shield,
      title: "Sustainable Practices",
      description: "We prioritize eco-friendly materials and ethical manufacturing processes."
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Your satisfaction is our top priority, from design to delivery."
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Constantly pushing boundaries to create unique, trendsetting designs."
    }
  ];

  const achievements = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "100+", label: "Design Awards", icon: Award },
    { number: "15+", label: "Years Experience", icon: TrendingUp },
    { number: "4.9", label: "Customer Rating", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section ref={refs.hero} className="relative min-h-[60vh] lg:min-h-[80vh] flex items-center justify-center bg-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Enhanced Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-gray-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl"
          animate={{
            y: [0, -20, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/8 rounded-full blur-xl"
          animate={{
            x: [0, 15, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gray-300/6 rounded-full blur-2xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate={controls.hero}
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                About Nishanth Enterprises
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Quality Since 1992
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Based in Porur, Chennai, we are a trusted name in delivering quality products and reliable services. 
              Specializing in corporate gifts and custom-designed T-shirts for businesses across India.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button 
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition-colors font-semibold"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "white",
                  color: "black"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => window.open('https://wa.me/918667793272?text=Hello! I would like to know more about Nishanth Enterprises services.', '_blank')}
              >
                Contact Us
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section ref={refs.story} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.story}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                About Nishanth Enterprises
              </h2>
              
              {/* Company Overview */}
              <div className="mb-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Since 1992 Nishanth Enterprises company based in Porur, Chennai, known for delivering quality products and reliable services. The business has built a reputation for professionalism, timely delivery, and customer-focused service, making it a trusted choice for both businesses and households in the area.
                </p>
              </div>

              {/* Specialization in Gifts */}
              <div className="mb-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We specialize in creating memorable and high-impact gifts that help businesses enhance client relationships, appreciate employees, and mark important milestones. Whether you need a customized gift for a client or a large-scale corporate gift program, we're here to provide you with the perfect solution.
                </p>
              </div>

              {/* Product Supply and T-shirts */}
              <div className="mb-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We supply our products to a wide customer base spanning across India. We specialize in high-quality Cotton and Poly cotton custom-designed T-shirts, offering a wide range of styles and sizes for businesses, events, and personal use. With years of experience manufacturing Cotton and Poly cotton tshirt, we are committed to producing durable, comfortable, and trendy T-shirts that cater to various customer needs. We believe in building long-term partnerships with our clients by providing personalized service, consistent quality, and timely delivery.
                </p>
              </div>

              {/* Customized T-shirts and Corporate Gifts */}
              <div className="mb-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our customized T-shirts Chennai to deliver endless life to your way of style. We are one of the best T-shirt manufacturer and T-shirts embroidery in Chennai and specialise Corporate gifts for corporate company and event such as bulk orders to custom designs, we provide flexible solutions for retailers, startups, and corporations seeking unique apparel.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Established in 1992</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Based in Porur, Chennai</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Quality Products & Reliable Services</span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                alt="Nishanth Enterprises"
                className="w-full h-auto rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-black text-white p-6 rounded-lg">
                <p className="text-2xl font-bold">1992</p>
                <p className="text-sm">Year Founded</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={refs.values} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.values}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from design to delivery
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={controls.values}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section ref={refs.achievements} className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={controls.achievements}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our Achievements
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Milestones that define our journey of excellence
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={controls.achievements}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-gray-300">{achievement.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      <Footer />
    </div>
  );
};

export default About; 