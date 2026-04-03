import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  image: string;
  link: string;
  bgColor: string;
}

const ProductCategories = () => {
  const navigate = useNavigate();

  const categories: Category[] = [

    {
      id: 8,
      name: "All Products",
      image: "/nishanth_stock_images/Office_Essentials/All.png",
      link: "/products?category=all",
      bgColor: "bg-green-500"
    },
    {
      id: 1,
      name: "Apparel & Wearables",
      image: "/nishanth_stock_images/Apparels/All.png",
      link: "/products?category=apparel-wearables",
      bgColor: "bg-orange-500"
    },
    {
      id: 2,
      name: "Bags & Travel Essentials",
      image: "/nishanth_stock_images/Bags/All.png",
      link: "/products?category=bags-travel-essentials",
      bgColor: "bg-teal-700"
    },
    {
      id: 3,
      name: "Eco-Friendly Products",
      image: "/nishanth_stock_images/Eco_Friendly/All.png",
      link: "/products?category=eco-friendly-products",
      bgColor: "bg-green-600"
    },
    {
      id: 4,
      name: "Drinkware & Kitchenware",
      image: "/nishanth_stock_images/Kitchenware/All.png",
      link: "/products?category=drinkware-kitchenware",
      bgColor: "bg-blue-500"
    },
    {
      id: 5,
      name: "Writing & Stationery",
      image: "/nishanth_stock_images/Writing_Stationery/All.png",
      link: "/products?category=writing-stationery",
      bgColor: "bg-purple-500"
    },
    {
      id: 6,
      name: "Awards & Recognition",
      image: "/nishanth_stock_images/Trophies/All.png",
      link: "/products?category=awards-recognition",
      bgColor: "bg-yellow-500"
    },
    {
      id: 7,
      name: "Gadgets & Accessories",
      image: "/nishanth_stock_images/Gadgets_Accessories/All.png",
      link: "/products?category=gadgets-accessories",
      bgColor: "bg-gray-700"
    },

    {
      id: 9,
      name: "Premium Gift Sets",
      image: "/nishanth_stock_images/Gift_Kits/All.png",
      link: "/products?category=premium-gift-sets",
      bgColor: "bg-pink-500"
    },
    {
      id: 10,
      name: "Seasonal Products",
      image: "/nishanth_stock_images/Seasonal_Products/All.jpeg",
      link: "/products?category=seasonal-products",
      bgColor: "bg-indigo-600"
    }
  ];

  const handleCategoryClick = (link: string) => {
    navigate(link);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Explore Our Product Categories
          </h2>
          <p className="text-xs md:text-base lg:text-lg text-gray-600 max-w-5xl mx-auto">
            Discover our comprehensive range of corporate gifts and promotional products
          </p>
        </div>

        {/* View All Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/products?category=all')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Categories
          </button>
        </div>

        {/* Categories Grid - Mobile: 3 per row, Desktop: 5 per row */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-12 lg:gap-20 xl:gap-24 w-full px-4 md:px-4 lg:px-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategoryClick(category.link)}
            >
              {/* Circular Image Container - Responsive size */}
              <div className="relative w-24 h-24 md:w-40 md:h-40 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full mb-3 md:mb-4 group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 bg-white">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Category Name */}
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