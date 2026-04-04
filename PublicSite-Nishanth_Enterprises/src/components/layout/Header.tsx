import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, ChevronRight, X } from 'lucide-react';
import menuData from '@/data/menuData.json';
import {
  fetchCatalogCategories,
  fetchCatalogSubcategories,
  type CatalogCategory,
  type CatalogSubcategory
} from '@/lib/catalogApi';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** One column in the Products mega-menu: category header + subcategory lines from DB. */
interface ProductMegaColumn {
  id: string | number;
  name: string;
  link: string;
  categorySlug: string;
  subcategories?: { id: string; name: string }[];
  /** Fallback labels when catalog API is unavailable */
  legacyItems?: string[];
}

interface MainMenu {
  id: number;
  name: string;
  link: string;
  hasSubMenu: boolean;
  subCategories?: ProductMegaColumn[];
}

function buildMegaMenuFromCatalog(
  categories: CatalogCategory[],
  subcategories: CatalogSubcategory[]
): ProductMegaColumn[] {
  const subsByCat = new Map<string, CatalogSubcategory[]>();
  for (const s of subcategories) {
    const arr = subsByCat.get(s.category_id) ?? [];
    arr.push(s);
    subsByCat.set(s.category_id, arr);
  }
  return [...categories]
    .sort((a, b) => a.category_name.localeCompare(b.category_name))
    .map((c) => {
      const categorySlug = slugify(c.category_name);
      const subs = (subsByCat.get(c.id) ?? []).sort((a, b) =>
        a.subcategory_name.localeCompare(b.subcategory_name)
      );
      return {
        id: c.id,
        name: c.category_name,
        link: `/products?category=${categorySlug}`,
        categorySlug,
        subcategories: subs.map((s) => ({ id: s.id, name: s.subcategory_name }))
      };
    });
}

const Header = () => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);
  const [catalogMenuColumns, setCatalogMenuColumns] = useState<ProductMegaColumn[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void Promise.all([fetchCatalogCategories(), fetchCatalogSubcategories()])
      .then(([categories, subcategories]) => {
        if (!active) return;
        if (categories.length) {
          setCatalogMenuColumns(buildMegaMenuFromCatalog(categories, subcategories));
        } else {
          setCatalogMenuColumns([]);
        }
      })
      .catch(() => {
        if (!active) return;
        setCatalogMenuColumns(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const mainMenus: MainMenu[] = useMemo(() => {
    const base = menuData.mainMenus as MainMenu[];

    function jsonColumnsToMega(
      subCategories: NonNullable<MainMenu['subCategories']>
    ): ProductMegaColumn[] {
      return subCategories.map((sc) => {
        const link = sc.link ?? '';
        const q = link.match(/category=([^&]+)/);
        const categorySlug = q ? q[1] : 'all';
        const raw = sc as { items?: string[] };
        return {
          id: sc.id,
          name: sc.name,
          link,
          categorySlug,
          legacyItems: Array.isArray(raw.items) ? raw.items : undefined
        };
      });
    }

    return base.map((m) => {
      if (m.name !== 'Products' || !m.hasSubMenu || !m.subCategories) {
        return m;
      }
      if (catalogMenuColumns === null) {
        return { ...m, subCategories: jsonColumnsToMega(m.subCategories) };
      }
      if (catalogMenuColumns.length > 0) {
        return { ...m, subCategories: catalogMenuColumns };
      }
      return { ...m, subCategories: jsonColumnsToMega(m.subCategories) };
    });
  }, [catalogMenuColumns]);

  // Check if we're on the home page
  const isHomePage = window.location.pathname === '/';

  // Navigation handlers
  const handleMainMenuClick = (menu: MainMenu) => {
    if (menu.name === 'Products') {
      // Main Products menu goes to all products
      navigate('/products?category=all');
    } else {
      // Other menus use their normal links
      navigate(menu.link);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
    setExpandedMobileMenu(null);
    setExpandedSubMenu(null);
  };

  const closeMobileNav = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenu(null);
    setExpandedSubMenu(null);
  };

  const handleSubCategoryClick = (subCategory: ProductMegaColumn) => {
    navigate(subCategory.link);
    closeMobileNav();
  };

  /** DB-driven: same route shape as Products page (`/subcategory/:categorySlug/:subcategoryId`). */
  const handleCatalogSubcategoryClick = (categorySlug: string, subcategoryId: string) => {
    navigate(`/subcategory/${categorySlug}/${subcategoryId}`);
    closeMobileNav();
  };

  /** Static JSON fallback when catalog API fails — legacy slug heuristics. */
  const handleLegacyItemClick = (subCategory: ProductMegaColumn, item: string) => {
    let itemSlug = item
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/t-shirt/g, 'tshirt')
      .replace(/t-shirts/g, 'tshirts');

    const singularToPluralMap: { [key: string]: string } = {
      shirt: 'shirts',
      cap: 'caps',
      hoodie: 'hoodies',
      jersey: 'jersey',
      bag: 'bags',
      bottle: 'bottles',
      mug: 'mugs',
      pen: 'pens',
      notebook: 'notebooks',
      trophy: 'trophies',
      medal: 'medals',
      'metal-cup': 'metal-cups',
      'corporate-metal-trophy': 'corporate-metal-trophies',
      'wooden-plaque': 'wooden-plaques',
      'card-holder': 'card-holders',
      speaker: 'bluetooth-speakers',
      watch: 'smart-watches',
      organizer: 'organizers',
      'gift-set': 'gift-sets',
      utility: 'utilities',
      'bluetooth-speakers': 'bluetooth-speakers',
      'power-banks': 'power-banks',
      'air-pods': 'air-pods',
      'smart-watches': 'smart-watches',
      'wrist-watches': 'wrist-watches',
      bands: 'bands',
      'pen-drives': 'pen-drives',
      accessories: 'accessories',
      clocks: 'clocks',
      'cups-and-flasks': 'cups',
      'eco-friendly-gadgets': 'eco-friendly-gadgets',
      'note-book': 'note-book',
      'stationary-kit': 'stationary-kit'
    };

    if (singularToPluralMap[itemSlug]) {
      itemSlug = singularToPluralMap[itemSlug];
    }

    const categoryMatch = subCategory.link.match(/category=([^&]+)/);
    if (categoryMatch) {
      navigate(`/subcategory/${categoryMatch[1]}/${itemSlug}`);
    } else {
      navigate(subCategory.link);
    }
    closeMobileNav();
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+918667793272'; // Change this to your actual WhatsApp number
    const message = 'Hello! I would like to know more about your products.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGetQuoteClick = () => {
    // Navigate to home page and scroll to get quote section
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    // Scroll to get quote section after a short delay to ensure page loads
    setTimeout(() => {
      const getQuoteSection = document.getElementById('get-quote-section');
      if (getQuoteSection) {
        getQuoteSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSupportClick = () => {
    const phoneNumber = '+918667793272'; // Change this to your actual phone number
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleMobileMenuToggle = (menuName: string) => {
    if (expandedMobileMenu === menuName) {
      setExpandedMobileMenu(null);
      setExpandedSubMenu(null); // Close sub-menu when main menu closes
    } else {
      setExpandedMobileMenu(menuName);
      setExpandedSubMenu(null); // Reset sub-menu when switching main menus
    }
  };

  const handleSubMenuToggle = (menuName: string, subCategoryId: string | number) => {
    const subMenuKey = `${menuName}-${subCategoryId}`;
    if (expandedSubMenu === subMenuKey) {
      setExpandedSubMenu(null);
    } else {
      setExpandedSubMenu(subMenuKey);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top Header Bar - Hidden on Mobile */}
        <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              {/* Left - Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3">
                  <img 
                    src="/logo/nishanth_enterprises_logo.png" 
                    alt="Nishanth Enterprises Logo" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-bold text-xl text-black hover:text-gray-700 transition-colors">
                    Nishanth Enterprises
                  </span>
                </Link>
              </div>

              {/* Center - Navigation Menu */}
              <div className="flex-1 flex items-center justify-center relative">
                <nav className="flex items-center space-x-8">
                  {mainMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="relative"
                      onMouseEnter={() => setHoveredMenu(menu.name)}
                      onMouseLeave={() => setHoveredMenu(null)}
                    >
                      <Link
                        to={menu.link}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMainMenuClick(menu);
                        }}
                        className={`text-gray-700 hover:text-black font-medium transition-colors duration-200 py-6 relative ${
                          (hoveredMenu === menu.name || (isHomePage && menu.name === 'Home')) 
                            ? 'text-black' 
                            : ''
                        }`}
                      >
                        {menu.name}
                        {(hoveredMenu === menu.name || (isHomePage && menu.name === 'Home')) && (
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
                        )}
                      </Link>
                    </div>
                  ))}
                </nav>

                {/* Mega Menu Dropdown - Full Width */}
                {hoveredMenu && mainMenus.find(menu => menu.name === hoveredMenu)?.hasSubMenu && (
                  <div 
                    className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-200 py-8 z-50"
                    onMouseEnter={() => setHoveredMenu(hoveredMenu)}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    <div className="w-full px-4">
                      {/* Full width grid for all menus including Products */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 w-full">
                        {mainMenus.find(menu => menu.name === hoveredMenu)?.subCategories?.map((subCategory) => (
                          <div key={subCategory.id} className="space-y-3">
                            <Link
                              to={subCategory.link}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSubCategoryClick(subCategory);
                              }}
                              className="flex items-center text-black font-semibold hover:text-gray-600 transition-colors group cursor-pointer"
                            >
                              {subCategory.name}
                              {((subCategory.subcategories?.length ?? 0) > 0 ||
                                (subCategory.legacyItems?.length ?? 0) > 0) && (
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              )}
                            </Link>
                            {subCategory.subcategories && subCategory.subcategories.length > 0 ? (
                              <div className="space-y-2">
                                {subCategory.subcategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={`/subcategory/${subCategory.categorySlug}/${sub.id}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleCatalogSubcategoryClick(subCategory.categorySlug, sub.id);
                                    }}
                                    className="block text-gray-600 hover:text-black transition-colors text-sm cursor-pointer"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            ) : subCategory.legacyItems && subCategory.legacyItems.length > 0 ? (
                              <div className="space-y-2">
                                {subCategory.legacyItems.map((item, index) => (
                                  <Link
                                    key={index}
                                    to={`${subCategory.link}&item=${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleLegacyItemClick(subCategory, item);
                                    }}
                                    className="block text-gray-600 hover:text-black transition-colors text-sm cursor-pointer"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Support & Get Quote */}
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleSupportClick}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Call us</span>
                </button>
                <button 
                  onClick={handleGetQuoteClick}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Get Quote</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Left - Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Center - Logo and Company Name */}
              <div className="flex items-center space-x-2">
                <Link to="/" className="flex items-center space-x-2">
                  <img 
                    src="/logo/nishanth_enterprises_logo.png" 
                    alt="Nishanth Enterprises Logo" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-bold text-lg text-black hover:text-gray-700 transition-colors">
                    Nishanth Enterprises
                  </span>
                </Link>
              </div>

              {/* Right - Support & Get Quote */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleSupportClick}
                  className="p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleGetQuoteClick}
                  className="p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setExpandedMobileMenu(null);
            setExpandedSubMenu(null);
          }}
        >
          <div 
            className="bg-white h-full w-80 max-w-[80vw] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-sm font-medium">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
              {mainMenus.map((menu) => (
                <div key={menu.id} className="space-y-2">
                  {menu.hasSubMenu ? (
                    // Menu with sub-categories
                    <div>
                      <button
                        onClick={() => handleMobileMenuToggle(menu.name)}
                        className="w-full flex items-center justify-between text-left py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMainMenuClick(menu);
                          }}
                          className="font-medium text-gray-900 group-hover:text-black transition-colors"
                        >
                          {menu.name}
                        </button>
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            expandedMobileMenu === menu.name ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                      
                      {expandedMobileMenu === menu.name && menu.subCategories && (
                        <div className="ml-4 space-y-2 animate-slideDown">
                          {menu.subCategories.map((subCategory) => {
                            const hasNested =
                              (subCategory.subcategories?.length ?? 0) > 0 ||
                              (subCategory.legacyItems?.length ?? 0) > 0;
                            return (
                            <div key={String(subCategory.id)} className="space-y-2">
                              {hasNested ? (
                                <div>
                                  <button
                                    onClick={() => handleSubMenuToggle(menu.name, subCategory.id)}
                                    className="w-full flex items-center justify-between text-left py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubCategoryClick(subCategory);
                                      }}
                                      className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors"
                                    >
                                      {subCategory.name}
                                    </button>
                                    <ChevronRight 
                                      className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                                        expandedSubMenu === `${menu.name}-${subCategory.id}` ? 'rotate-90' : ''
                                      }`} 
                                    />
                                  </button>
                                  
                                  {expandedSubMenu === `${menu.name}-${subCategory.id}` && (
                                    <div className="ml-4 space-y-1 animate-slideDown">
                                      {subCategory.subcategories?.map((sub) => (
                                        <button
                                          key={sub.id}
                                          onClick={() =>
                                            handleCatalogSubcategoryClick(subCategory.categorySlug, sub.id)
                                          }
                                          className="block w-full text-left py-2 px-4 text-xs text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                          {sub.name}
                                        </button>
                                      ))}
                                      {subCategory.legacyItems?.map((item, index) => (
                                        <button
                                          key={`legacy-${index}`}
                                          onClick={() => handleLegacyItemClick(subCategory, item)}
                                          className="block w-full text-left py-2 px-4 text-xs text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                          {item}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSubCategoryClick(subCategory)}
                                  className="block w-full text-left py-2 px-4 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  {subCategory.name}
                                </button>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Menu without sub-categories
                    <button
                      onClick={() => handleMainMenuClick(menu)}
                      className="block w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-900 hover:text-black"
                    >
                      {menu.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;