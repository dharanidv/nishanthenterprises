import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  fetchCatalogCategories,
  fetchCatalogProducts,
  fetchCatalogSubcategories,
  toPublicImageUrl,
  type CatalogCategory,
  type CatalogProduct,
  type CatalogSubcategory
} from "@/lib/catalogApi";

type SortOrder = "default" | "price-high-low" | "price-low-high";

type UiProduct = {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  extraImages: string[];
  isNew: boolean;
  isBestSeller: boolean;
  description: string;
};

function formatPrice(price: string | null) {
  if (!price) return "";
  const n = Number.parseFloat(price);
  return Number.isFinite(n) ? `Rs. ${n.toFixed(2)}` : `Rs. ${price}`;
}

function calcDiscount(original: string | null, offer: string | null) {
  const o = Number.parseFloat(original ?? "");
  const p = Number.parseFloat(offer ?? "");
  if (!Number.isFinite(o) || !Number.isFinite(p) || o <= 0 || p >= o) return "";
  return `${Math.round(((o - p) / o) * 100)}% OFF`;
}

function toUiProduct(p: CatalogProduct): UiProduct {
  const images = (p.images ?? []).map((i) => toPublicImageUrl(i.image_url));
  return {
    id: Number.parseInt(p.id, 10),
    name: p.product_name,
    price: formatPrice(p.offer_price ?? p.original_price),
    originalPrice: formatPrice(p.original_price),
    discount: calcDiscount(p.original_price, p.offer_price),
    image: images[0] ?? "",
    extraImages: images.slice(1),
    isNew: p.is_new_product || p.classification === "inhouse",
    isBestSeller: p.is_popular_product || p.classification === "branded",
    description: p.description ?? ""
  };
}

const SubCategoryProducts = () => {
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  const refs = { header: useRef(null), products: useRef(null) };
  const controls = { header: useAnimation(), products: useAnimation() };
  const inView = {
    header: useInView(refs.header, { once: true }),
    products: useInView(refs.products, { once: true })
  };

  useEffect(() => {
    if (inView.header) void controls.header.start("visible");
    if (inView.products) void controls.products.start("visible");
  }, [inView.header, inView.products, controls.header, controls.products]);

  // Safety net for hard refresh: force content visible once loading completes.
  useEffect(() => {
    if (!isLoading) {
      void controls.header.start("visible");
      void controls.products.start("visible");
    }
  }, [isLoading, controls.header, controls.products]);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const [c, s, p] = await Promise.all([
          fetchCatalogCategories(),
          fetchCatalogSubcategories(),
          fetchCatalogProducts({ subcategoryId: subCategoryId })
        ]);
        if (!active) return;
        setCategories(c);
        setSubcategories(s);
        setProducts(p);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [subCategoryId]);

  const currentSubcategory = useMemo(
    () => subcategories.find((s) => s.id === subCategoryId) || null,
    [subcategories, subCategoryId]
  );
  const currentCategory = useMemo(
    () => categories.find((c) => c.id === (currentSubcategory?.category_id || categoryId)) || null,
    [categories, currentSubcategory, categoryId]
  );

  const displayProducts = useMemo(() => {
    const list = products.map(toUiProduct);
    if (sortOrder === "price-high-low") {
      list.sort((a, b) => {
        const pa = Number.parseFloat(a.price.replace(/[^\d.]/g, "")) || 0;
        const pb = Number.parseFloat(b.price.replace(/[^\d.]/g, "")) || 0;
        return pb - pa;
      });
    } else if (sortOrder === "price-low-high") {
      list.sort((a, b) => {
        const pa = Number.parseFloat(a.price.replace(/[^\d.]/g, "")) || 0;
        const pb = Number.parseFloat(b.price.replace(/[^\d.]/g, "")) || 0;
        return pa - pb;
      });
    }
    return list;
  }, [products, sortOrder]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const productItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!currentSubcategory) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subcategory Not Found</h1>
          <button onClick={() => navigate("/products")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <motion.section
          ref={refs.header}
          initial="hidden"
          animate={controls.header}
          variants={fadeInUp}
          className="py-2 md:py-6 lg:py-8 bg-gray-50"
        >
          <div className="container mx-auto px-2 md:px-4">
            <div className="text-center">
              <button onClick={() => navigate(`/products?category=${categoryId || "all"}`)} className="flex items-center justify-center mx-auto mb-2 md:mb-4 text-blue-600 hover:text-blue-800 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Products
              </button>
              <div className="flex items-center justify-center gap-3">
                {currentSubcategory.image_url ? (
                  <img
                    src={toPublicImageUrl(currentSubcategory.image_url)}
                    alt={currentSubcategory.subcategory_name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border"
                  />
                ) : null}
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mb-1 md:mb-2">
                  {currentSubcategory.subcategory_name}
                </h1>
              </div>
              <p className="text-sm md:text-lg lg:text-xl text-gray-600">{currentCategory?.category_name || ""}</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={refs.products}
          initial="hidden"
          animate={controls.products}
          variants={staggerContainer}
          className="py-3 md:py-12"
        >
          <div className="container mx-auto px-2 md:px-4">
            <motion.div variants={fadeInUp} className="mb-3 md:mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
                  All {currentSubcategory.subcategory_name}
                </h2>
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-xs md:text-base font-medium text-gray-700">Filter by Price</span>
                  <div className="flex items-center gap-1 md:gap-3">
                    <button
                      onClick={() => setSortOrder("default")}
                      className={`w-6 h-6 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${sortOrder === "default" ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      title="Reset to default order"
                    >
                      <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSortOrder("price-low-high")}
                      className={`w-6 h-6 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${sortOrder === "price-low-high" ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      title="Price: Low to High"
                    >
                      <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSortOrder("price-high-low")}
                      className={`w-6 h-6 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${sortOrder === "price-high-low" ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      title="Price: High to Low"
                    >
                      <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-xs md:text-base mt-1 md:mt-2">Showing {displayProducts.length} products</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2 md:gap-6">
              {displayProducts.length ? (
                displayProducts.map((product) => (
                  <motion.div key={product.id} variants={productItem} className="group">
                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-200">
                      <div className="relative overflow-hidden flex-shrink-0 p-1 md:p-4 bg-white">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-xl h-64 md:h-96 bg-white">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                          )}
                          <div className="absolute top-1 md:top-2 left-1 md:left-2">
                            {product.isNew ? <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium mb-1">In-House</span> : null}
                            {product.isBestSeller ? <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">Branded</span> : null}
                          </div>
                          {product.discount ? (
                            <div className="absolute top-1 md:top-2 right-1 md:right-2">
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">{product.discount}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="p-2 md:p-4 flex-1 flex flex-col">
                        <h3 className="text-xs md:text-base font-bold text-black mb-1 md:mb-2 line-clamp-2 flex-shrink-0">{product.name}</h3>
                        <div className="flex items-center space-x-1 mb-2 flex-shrink-0">
                          <span className="text-sm font-bold text-black">{product.price}</span>
                          {product.originalPrice ? <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span> : null}
                        </div>
                        <div className="flex items-center space-x-1 mb-2 flex-shrink-0">
                          <p className="text-xs text-gray-500">Excluded Tax</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No products available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default SubCategoryProducts;
