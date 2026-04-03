import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCatalogCategories, toPublicImageUrl, type CatalogCategory } from "@/lib/catalogApi";

interface Category {
  id: string;
  name: string;
  image: string;
  link: string;
}

type ProductCategoriesProps = {
  heading?: string;
  subHeading?: string;
  buttonText?: string;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const fallbackBySlug: Record<string, string> = {
  "apparel-wearables": "/nishanth_stock_images/Apparels/All.png",
  "bags-travel-essentials": "/nishanth_stock_images/Bags/All.png",
  "eco-friendly-products": "/nishanth_stock_images/Eco_Friendly/All.png",
  "drinkware-kitchenware": "/nishanth_stock_images/Kitchenware/All.png",
  "writing-stationery": "/nishanth_stock_images/Writing_Stationery/All.png",
  "awards-recognition": "/nishanth_stock_images/Trophies/All.png",
  "gadgets-accessories": "/nishanth_stock_images/Gadgets_Accessories/All.png",
  "office-essentials": "/nishanth_stock_images/Office_Essentials/All.png",
  "premium-gift-sets": "/nishanth_stock_images/Gift_Kits/All.png",
  "seasonal-products": "/nishanth_stock_images/Seasonal_Products/All.jpeg"
};

const defaultImage = "/nishanth_stock_images/Office_Essentials/All.png";

const ProductCategories = ({
  heading = "Explore Our Product Categories",
  subHeading = "Discover our comprehensive range of corporate gifts and promotional products",
  buttonText = "View All Categories"
}: ProductCategoriesProps) => {
  const navigate = useNavigate();
  const [categoriesFromApi, setCategoriesFromApi] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    let active = true;
    void fetchCatalogCategories()
      .then((rows) => {
        if (!active) return;
        setCategoriesFromApi(rows);
      })
      .catch(() => {
        if (!active) return;
        setCategoriesFromApi([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories: Category[] = useMemo(() => {
    const rows = categoriesFromApi.map((c) => {
      const slug = slugify(c.category_name);
      return {
        id: c.id,
        name: c.category_name,
        image: c.image_url ? toPublicImageUrl(c.image_url) : fallbackBySlug[slug] || defaultImage,
        link: `/products?category=${slug}`
      };
    });

    return [
      {
        id: "all",
        name: "All Products",
        image: defaultImage,
        link: "/products?category=all"
      },
      ...rows
    ];
  }, [categoriesFromApi]);

  const handleCategoryClick = (link: string) => {
    navigate(link);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            {heading}
          </h2>
          <p className="text-xs md:text-base lg:text-lg text-gray-600 max-w-5xl mx-auto">{subHeading}</p>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={() => navigate("/products?category=all")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {buttonText}
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-12 lg:gap-20 xl:gap-24 w-full px-4 md:px-4 lg:px-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategoryClick(category.link)}
            >
              <div className="relative w-24 h-24 md:w-40 md:h-40 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full mb-3 md:mb-4 group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 bg-white">
                <img src={category.image} alt={category.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xs md:text-sm lg:text-base xl:text-lg font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
