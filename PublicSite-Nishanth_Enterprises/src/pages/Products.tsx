import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

type UiProduct = {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  extraImages: string[];
  /** CMS classification — show In-House badge only when inhouse */
  labelInHouse: boolean;
  /** CMS classification — show Branded badge only when branded */
  labelBranded: boolean;
  /** Red badge text only for hot/cold classification (no % discount label) */
  hotColdLabel: "Hot" | "Cold" | null;
  description: string;
  categorySlug: string;
  subcategoryId: string;
};

type UiSubCategory = {
  id: string;
  name: string;
  image?: string;
  products: UiProduct[];
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatPrice(raw: string | null): string {
  if (!raw) return "";
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return `Rs. ${raw}`;
  return `Rs. ${n.toFixed(2)}`;
}

function hotColdLabelFromClassification(
  c: CatalogProduct["classification"]
): "Hot" | "Cold" | null {
  if (c === "hot") return "Hot";
  if (c === "cold") return "Cold";
  return null;
}

function mapToUiProduct(row: CatalogProduct): UiProduct {
  const images = (row.images ?? []).map((x) => toPublicImageUrl(x.image_url));
  const main = images[0] ?? "";
  const extra = images.slice(1);
  const categorySlug = slugify(row.category_name ?? "");
  return {
    id: Number.parseInt(row.id, 10),
    name: row.product_name,
    price: formatPrice(row.offer_price ?? row.original_price),
    originalPrice: formatPrice(row.original_price),
    image: main,
    extraImages: extra,
    labelInHouse: row.classification === "inhouse",
    labelBranded: row.classification === "branded",
    hotColdLabel: hotColdLabelFromClassification(row.classification),
    description: row.description ?? "",
    categorySlug,
    subcategoryId: row.subcategory_id
  };
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  const [carouselStates, setCarouselStates] = useState<Record<string, number>>({});

  const refs = {
    header: useRef(null),
    categories: useRef(null),
    products: useRef(null)
  };
  const controls = {
    header: useAnimation(),
    categories: useAnimation(),
    products: useAnimation()
  };
  const inView = {
    header: useInView(refs.header, { once: true }),
    categories: useInView(refs.categories, { once: true }),
    products: useInView(refs.products, { once: true })
  };

  useEffect(() => {
    if (inView.header) void controls.header.start("visible");
    if (inView.categories) void controls.categories.start("visible");
    if (inView.products) void controls.products.start("visible");
  }, [inView.header, inView.categories, inView.products, controls.header, controls.categories, controls.products]);

  // Safety net: ensure content is visible after data load even if intersection observer misses.
  useEffect(() => {
    if (!isLoading) {
      void controls.header.start("visible");
      void controls.categories.start("visible");
      void controls.products.start("visible");
    }
  }, [isLoading, controls.header, controls.categories, controls.products]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "all";
    const subcategoryFromUrl = searchParams.get("subcategory");
    setActiveCategory(categoryFromUrl);
    setActiveSubCategory(subcategoryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        let c: CatalogCategory[] = [];
        let s: CatalogSubcategory[] = [];
        let p: CatalogProduct[] = [];
        let lastErr: unknown = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            [c, s, p] = await Promise.all([
              fetchCatalogCategories(),
              fetchCatalogSubcategories(),
              fetchCatalogProducts()
            ]);
            lastErr = null;
            break;
          } catch (err) {
            lastErr = err;
            if (attempt < 3) await sleep(500 * attempt);
          }
        }

        if (lastErr) {
          throw lastErr;
        }
        if (!active) return;
        setCategories(c);
        setSubcategories(s);
        setProducts(p);
      } catch (err) {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const uiSubcategories = useMemo<UiSubCategory[]>(() => {
    const activeCategoryNorm = normalizeKey(activeCategory);
    const selectedCategoryId =
      activeCategory === "all"
        ? null
        : categories.find(
            (c) =>
              c.id === activeCategory ||
              slugify(c.category_name) === activeCategory ||
              normalizeKey(c.category_name) === activeCategoryNorm
          )?.id ?? null;

    const subs = (selectedCategoryId
      ? subcategories.filter((s) => s.category_id === selectedCategoryId)
      : subcategories
    ).map((s) => {
      const subProducts = products.filter((p) => p.subcategory_id === s.id).map(mapToUiProduct);
      const parent = categoriesById.get(s.category_id);
      const image = s.image_url
        ? toPublicImageUrl(s.image_url)
        : parent?.image_url
          ? toPublicImageUrl(parent.image_url)
          : undefined;
      return {
        id: s.id,
        name: s.subcategory_name,
        image,
        products: subProducts
      };
    });

    if (activeSubCategory) {
      const activeSubNorm = normalizeKey(activeSubCategory);
      const matched = subs.filter(
        (s) =>
          s.id === activeSubCategory ||
          slugify(s.name) === activeSubCategory ||
          normalizeKey(s.name) === activeSubNorm
      );
      if (matched.length > 0) return matched;
    }
    return subs;
  }, [activeCategory, activeSubCategory, categories, subcategories, products, categoriesById]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const productItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  const nextCategoriesSlide = () => {
    const container = document.getElementById("categories-carousel");
    if (!container) return;
    container.scrollLeft += 600;
  };

  const prevCategoriesSlide = () => {
    const container = document.getElementById("categories-carousel");
    if (!container) return;
    container.scrollLeft -= 600;
  };

  const nextSlide = (subCategoryId: string, totalProducts: number) => {
    const currentState = carouselStates[subCategoryId] || 0;
    const maxSlides = Math.max(0, Math.ceil(totalProducts / 6) - 1);
    setCarouselStates((prev) => ({ ...prev, [subCategoryId]: Math.min(currentState + 1, maxSlides) }));
  };

  const prevSlide = (subCategoryId: string) => {
    const currentState = carouselStates[subCategoryId] || 0;
    setCarouselStates((prev) => ({ ...prev, [subCategoryId]: Math.max(currentState - 1, 0) }));
  };

  const getCarouselProducts = (items: UiProduct[], subCategoryId: string) => {
    const currentState = carouselStates[subCategoryId] || 0;
    const startIndex = currentState * 6;
    return items.slice(startIndex, startIndex + 6);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
      <Header />
      <main>
        <motion.section
          ref={refs.header}
          initial="hidden"
          animate={controls.header}
          variants={fadeInUp}
          className="py-4 md:py-6 lg:py-8 bg-gray-50"
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2">Our Products</h1>
            <p className="text-lg md:text-xl text-gray-600">
              {activeCategory === "all" ? "All Products" : activeCategory.replace(/-/g, " ")}
            </p>
          </div>
        </motion.section>

        {!isLoading && uiSubcategories.length > 0 && (
          <motion.section
            ref={refs.categories}
            initial="hidden"
            animate={controls.categories}
            variants={fadeInUp}
            className="py-8 md:py-16 bg-white border-b border-gray-200"
          >
            <div className="container mx-auto px-4">
              <div className="relative">
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-200"
                  onClick={prevCategoriesSlide}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-200"
                  onClick={nextCategoriesSlide}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="flex justify-center">
                  <div id="categories-carousel" className="flex gap-8 md:gap-16 overflow-x-auto scrollbar-hide pb-4 md:pb-6 px-4 md:px-8 scroll-smooth">
                    {uiSubcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex flex-col items-center cursor-pointer group flex-shrink-0 transition-all duration-300 p-2 md:p-4 ${activeSubCategory === sub.id ? "scale-110" : ""}`}
                        onClick={() => {
                          setActiveSubCategory(sub.id);
                          const node = document.getElementById(`subcategory-${sub.id}`);
                          if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        <div className="relative w-20 h-20 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full mb-2 md:mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 bg-white">
                          {sub.image ? (
                            <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-gray-400">No image</div>
                          )}
                        </div>
                        <h3 className="text-xs md:text-base font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight max-w-20 md:max-w-28 lg:max-w-32">
                          {sub.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {uiSubcategories.length > 0 && (
          <motion.section ref={refs.products} initial="hidden" animate={controls.products} className="py-6 md:py-12">
            <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              {uiSubcategories.map((sub) => {
                if (!sub.products.length) return null;
                return (
                  <motion.div key={sub.id} variants={fadeInUp} className="mb-12" id={`subcategory-${sub.id}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        {sub.name}
                        <svg className="w-6 h-6 ml-2 text-gray-600 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </h2>
                      <div className="hidden items-center space-x-2">
                        <button
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                          onClick={() => prevSlide(sub.id)}
                          disabled={(carouselStates[sub.id] || 0) === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                          onClick={() => nextSlide(sub.id, sub.products.length)}
                          disabled={(carouselStates[sub.id] || 0) >= Math.ceil(sub.products.length / 6) - 1}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide">
                        {getCarouselProducts(sub.products, sub.id).map((product) => (
                          <motion.div key={product.id} variants={productItem} className="group flex-shrink-0 w-64 md:w-72 lg:w-80">
                            <div
                              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer border border-gray-200"
                              onClick={() => navigate(`/product/${product.categorySlug || "all"}/${product.id}`)}
                            >
                              <div className="relative overflow-hidden flex-shrink-0 p-2 md:p-3 bg-white">
                                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-xl h-80 md:h-96 bg-white">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                                  )}
                                  {product.labelInHouse || product.labelBranded ? (
                                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
                                      {product.labelInHouse ? (
                                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">In-House</span>
                                      ) : null}
                                      {product.labelBranded ? (
                                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">Branded</span>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  {product.hotColdLabel ? (
                                    <div className="absolute top-2 right-2">
                                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        {product.hotColdLabel}
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              <div className="p-3 md:p-4 flex-1 flex flex-col">
                                <h3 className="text-xs font-bold text-black mb-1 line-clamp-2 flex-shrink-0">{product.name}</h3>
                                <div className="flex items-center space-x-1 mb-2 flex-shrink-0">
                                  <span className="text-sm font-bold text-black">{product.price}</span>
                                  {product.originalPrice ? <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span> : null}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <button
                        className="inline-flex items-center justify-center px-4 py-2 md:px-8 md:py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-300 min-w-[150px] md:min-w-[200px] text-sm md:text-base"
                        onClick={() => navigate(`/subcategory/${sub.products[0]?.categorySlug || "all"}/${sub.id}`)}
                      >
                        <span>See More {sub.name}</span>
                        <div className="flex items-center ml-2 md:ml-3 space-x-1">
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {!isLoading && loadError ? (
          <div className="container mx-auto px-4 pb-8">
            <p className="text-sm text-red-600">Unable to load products: {loadError}</p>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
