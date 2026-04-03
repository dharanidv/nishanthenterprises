import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchCatalogProductById, toPublicImageUrl, type CatalogProduct } from "@/lib/catalogApi";

function formatPrice(price: string | null) {
  if (!price) return "";
  return `Rs. ${price}`;
}

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const p = await fetchCatalogProductById(id);
        if (!active) return;
        setProduct(p);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const images = product?.images || [];
  const currentImage = images[imageIndex]?.image_url ? toPublicImageUrl(images[imageIndex].image_url) : "";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-4">
          Back
        </button>

        {loading && <p className="text-gray-600">Loading product...</p>}

        {!loading && !product && <p className="text-gray-600">Product not found.</p>}

        {!loading && product && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square bg-gray-50 rounded overflow-hidden border">
                {currentImage ? (
                  <img src={currentImage} alt={product.product_name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setImageIndex(idx)}
                      className={`w-16 h-16 border rounded overflow-hidden ${idx === imageIndex ? "border-black" : "border-gray-200"}`}
                    >
                      <img src={toPublicImageUrl(img.image_url)} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-3">{product.product_name}</h1>
              <div className="flex items-center gap-3 mb-4">
                {product.offer_price && <span className="text-2xl font-semibold">{formatPrice(product.offer_price)}</span>}
                {product.original_price && (
                  <span className="text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description || "No description available."}</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
