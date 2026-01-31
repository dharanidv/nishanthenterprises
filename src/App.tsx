import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import SubCategoryProducts from '@/pages/SubCategoryProducts';
import ScrollToTop from '@/components/ScrollToTop';
import WhatsAppButton from '@/components/WhatsAppButton';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/subcategory/:categoryId/:subCategoryId" element={<SubCategoryProducts />} />
          <Route path="/product/:category/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <WhatsAppButton />
        <Toaster />
      </TooltipProvider>
    </Router>
  );
}

export default App;
