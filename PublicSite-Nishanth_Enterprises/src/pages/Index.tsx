import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import BrandLogos from '@/components/sections/BrandLogos';
import ProductCategories from '@/components/sections/ProductCategories';
import NewProducts from '@/components/sections/NewProducts';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import ClientsSection from '@/components/sections/ClientsSection';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import BestSelling from '@/components/sections/BestSelling';
import TestimonialsCarousel from '@/components/sections/TestimonialsCarousel';
import ContactCTA from '@/components/sections/ContactCTA';
import HowItWorks from '@/components/sections/HowItWorks';
import GetQuote from '@/components/sections/GetQuote';
import {
  fetchHomeContents,
  sectionByName,
  activeImageUrls,
  parseExploreSectionContent,
  parseNewProductsSectionContent,
  type HomeContentsPayload
} from '@/lib/homeContents';

const Index = () => {
  const [homePayload, setHomePayload] = useState<HomeContentsPayload | null>(null);

  useEffect(() => {
    fetchHomeContents()
      .then(setHomePayload)
      .catch(() => setHomePayload(null));
  }, []);

  const bannerUrls = useMemo(() => {
    if (!homePayload) return undefined;
    const urls = activeImageUrls(sectionByName(homePayload.sections, 'Banners'));
    return urls.length ? urls : undefined;
  }, [homePayload]);

  const brandUrls = useMemo(() => {
    if (!homePayload) return undefined;
    const urls = activeImageUrls(sectionByName(homePayload.sections, 'Brands'));
    return urls.length ? urls : undefined;
  }, [homePayload]);

  const exploreContent = useMemo(() => {
    if (!homePayload) return undefined;
    const s = sectionByName(homePayload.sections, 'Explore Product Categories');
    return parseExploreSectionContent(s?.section_content ?? null) ?? undefined;
  }, [homePayload]);

  const newProductsContent = useMemo(() => {
    if (!homePayload) return undefined;
    const s = sectionByName(homePayload.sections, 'New Products');
    return parseNewProductsSectionContent(s?.section_content ?? null) ?? undefined;
  }, [homePayload]);

  const refs = {
    hero: useRef(null),
    brandLogos: useRef(null),
    productCategories: useRef(null),
    newProducts: useRef(null),
    featuredProducts: useRef(null),
    clientsSection: useRef(null),
    whyChooseUs: useRef(null),
    bestSelling: useRef(null),
    testimonials: useRef(null),
    contactCTA: useRef(null),
    howItWorks: useRef(null),
    getQuote: useRef(null)
  };

  const controls = {
    hero: useAnimation(),
    brandLogos: useAnimation(),
    productCategories: useAnimation(),
    newProducts: useAnimation(),
    featuredProducts: useAnimation(),
    clientsSection: useAnimation(),
    whyChooseUs: useAnimation(),
    bestSelling: useAnimation(),
    testimonials: useAnimation(),
    contactCTA: useAnimation(),
    howItWorks: useAnimation(),
    getQuote: useAnimation()
  };

  const isInView = {
    hero: useInView(refs.hero, { once: true }),
    brandLogos: useInView(refs.brandLogos, { once: true }),
    productCategories: useInView(refs.productCategories, { once: true }),
    newProducts: useInView(refs.newProducts, { once: true }),
    featuredProducts: useInView(refs.featuredProducts, { once: true }),
    clientsSection: useInView(refs.clientsSection, { once: true }),
    whyChooseUs: useInView(refs.whyChooseUs, { once: true }),
    bestSelling: useInView(refs.bestSelling, { once: true }),
    testimonials: useInView(refs.testimonials, { once: true }),
    contactCTA: useInView(refs.contactCTA, { once: true }),
    howItWorks: useInView(refs.howItWorks, { once: true }),
    getQuote: useInView(refs.getQuote, { once: true })
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <motion.div
          ref={refs.hero}
          initial="hidden"
          animate={controls.hero}
          variants={fadeInUp}
        >
          <HeroSection bannerImageUrls={bannerUrls} />
        </motion.div>

        <motion.div
          ref={refs.brandLogos}
          initial="hidden"
          animate={controls.brandLogos}
          variants={fadeInUp}
        >
          <BrandLogos brandImageUrls={brandUrls} />
        </motion.div>

        <motion.div
          ref={refs.productCategories}
          initial="hidden"
          animate={controls.productCategories}
          variants={fadeInUp}
        >
          <ProductCategories
            heading={exploreContent?.heading}
            subHeading={exploreContent?.subHeading}
            buttonText={exploreContent?.buttonText}
          />
        </motion.div>

        <motion.div
          ref={refs.newProducts}
          initial="hidden"
          animate={controls.newProducts}
          variants={fadeInUp}
        >
          <NewProducts
            sectionHeading={newProductsContent?.heading}
            sectionDescription={newProductsContent?.description}
          />
        </motion.div>

        <motion.div
          ref={refs.featuredProducts}
          initial="hidden"
          animate={controls.featuredProducts}
          variants={fadeInUp}
        >
          <FeaturedProducts />
        </motion.div>

        <motion.div
          ref={refs.clientsSection}
          initial="hidden"
          animate={controls.clientsSection}
          variants={fadeInUp}
        >
          <ClientsSection />
        </motion.div>

        <motion.div
          ref={refs.whyChooseUs}
          initial="hidden"
          animate={controls.whyChooseUs}
          variants={fadeInUp}
        >
          <WhyChooseUs />
        </motion.div>

        <motion.div
          ref={refs.bestSelling}
          initial="hidden"
          animate={controls.bestSelling}
          variants={fadeInUp}
        >
          {/* <BestSelling /> */}
        </motion.div>



        <motion.div
          ref={refs.howItWorks}
          initial="hidden"
          animate={controls.howItWorks}
          variants={fadeInUp}
        >
          <HowItWorks />
        </motion.div>

        <motion.div
          ref={refs.contactCTA}
          initial="hidden"
          animate={controls.contactCTA}
          variants={fadeInUp}
        >
          <ContactCTA />
        </motion.div>

        <motion.div
          ref={refs.testimonials}
          initial="hidden"
          animate={controls.testimonials}
          variants={fadeInUp}
        >
          <TestimonialsCarousel />
        </motion.div>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
