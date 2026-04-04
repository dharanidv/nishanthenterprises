const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CatalogCategory = {
  id: string;
  category_name: string;
  image_url?: string | null;
};

export type CatalogSubcategory = {
  id: string;
  subcategory_name: string;
  category_id: string;
  image_url?: string | null;
};

export type CatalogProductImage = {
  id: string;
  image_url: string;
  display_order: number;
};

export type CatalogProduct = {
  id: string;
  product_name: string;
  subcategory_id: string;
  category_id: string;
  category_name: string;
  subcategory_name: string;
  description: string | null;
  original_price: string | null;
  offer_price: string | null;
  classification: "inhouse" | "branded" | "hot" | "cold" | null;
  is_new_product: boolean;
  is_popular_product: boolean;
  images?: CatalogProductImage[];
};

function toQueryString(params: Record<string, string | undefined>) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qp.set(k, v);
  });
  const s = qp.toString();
  return s ? `?${s}` : "";
}

async function apiGet<T>(path: string): Promise<T> {
  const primaryUrl = API_BASE ? `${API_BASE}${path}` : path;
  let res: Response;
  try {
    res = await fetch(primaryUrl);
  } catch (err) {
    if (API_BASE) {
      // Dev fallback: use Vite proxy (/api, /assets) when direct backend origin is unreachable.
      res = await fetch(path);
    } else {
      throw err;
    }
  }

  // If a configured base URL fails (CORS/404/etc), retry relative path once.
  if (!res.ok && API_BASE) {
    const fallbackRes = await fetch(path);
    if (fallbackRes.ok) {
      const fallbackJson = (await fallbackRes.json()) as ApiResponse<T>;
      return fallbackJson.data;
    }
  }

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

export function toPublicImageUrl(imageUrl: string) {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  // DB stores relative paths under assets root, e.g. "category/subcategory/file.png".
  if (imageUrl.startsWith("/assets/")) return `${API_BASE}${imageUrl}`;
  if (imageUrl.startsWith("/")) return `${API_BASE}/assets${imageUrl}`;
  return `${API_BASE}/assets/${imageUrl}`;
}

/** Same slug rules as Products / category links. */
export function slugifyCategoryName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatPriceRs(price: string | null): string {
  if (!price) return "";
  const n = Number.parseFloat(price);
  return Number.isFinite(n) ? `Rs. ${n.toFixed(2)}` : `Rs. ${price}`;
}

/** First image by `display_order`, then `id`. */
export function firstProductImageUrl(product: CatalogProduct): string {
  const imgs = product.images ?? [];
  if (!imgs.length) return "";
  const sorted = [...imgs].sort((a, b) => {
    if (a.display_order !== b.display_order) return a.display_order - b.display_order;
    return a.id.localeCompare(b.id);
  });
  return toPublicImageUrl(sorted[0].image_url);
}

export async function fetchCatalogCategories() {
  return apiGet<CatalogCategory[]>("/api/public/catalog/categories");
}

export async function fetchCatalogSubcategories(categoryId?: string) {
  return apiGet<CatalogSubcategory[]>(
    `/api/public/catalog/subcategories${toQueryString({ category_id: categoryId })}`
  );
}

export async function fetchCatalogProducts(params?: {
  categoryId?: string;
  subcategoryId?: string;
  isNewProduct?: boolean;
  isPopularProduct?: boolean;
}) {
  const isNew =
    params?.isNewProduct === true ? "true" : params?.isNewProduct === false ? "false" : undefined;
  const isPopular =
    params?.isPopularProduct === true
      ? "true"
      : params?.isPopularProduct === false
        ? "false"
        : undefined;
  return apiGet<CatalogProduct[]>(
    `/api/public/catalog/products${toQueryString({
      include_images: "true",
      category_id: params?.categoryId,
      subcategory_id: params?.subcategoryId,
      is_new_product: isNew,
      is_popular_product: isPopular
    })}`
  );
}

export async function fetchCatalogProductById(id: string) {
  return apiGet<CatalogProduct>(`/api/public/catalog/products/${id}`);
}
