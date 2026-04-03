const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const TOKEN_KEY = "cms_auth_token";
const USER_KEY = "cms_user";

export type StoredUser = { email: string; username: string };

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "email" in parsed &&
      "username" in parsed &&
      typeof (parsed as StoredUser).email === "string" &&
      typeof (parsed as StoredUser).username === "string"
    ) {
      return parsed as StoredUser;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setAuthSession(token: string, user: StoredUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

let sessionExpiryRedirectStarted = false;

/**
 * JWT invalid or expired (401). Clears storage and sends user to login.
 * Throws so callers do not treat the response as success.
 */
export function sessionExpiredLogout(): never {
  if (typeof window !== "undefined" && !sessionExpiryRedirectStarted) {
    sessionExpiryRedirectStarted = true;
    clearAuthSession();
    window.location.replace("/login");
  }
  throw new Error("Session expired. Please sign in again.");
}

async function authedFetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.status === 401) {
    sessionExpiredLogout();
  }
  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const message = (json as { error?: string })?.error ?? "Request failed";
    throw new Error(String(message));
  }
  return json as T;
}

/** Bearer only — use for GET (avoids extra Content-Type on safe methods). */
export function bearerAuth(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** Bearer + JSON — use for POST/PATCH with a body. */
export function authHeaders(token: string): HeadersInit {
  return {
    ...bearerAuth(token),
    "Content-Type": "application/json"
  };
}

/** Public — no JWT (used before login). */
export async function publicHealth(): Promise<{ status: "ok" }> {
  const res = await fetch(`${BACKEND_URL}/api/health`, {
    method: "GET",
    cache: "no-store"
  });
  const json = (await res.json().catch(() => null)) as { status?: string } | null;
  if (!res.ok || json?.status !== "ok") {
    throw new Error("Server not ready");
  }
  return { status: "ok" };
}

export type DbHealthResponse =
  | { status: "ok"; database: "connected" }
  | { status: "error"; database: "disconnected" };

/** Requires JWT. */
export async function dbHealthCheck(token: string): Promise<DbHealthResponse> {
  const res = await fetch(`${BACKEND_URL}/api/db-health-check`, {
    method: "GET",
    headers: bearerAuth(token),
    cache: "no-store"
  });

  if (res.status === 401) {
    sessionExpiredLogout();
  }

  const json = (await res.json().catch(() => null)) as DbHealthResponse | null;
  if (!json || (json.status !== "ok" && json.status !== "error")) {
    throw new Error("Unexpected health-check response");
  }

  return json;
}

export type LoginResponse = {
  token: string;
  tokenType: "Bearer";
  user: { email: string; username: string };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const message = (json as { error?: string; message?: string })?.error
      ?? (json as { message?: string })?.message
      ?? "Login failed";
    throw new Error(String(message));
  }

  return json as LoginResponse;
}

export type ProfileResponse = {
  email: string;
  username: string;
  passwordMasked: string;
  passwordNote: string;
};

/** Requires JWT. */
export async function fetchProfile(token: string): Promise<ProfileResponse> {
  return authedFetchJson<ProfileResponse>(`${BACKEND_URL}/api/auth/me`, {
    method: "GET",
    headers: bearerAuth(token),
    cache: "no-store"
  });
}

/**
 * Authenticated JSON request helper for future CMS APIs.
 * Always sends Bearer token.
 */
export async function apiGet<T>(path: string, token: string): Promise<T> {
  const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return authedFetchJson<T>(url, {
    method: "GET",
    headers: bearerAuth(token),
    cache: "no-store"
  });
}

export async function apiPut<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return authedFetchJson<T>(url, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  });
}

export async function apiDelete<T>(path: string, token: string): Promise<T> {
  const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return authedFetchJson<T>(url, {
    method: "DELETE",
    headers: bearerAuth(token),
    cache: "no-store"
  });
}

export async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return authedFetchJson<T>(url, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  });
}

/** Absolute URL for uploaded assets or pass-through for http(s) URLs. */
export function resolveMediaUrl(stored: string): string {
  const s = stored.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = BACKEND_URL.replace(/\/$/, "");
  let path = s.replace(/^\/+/, "");
  // DB may store "page/section/file.jpg" or "assets/page/section/file.jpg"
  if (/^assets\//i.test(path)) {
    path = path.replace(/^assets\//i, "");
  }
  return `${base}/assets/${path}`;
}

export type CmsPage = {
  id: string;
  page_name: string;
  created_at: string;
  updated_at: string;
};

export type PagesListResponse = {
  success: boolean;
  data: CmsPage[];
  count: number;
};

export type PageMutationResponse = {
  success: boolean;
  data: CmsPage;
};

export async function fetchPages(token: string): Promise<CmsPage[]> {
  const res = await apiGet<PagesListResponse>("/api/pages", token);
  return res.data ?? [];
}

export async function fetchPageBySlug(token: string, pageName: string): Promise<CmsPage> {
  const enc = encodeURIComponent(pageName);
  const res = await apiGet<PageMutationResponse>(`/api/pages/by-name/${enc}`, token);
  return res.data;
}

export async function createPageApi(token: string, pageName: string): Promise<CmsPage> {
  const res = await apiPost<PageMutationResponse>("/api/pages", token, { page_name: pageName });
  return res.data;
}

export type CmsPageSection = {
  id: string;
  section_name: string;
  page_id: string;
  section_content: string | null;
  created_time: string;
  updated_time: string;
};

export type CmsPageImage = {
  id: string;
  image_url: string;
  section_id: string;
  /** true = active, false = inactive */
  status: boolean;
  created_time: string;
  updated_time: string;
};

type ListWrap<T> = { success: boolean; data: T[]; count: number };

export async function fetchSectionsForPage(token: string, pageId: string): Promise<CmsPageSection[]> {
  const res = await apiGet<ListWrap<CmsPageSection>>(`/api/page-sections?page_id=${encodeURIComponent(pageId)}`, token);
  return res.data ?? [];
}

export async function fetchImagesForSection(token: string, sectionId: string): Promise<CmsPageImage[]> {
  const res = await apiGet<ListWrap<CmsPageImage>>(
    `/api/page-images?section_id=${encodeURIComponent(sectionId)}`,
    token
  );
  return res.data ?? [];
}

export async function createSectionApi(
  token: string,
  params: { pageId: string; sectionName: string; sectionContent: string | null }
): Promise<CmsPageSection> {
  const res = await apiPost<{ success: boolean; data: CmsPageSection }>("/api/page-sections", token, {
    page_id: Number(params.pageId),
    section_name: params.sectionName,
    section_content: params.sectionContent
  });
  return res.data;
}

export async function updateSectionApi(
  token: string,
  sectionId: string,
  params: { sectionName: string; sectionContent: string | null }
): Promise<CmsPageSection> {
  const res = await apiPut<{ success: boolean; data: CmsPageSection }>(`/api/page-sections/${sectionId}`, token, {
    section_name: params.sectionName,
    section_content: params.sectionContent
  });
  return res.data;
}

export async function deleteSectionApi(token: string, sectionId: string): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/page-sections/${sectionId}`, token);
}

export async function deletePageImageApi(token: string, imageId: string): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/page-images/${imageId}`, token);
}

/** Toggle or set active/inactive (JSON body: status only). */
export async function updatePageImageStatusApi(token: string, imageId: string, status: boolean): Promise<CmsPageImage> {
  const res = await apiPut<{ success: boolean; data: CmsPageImage }>(`/api/page-images/${imageId}`, token, {
    status
  });
  return res.data;
}

/** Replace image file — PUT multipart, field `image` only. */
export async function replacePageImage(token: string, imageId: string, file: File): Promise<CmsPageImage> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${BACKEND_URL}/api/page-images/${imageId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });
  if (res.status === 401) {
    sessionExpiredLogout();
  }
  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: CmsPageImage; error?: string } | null;
  if (!res.ok || !json?.data) {
    throw new Error(json?.error ?? "Image update failed");
  }
  return json.data;
}

/** Multipart upload — field `image`, text field `section_id`. */
export async function uploadPageImage(token: string, sectionId: string, file: File): Promise<CmsPageImage> {
  const fd = new FormData();
  fd.append("section_id", sectionId);
  fd.append("image", file);
  const res = await fetch(`${BACKEND_URL}/api/page-images/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });
  if (res.status === 401) {
    sessionExpiredLogout();
  }
  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: CmsPageImage; error?: string } | null;
  if (!res.ok || !json?.data) {
    throw new Error(json?.error ?? "Image upload failed");
  }
  return json.data;
}

export async function updatePageApi(token: string, id: string, pageName: string): Promise<CmsPage> {
  const res = await apiPut<PageMutationResponse>(`/api/pages/${id}`, token, { page_name: pageName });
  return res.data;
}

export async function deletePageApi(token: string, id: string): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/pages/${id}`, token);
}

// --- Catalog: categories & products ---

export type CatalogCategory = {
  id: string;
  category_name: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogSubcategory = {
  id: string;
  subcategory_name: string;
  category_id: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogProductImage = {
  id: string;
  image_url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CatalogProduct = {
  id: string;
  product_name: string;
  subcategory_id: string;
  category_id: string;
  category_name?: string;
  subcategory_name?: string;
  description: string | null;
  original_price: string | null;
  offer_price: string | null;
  classification: string | null;
  is_new_product: boolean;
  is_popular_product: boolean;
  created_at: string;
  updated_at: string;
  image_count: number;
  images?: CatalogProductImage[];
};

type CatalogListResponse<T> = { success: boolean; data: T[]; count: number };
type CatalogItemResponse<T> = { success: boolean; data: T };

export async function fetchCatalogCategories(token: string): Promise<CatalogCategory[]> {
  const res = await apiGet<CatalogListResponse<CatalogCategory>>("/api/categories", token);
  return res.data ?? [];
}

export async function createCatalogCategory(
  token: string,
  body: { category_name: string; image?: File | null }
): Promise<CatalogCategory> {
  const fd = new FormData();
  fd.append("category_name", body.category_name);
  if (body.image) fd.append("image", body.image);
  const res = await fetch(`${BACKEND_URL}/api/categories`, {
    method: "POST",
    headers: bearerAuth(token),
    body: fd
  });
  if (res.status === 401) sessionExpiredLogout();
  const json = (await res.json().catch(() => null)) as CatalogItemResponse<CatalogCategory> & { error?: string } | null;
  if (!res.ok || !json?.data) throw new Error(json?.error ?? "Category create failed");
  return json.data;
}

export async function updateCatalogCategory(
  token: string,
  id: string,
  body: { category_name: string; image?: File | null }
): Promise<CatalogCategory> {
  const fd = new FormData();
  fd.append("category_name", body.category_name);
  if (body.image) fd.append("image", body.image);
  const res = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: bearerAuth(token),
    body: fd
  });
  if (res.status === 401) sessionExpiredLogout();
  const json = (await res.json().catch(() => null)) as CatalogItemResponse<CatalogCategory> & { error?: string } | null;
  if (!res.ok || !json?.data) throw new Error(json?.error ?? "Category update failed");
  return json.data;
}

export async function deleteCatalogCategory(token: string, id: string): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/categories/${id}`, token);
}

export async function fetchCatalogSubcategories(
  token: string,
  categoryId?: string
): Promise<CatalogSubcategory[]> {
  const path = categoryId
    ? `/api/subcategories?category_id=${encodeURIComponent(categoryId)}`
    : "/api/subcategories";
  const res = await apiGet<CatalogListResponse<CatalogSubcategory>>(path, token);
  return res.data ?? [];
}

export async function createCatalogSubcategory(
  token: string,
  body: { subcategory_name: string; category_id: number; image?: File | null }
): Promise<CatalogSubcategory> {
  const fd = new FormData();
  fd.append("subcategory_name", body.subcategory_name);
  fd.append("category_id", String(body.category_id));
  if (body.image) fd.append("image", body.image);
  const res = await fetch(`${BACKEND_URL}/api/subcategories`, {
    method: "POST",
    headers: bearerAuth(token),
    body: fd
  });
  if (res.status === 401) sessionExpiredLogout();
  const json = (await res.json().catch(() => null)) as CatalogItemResponse<CatalogSubcategory> & { error?: string } | null;
  if (!res.ok || !json?.data) throw new Error(json?.error ?? "Subcategory create failed");
  return json.data;
}

export async function updateCatalogSubcategory(
  token: string,
  id: string,
  body: { subcategory_name: string; category_id: number; image?: File | null }
): Promise<CatalogSubcategory> {
  const fd = new FormData();
  fd.append("subcategory_name", body.subcategory_name);
  fd.append("category_id", String(body.category_id));
  if (body.image) fd.append("image", body.image);
  const res = await fetch(`${BACKEND_URL}/api/subcategories/${id}`, {
    method: "PUT",
    headers: bearerAuth(token),
    body: fd
  });
  if (res.status === 401) sessionExpiredLogout();
  const json = (await res.json().catch(() => null)) as CatalogItemResponse<CatalogSubcategory> & { error?: string } | null;
  if (!res.ok || !json?.data) throw new Error(json?.error ?? "Subcategory update failed");
  return json.data;
}

export async function deleteCatalogSubcategory(token: string, id: string): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/subcategories/${id}`, token);
}

export type CatalogProductCountByCategory = {
  category_name: string;
  product_count: number;
};

export type CatalogProductFlagBreakdown = {
  new_only: number;
  popular_only: number;
  both: number;
  standard: number;
};

export type CatalogDashboardSummary = {
  category_count: number;
  subcategory_count: number;
  product_count: number;
  products_by_category: CatalogProductCountByCategory[];
  product_flags: CatalogProductFlagBreakdown;
  new_products_preview: CatalogProduct[];
  popular_products_preview: CatalogProduct[];
};

export async function fetchCatalogDashboardSummary(token: string): Promise<CatalogDashboardSummary> {
  const res = await apiGet<{ success: boolean; data: CatalogDashboardSummary }>(
    "/api/catalog/summary",
    token
  );
  return res.data;
}

export type FetchProductsFilters = {
  categoryId?: string;
  subcategoryId?: string;
  isNewProduct?: boolean;
  isPopularProduct?: boolean;
  /** Use "null" to filter classification IS NULL */
  classification?: string;
  includeImages?: boolean;
};

export async function fetchCatalogProducts(
  token: string,
  filters?: FetchProductsFilters
): Promise<CatalogProduct[]> {
  const q = new URLSearchParams();
  if (filters?.subcategoryId) q.set("subcategory_id", filters.subcategoryId);
  else if (filters?.categoryId) q.set("category_id", filters.categoryId);
  if (filters?.isNewProduct === true) q.set("is_new_product", "true");
  if (filters?.isNewProduct === false) q.set("is_new_product", "false");
  if (filters?.isPopularProduct === true) q.set("is_popular_product", "true");
  if (filters?.isPopularProduct === false) q.set("is_popular_product", "false");
  if (filters?.classification === "null") q.set("classification", "null");
  else if (filters?.classification) q.set("classification", filters.classification);
  if (filters?.includeImages) q.set("include_images", "true");
  const qs = q.toString();
  const path = qs ? `/api/products?${qs}` : "/api/products";
  const res = await apiGet<CatalogListResponse<CatalogProduct>>(path, token);
  return res.data ?? [];
}

export async function fetchCatalogProduct(token: string, id: string): Promise<CatalogProduct> {
  const res = await apiGet<CatalogItemResponse<CatalogProduct>>(`/api/products/${id}`, token);
  return res.data;
}

export async function createCatalogProduct(
  token: string,
  body: {
    product_name: string;
    subcategory_id: number;
    description?: string | null;
    original_price?: number | null;
    offer_price?: number | null;
    classification?: string | null;
    is_new_product?: boolean;
    is_popular_product?: boolean;
  }
): Promise<CatalogProduct> {
  const res = await apiPost<CatalogItemResponse<CatalogProduct>>("/api/products", token, body);
  return res.data;
}

export async function updateCatalogProduct(
  token: string,
  id: string,
  body: Record<string, unknown>
): Promise<CatalogProduct> {
  const res = await apiPut<CatalogItemResponse<CatalogProduct>>(`/api/products/${id}`, token, body);
  return res.data;
}

export async function deleteCatalogProduct(token: string, id: string): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/products/${id}`, token);
}

export async function fetchCatalogProductImages(
  token: string,
  productId: string
): Promise<CatalogProductImage[]> {
  const res = await apiGet<CatalogListResponse<CatalogProductImage>>(
    `/api/products/${productId}/images`,
    token
  );
  return res.data ?? [];
}

export async function uploadCatalogProductImages(
  token: string,
  productId: string,
  files: File[]
): Promise<CatalogProductImage[]> {
  const fd = new FormData();
  for (const f of files) {
    fd.append("images", f);
  }
  const res = await fetch(`${BACKEND_URL}/api/products/${productId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });
  if (res.status === 401) {
    sessionExpiredLogout();
  }
  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: CatalogProductImage[];
    error?: string;
  } | null;
  if (!res.ok || !json?.data) {
    throw new Error(json?.error ?? "Image upload failed");
  }
  return json.data;
}

export async function deleteCatalogProductImage(
  token: string,
  productId: string,
  imageId: string
): Promise<void> {
  await apiDelete<{ success: boolean }>(`/api/products/${productId}/images/${imageId}`, token);
}
