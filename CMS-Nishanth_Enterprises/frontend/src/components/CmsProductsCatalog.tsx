"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCatalogCategory,
  createCatalogProduct,
  createCatalogSubcategory,
  deleteCatalogCategory,
  deleteCatalogProduct,
  deleteCatalogProductImage,
  deleteCatalogSubcategory,
  fetchCatalogCategories,
  fetchCatalogProduct,
  fetchCatalogProductImages,
  fetchCatalogProducts,
  fetchCatalogSubcategories,
  getStoredToken,
  resolveMediaUrl,
  updateCatalogCategory,
  updateCatalogProduct,
  updateCatalogSubcategory,
  uploadCatalogProductImages,
  type CatalogCategory,
  type CatalogProduct,
  type CatalogProductImage,
  type CatalogSubcategory
} from "@/lib/api";

const CLASSIFICATION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— None —" },
  { value: "inhouse", label: "Inhouse" },
  { value: "branded", label: "Branded" },
  { value: "hot", label: "Hot" },
  { value: "cold", label: "Cold" }
];

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
      <path
        d="M3 15l3.5-3.5a1.5 1.5 0 0 1 2.1 0L13 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="cmsIconSpinner" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatPrice(v: string | null): string {
  if (v === null || v === undefined || v === "") return "—";
  return v;
}

function formatProductDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function classificationLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return CLASSIFICATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const PRODUCTS_PER_PAGE = 5;

export default function CmsProductsCatalog() {
  const router = useRouter();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [filterSubcategoryId, setFilterSubcategoryId] = useState<string>("");
  const [productPage, setProductPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryModal, setCategoryModal] = useState<
    null | { mode: "create" } | { mode: "edit"; category: CatalogCategory }
  >(null);
  const [categoryNameDraft, setCategoryNameDraft] = useState("");
  const [categoryImageFileDraft, setCategoryImageFileDraft] = useState<File | null>(null);
  const categoryImageInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const [productModal, setProductModal] = useState<
    null | { mode: "create" } | { mode: "edit"; product: CatalogProduct }
  >(null);
  const [productDraft, setProductDraft] = useState({
    product_name: "",
    subcategory_id: "",
    description: "",
    original_price: "",
    offer_price: "",
    classification: "",
    is_new_product: false,
    is_popular_product: false
  });
  const [savingProduct, setSavingProduct] = useState(false);
  /** Files to upload after creating a product (create modal only). */
  const [productCreatePendingImages, setProductCreatePendingImages] = useState<File[]>([]);
  const productCreateImagesInputRef = useRef<HTMLInputElement | null>(null);

  const [subcategoryModal, setSubcategoryModal] = useState<
    null | { mode: "create" } | { mode: "edit"; subcategory: CatalogSubcategory }
  >(null);
  const [subcategoryNameDraft, setSubcategoryNameDraft] = useState("");
  const [subcategoryParentCategoryId, setSubcategoryParentCategoryId] = useState("");
  const [subcategoryImageFileDraft, setSubcategoryImageFileDraft] = useState<File | null>(null);
  const subcategoryImageInputRef = useRef<HTMLInputElement | null>(null);
  const [subcategoryModalError, setSubcategoryModalError] = useState<string | null>(null);
  const [savingSubcategory, setSavingSubcategory] = useState(false);

  const [imagesModalProduct, setImagesModalProduct] = useState<CatalogProduct | null>(null);
  const [imagesList, setImagesList] = useState<CatalogProductImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [viewProductDetail, setViewProductDetail] = useState<CatalogProduct | null>(null);
  const [viewProductImages, setViewProductImages] = useState<CatalogProductImage[]>([]);
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [viewProductImagesLoading, setViewProductImagesLoading] = useState(false);
  const [viewProductError, setViewProductError] = useState<string | null>(null);

  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [singleImagePreviewUrl, setSingleImagePreviewUrl] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const productFilters =
        filterSubcategoryId
          ? { subcategoryId: filterSubcategoryId }
          : filterCategoryId
            ? { categoryId: filterCategoryId }
            : undefined;
      const [cats, subs, prods] = await Promise.all([
        fetchCatalogCategories(token),
        fetchCatalogSubcategories(token),
        fetchCatalogProducts(token, productFilters)
      ]);
      setCategories(cats);
      setSubcategories(subs);
      setProducts(prods);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, [router, filterCategoryId, filterSubcategoryId]);

  useEffect(() => {
    if (!filterSubcategoryId) return;
    const s = subcategories.find((x) => x.id === filterSubcategoryId);
    if (filterCategoryId && s && s.category_id !== filterCategoryId) {
      setFilterSubcategoryId("");
    }
  }, [filterCategoryId, filterSubcategoryId, subcategories]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    setProductPage(1);
  }, [filterCategoryId, filterSubcategoryId]);

  const totalProductPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setProductPage((p) => Math.min(Math.max(1, p), totalProductPages));
  }, [totalProductPages]);

  const pagedProducts = useMemo(() => {
    const start = (productPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [products, productPage]);

  useEffect(() => {
    if (!imagesModalProduct) return;
    const token = getStoredToken();
    if (!token) return;
    setImagesLoading(true);
    void fetchCatalogProductImages(token, imagesModalProduct.id)
      .then(setImagesList)
      .catch(() => setImagesList([]))
      .finally(() => setImagesLoading(false));
  }, [imagesModalProduct]);

  useEffect(() => {
    if (!viewProductId) {
      setViewProductDetail(null);
      setViewProductImages([]);
      setViewProductError(null);
      return;
    }
    const token = getStoredToken();
    if (!token) return;
    setViewProductLoading(true);
    setViewProductImagesLoading(true);
    setViewProductError(null);
    void Promise.all([
      fetchCatalogProduct(token, viewProductId),
      fetchCatalogProductImages(token, viewProductId)
    ])
      .then(([prod, imgs]) => {
        setViewProductDetail(prod);
        setViewProductImages(imgs);
      })
      .catch((e) => {
        setViewProductError(e instanceof Error ? e.message : "Failed to load product");
        setViewProductDetail(null);
        setViewProductImages([]);
      })
      .finally(() => {
        setViewProductLoading(false);
        setViewProductImagesLoading(false);
      });
  }, [viewProductId]);

  function openCreateCategory() {
    setCategoryNameDraft("");
    setCategoryImageFileDraft(null);
    setCategoryModalError(null);
    setCategoryModal({ mode: "create" });
  }

  function openEditCategory(c: CatalogCategory) {
    setCategoryNameDraft(c.category_name);
    setCategoryImageFileDraft(null);
    setCategoryModalError(null);
    setCategoryModal({ mode: "edit", category: c });
  }

  async function saveCategoryModal() {
    const token = getStoredToken();
    if (!token) return;
    const name = categoryNameDraft.trim();
    if (!name) {
      setCategoryModalError("Category name is required");
      return;
    }
    setCategoryModalError(null);
    setSavingCategory(true);
    setError(null);
    try {
      if (categoryModal?.mode === "create") {
        await createCatalogCategory(token, {
          category_name: name,
          image: categoryImageFileDraft
        });
      } else if (categoryModal?.mode === "edit") {
        await updateCatalogCategory(token, categoryModal.category.id, {
          category_name: name,
          image: categoryImageFileDraft
        });
      }
      setCategoryModal(null);
      await refreshAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Category save failed";
      setCategoryModalError(msg);
      setError(msg);
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleDeleteCategory(c: CatalogCategory) {
    if (!confirm(`Delete category "${c.category_name}" and all its products and images?`)) return;
    const token = getStoredToken();
    if (!token) return;
    setDeletingCategoryId(c.id);
    setError(null);
    try {
      await deleteCatalogCategory(token, c.id);
      if (filterCategoryId === c.id) {
        setFilterCategoryId("");
        setFilterSubcategoryId("");
      }
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingCategoryId(null);
    }
  }

  function defaultSubcategoryIdForNewProduct(): string {
    if (filterSubcategoryId) return filterSubcategoryId;
    if (filterCategoryId) {
      const subs = subcategories.filter((s) => s.category_id === filterCategoryId);
      return subs[0]?.id ?? "";
    }
    return subcategories[0]?.id ?? "";
  }

  function openCreateSubcategory() {
    if (!categories.length) {
      setError("Create a category before adding subcategories.");
      return;
    }
    setSubcategoryNameDraft("");
    setSubcategoryParentCategoryId(filterCategoryId || categories[0].id);
    setSubcategoryImageFileDraft(null);
    setSubcategoryModalError(null);
    setSubcategoryModal({ mode: "create" });
  }

  function openEditSubcategory(s: CatalogSubcategory) {
    setSubcategoryNameDraft(s.subcategory_name);
    setSubcategoryParentCategoryId(s.category_id);
    setSubcategoryImageFileDraft(null);
    setSubcategoryModalError(null);
    setSubcategoryModal({ mode: "edit", subcategory: s });
  }

  async function saveSubcategoryModal() {
    const token = getStoredToken();
    if (!token) return;
    const name = subcategoryNameDraft.trim();
    if (!name) {
      setSubcategoryModalError("Subcategory name is required");
      return;
    }
    const cid = subcategoryParentCategoryId.trim();
    if (!cid) {
      setSubcategoryModalError("Parent category is required");
      return;
    }
    setSubcategoryModalError(null);
    setSavingSubcategory(true);
    setError(null);
    try {
      const body = {
        subcategory_name: name,
        category_id: Number.parseInt(cid, 10),
        image: subcategoryImageFileDraft
      };
      if (subcategoryModal?.mode === "create") {
        await createCatalogSubcategory(token, body);
      } else if (subcategoryModal?.mode === "edit") {
        await updateCatalogSubcategory(token, subcategoryModal.subcategory.id, body);
      }
      setSubcategoryModal(null);
      await refreshAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Subcategory save failed";
      setSubcategoryModalError(msg);
      setError(msg);
    } finally {
      setSavingSubcategory(false);
    }
  }

  async function handleDeleteSubcategory(s: CatalogSubcategory) {
    if (
      !confirm(
        `Delete subcategory "${s.subcategory_name}" and all its products and images?`
      )
    ) {
      return;
    }
    const token = getStoredToken();
    if (!token) return;
    setDeletingSubcategoryId(s.id);
    setError(null);
    try {
      await deleteCatalogSubcategory(token, s.id);
      if (filterSubcategoryId === s.id) setFilterSubcategoryId("");
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingSubcategoryId(null);
    }
  }

  function openCreateProduct() {
    if (!categories.length) {
      setError("Create at least one category before adding products.");
      return;
    }
    if (!subcategories.length) {
      setError("Create at least one subcategory before adding products.");
      return;
    }
    const sid = defaultSubcategoryIdForNewProduct();
    if (!sid) {
      setError("No subcategory matches the current filters. Choose “All” categories or add a subcategory.");
      return;
    }
    setProductDraft({
      product_name: "",
      subcategory_id: sid,
      description: "",
      original_price: "",
      offer_price: "",
      classification: "",
      is_new_product: false,
      is_popular_product: false
    });
    setProductCreatePendingImages([]);
    setProductModal({ mode: "create" });
  }

  function openEditProduct(p: CatalogProduct) {
    setProductCreatePendingImages([]);
    setProductDraft({
      product_name: p.product_name,
      subcategory_id: p.subcategory_id,
      description: p.description ?? "",
      original_price: p.original_price ?? "",
      offer_price: p.offer_price ?? "",
      classification: p.classification ?? "",
      is_new_product: p.is_new_product,
      is_popular_product: p.is_popular_product
    });
    setProductModal({ mode: "edit", product: p });
  }

  function closeProductModal() {
    setProductCreatePendingImages([]);
    setProductModal(null);
  }

  function onProductCreateImagesSelected(files: FileList | null, input: HTMLInputElement | null) {
    if (!files?.length) return;
    const next = Array.from(files);
    setProductCreatePendingImages((prev) => [...prev, ...next]);
    if (input) input.value = "";
  }

  function removeProductCreatePendingImage(index: number) {
    setProductCreatePendingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function parsePriceInput(s: string): number | null {
    const t = s.trim();
    if (!t) return null;
    const n = Number.parseFloat(t);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error("Prices must be non-negative numbers");
    }
    return Math.round(n * 100) / 100;
  }

  async function saveProductModal() {
    const token = getStoredToken();
    if (!token) return;
    const name = productDraft.product_name.trim();
    if (!name) {
      setError("Product name is required");
      return;
    }
    const sid = productDraft.subcategory_id.trim();
    if (!sid) {
      setError("Subcategory is required");
      return;
    }
    let original_price: number | null;
    let offer_price: number | null;
    try {
      original_price = parsePriceInput(productDraft.original_price);
      offer_price = parsePriceInput(productDraft.offer_price);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid price");
      return;
    }
    const classification = productDraft.classification.trim()
      ? productDraft.classification.trim().toLowerCase()
      : null;

    setSavingProduct(true);
    setError(null);
    const imagesToUpload = [...productCreatePendingImages];
    try {
      if (productModal?.mode === "create") {
        const created = await createCatalogProduct(token, {
          product_name: name,
          subcategory_id: Number.parseInt(sid, 10),
          description: productDraft.description.trim() || null,
          original_price,
          offer_price,
          classification,
          is_new_product: productDraft.is_new_product,
          is_popular_product: productDraft.is_popular_product
        });
        if (imagesToUpload.length > 0) {
          try {
            await uploadCatalogProductImages(token, created.id, imagesToUpload);
          } catch (uploadErr) {
            setError(
              uploadErr instanceof Error
                ? `Product saved, but image upload failed: ${uploadErr.message}`
                : "Product saved, but image upload failed."
            );
            closeProductModal();
            await refreshAll();
            return;
          }
        }
      } else if (productModal?.mode === "edit") {
        await updateCatalogProduct(token, productModal.product.id, {
          product_name: name,
          subcategory_id: Number.parseInt(sid, 10),
          description: productDraft.description.trim() || null,
          original_price,
          offer_price,
          classification,
          is_new_product: productDraft.is_new_product,
          is_popular_product: productDraft.is_popular_product
        });
      }
      closeProductModal();
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Product save failed");
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteProduct(p: CatalogProduct) {
    if (!confirm(`Delete product "${p.product_name}" and its images?`)) return;
    const token = getStoredToken();
    if (!token) return;
    setDeletingProductId(p.id);
    setError(null);
    try {
      await deleteCatalogProduct(token, p.id);
      if (imagesModalProduct?.id === p.id) setImagesModalProduct(null);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingProductId(null);
    }
  }

  async function onPickProductImages(files: FileList | null, input?: HTMLInputElement | null) {
    if (!files?.length || !imagesModalProduct) return;
    const token = getStoredToken();
    if (!token) return;
    setUploadingImages(true);
    setError(null);
    try {
      const arr = Array.from(files);
      await uploadCatalogProductImages(token, imagesModalProduct.id, arr);
      const next = await fetchCatalogProductImages(token, imagesModalProduct.id);
      setImagesList(next);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingImages(false);
      if (input) input.value = "";
    }
  }

  async function handleDeleteProductImage(img: CatalogProductImage) {
    if (!imagesModalProduct) return;
    if (!confirm("Remove this image from the product?")) return;
    const token = getStoredToken();
    if (!token) return;
    setDeletingImageId(img.id);
    setError(null);
    try {
      await deleteCatalogProductImage(token, imagesModalProduct.id, img.id);
      setImagesList((prev) => prev.filter((i) => i.id !== img.id));
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingImageId(null);
    }
  }

  async function openImagesModal(p: CatalogProduct) {
    const token = getStoredToken();
    if (!token) return;
    setError(null);
    try {
      const full = await fetchCatalogProduct(token, p.id);
      setImagesModalProduct(full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load product");
    }
  }

  return (
    <div className="cmsEditor cmsCatalogPage">
      <h1 className="dashboardWelcomeTitle">Products catalog</h1>
      <p className="dashboardWelcomeMeta">
        Hierarchy: <strong>category</strong> → <strong>subcategory</strong> → <strong>product</strong>. Images are
        stored under{" "}
        <code className="cmsCode">
          assets/&#123;category&#125;/&#123;subcategory&#125;/&#123;product&#125;/
        </code>
        .
      </p>

      {error ? <div className="pagesTableError">{error}</div> : null}

      <div className="cmsTableCard cmsCatalogSectionCard">
        <div className="cmsTableToolbar">
          <span className="cmsTableToolbarLabel">Categories</span>
          <div className="pagesTableActions">
            <button type="button" className="cmsBtnPrimarySm" onClick={openCreateCategory}>
              Add category
            </button>
          </div>
        </div>
        {loading && !categories.length ? (
          <p className="cmsEmptyHint">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="cmsEmptyHint">No categories yet. Add a category, then subcategories, then products.</p>
        ) : (
          <div className="cmsTableScroll">
            <table className="cmsCatalogTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th className="cmsCatalogDateCol">Created</th>
                  <th className="cmsCatalogDateCol">Updated</th>
                  <th className="cmsCatalogActionsCol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="cmsCatalogNameCell">{c.category_name}</td>
                    <td className="pagesTableMuted">
                      {c.image_url ? (
                        <button
                          type="button"
                          className="cmsSingleImagePreviewBtn"
                          onClick={() => setSingleImagePreviewUrl(resolveMediaUrl(c.image_url!))}
                          title="Click to enlarge"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- CMS media */}
                          <img
                            src={resolveMediaUrl(c.image_url!)}
                            alt={c.category_name}
                            className="cmsCatalogTableImageThumb"
                          />
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="pagesTableMuted cmsCatalogDateCell"
                      title={c.created_at ? String(c.created_at) : undefined}
                    >
                      {formatProductDate(c.created_at)}
                    </td>
                    <td
                      className="pagesTableMuted cmsCatalogDateCell"
                      title={c.updated_at ? String(c.updated_at) : undefined}
                    >
                      {formatProductDate(c.updated_at)}
                    </td>
                    <td className="cmsCatalogActionsCell">
                      <div className="cmsImgActionsRow">
                        <button
                          type="button"
                          className="pagesIconBtn pagesIconBtnEdit"
                          title="Edit"
                          aria-label={`Edit ${c.category_name}`}
                          onClick={() => openEditCategory(c)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="pagesIconBtn pagesIconBtnDelete"
                          title="Delete"
                          aria-label={`Delete ${c.category_name}`}
                          onClick={() => void handleDeleteCategory(c)}
                          disabled={deletingCategoryId === c.id}
                        >
                          {deletingCategoryId === c.id ? <SpinnerIcon /> : <TrashIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="cmsTableCard cmsCatalogSectionCard">
        <div className="cmsTableToolbar">
          <span className="cmsTableToolbarLabel">Subcategories</span>
          <div className="pagesTableActions">
            <button type="button" className="cmsBtnPrimarySm" onClick={openCreateSubcategory}>
              Add subcategory
            </button>
          </div>
        </div>
        {!categories.length ? (
          <p className="cmsEmptyHint">Add a category first.</p>
        ) : loading && !subcategories.length ? (
          <p className="cmsEmptyHint">Loading…</p>
        ) : subcategories.length === 0 ? (
          <p className="cmsEmptyHint">No subcategories yet. Add one under a category.</p>
        ) : (
          <div className="cmsTableScroll">
            <table className="cmsCatalogTable">
              <thead>
                <tr>
                  <th>Parent category</th>
                  <th>Subcategory</th>
                  <th>Image</th>
                  <th className="cmsCatalogDateCol">Created</th>
                  <th className="cmsCatalogDateCol">Updated</th>
                  <th className="cmsCatalogActionsCol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((s) => (
                  <tr key={s.id}>
                    <td className="pagesTableMuted">
                      {categories.find((c) => c.id === s.category_id)?.category_name ?? "—"}
                    </td>
                    <td className="cmsCatalogNameCell">{s.subcategory_name}</td>
                    <td className="pagesTableMuted">
                      {s.image_url ? (
                        <button
                          type="button"
                          className="cmsSingleImagePreviewBtn"
                          onClick={() => setSingleImagePreviewUrl(resolveMediaUrl(s.image_url!))}
                          title="Click to enlarge"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- CMS media */}
                          <img
                            src={resolveMediaUrl(s.image_url!)}
                            alt={s.subcategory_name}
                            className="cmsCatalogTableImageThumb"
                          />
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="pagesTableMuted cmsCatalogDateCell"
                      title={s.created_at ? String(s.created_at) : undefined}
                    >
                      {formatProductDate(s.created_at)}
                    </td>
                    <td
                      className="pagesTableMuted cmsCatalogDateCell"
                      title={s.updated_at ? String(s.updated_at) : undefined}
                    >
                      {formatProductDate(s.updated_at)}
                    </td>
                    <td className="cmsCatalogActionsCell">
                      <div className="cmsImgActionsRow">
                        <button
                          type="button"
                          className="pagesIconBtn pagesIconBtnEdit"
                          title="Edit"
                          aria-label={`Edit ${s.subcategory_name}`}
                          onClick={() => openEditSubcategory(s)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="pagesIconBtn pagesIconBtnDelete"
                          title="Delete"
                          aria-label={`Delete ${s.subcategory_name}`}
                          onClick={() => void handleDeleteSubcategory(s)}
                          disabled={deletingSubcategoryId === s.id}
                        >
                          {deletingSubcategoryId === s.id ? <SpinnerIcon /> : <TrashIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="cmsTableCard cmsCatalogSectionCard">
        <div className="cmsTableToolbar cmsCatalogProductsToolbar">
          <span className="cmsTableToolbarLabel">Products</span>
          <div className="cmsCatalogToolbarRight">
            <label className="cmsCatalogFilterLabel">
              Category
              <select
                className="cmsSelect"
                value={filterCategoryId}
                onChange={(e) => {
                  setFilterCategoryId(e.target.value);
                  setFilterSubcategoryId("");
                }}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="cmsCatalogFilterLabel">
              Subcategory
              <select
                className="cmsSelect"
                value={filterSubcategoryId}
                onChange={(e) => setFilterSubcategoryId(e.target.value)}
              >
                <option value="">All</option>
                {(filterCategoryId
                  ? subcategories.filter((s) => s.category_id === filterCategoryId)
                  : subcategories
                ).map((s) => (
                  <option key={s.id} value={s.id}>
                    {!filterCategoryId
                      ? `${categories.find((c) => c.id === s.category_id)?.category_name ?? "?"} › `
                      : ""}
                    {s.subcategory_name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="cmsBtnPrimarySm" onClick={openCreateProduct}>
              Add product
            </button>
          </div>
        </div>
        {loading && !products.length ? (
          <p className="cmsEmptyHint">Loading…</p>
        ) : products.length === 0 ? (
          <p className="cmsEmptyHint">
            No products in this filter. Add a product or adjust category / subcategory filters.
          </p>
        ) : (
          <>
            <div className="cmsTableScroll">
              <table className="cmsCatalogTable cmsProductsTableWide">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="cmsCatalogCountCol" title="Number of uploaded images">
                      Images
                    </th>
                    <th>Prices</th>
                    <th>Flags</th>
                    <th className="cmsCatalogDateCol">Updated</th>
                    <th className="cmsCatalogActionsCol">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map((p) => (
                    <tr key={p.id}>
                    <td>
                      <button
                        type="button"
                        className="cmsCatalogProductNameLink"
                        onClick={() => setViewProductId(p.id)}
                        title="View full details"
                      >
                        {p.product_name}
                      </button>
                    </td>
                    <td className="cmsCatalogCountCell">{p.image_count ?? 0}</td>
                    <td className="pagesTableMono cmsCatalogPrices">
                      <div>Orig: {formatPrice(p.original_price)}</div>
                      <div>Offer: {formatPrice(p.offer_price)}</div>
                    </td>
                    <td className="cmsCatalogFlags">
                      {p.is_new_product ? <span className="cmsCatalogBadge">New</span> : null}
                      {p.is_popular_product ? <span className="cmsCatalogBadge">Popular</span> : null}
                      {!p.is_new_product && !p.is_popular_product ? "—" : null}
                    </td>
                    <td
                      className="pagesTableMuted cmsCatalogDateCell"
                      title={p.updated_at ? String(p.updated_at) : undefined}
                    >
                      {formatProductDate(p.updated_at)}
                    </td>
                    <td className="cmsCatalogActionsCell">
                      <div className="cmsImgActionsRow">
                        <button
                          type="button"
                          className="pagesIconBtn pagesIconBtnEdit"
                          title="Edit product"
                          aria-label={`Edit ${p.product_name}`}
                          onClick={() => openEditProduct(p)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="pagesIconBtn"
                          title="Images"
                          aria-label={`Images for ${p.product_name}`}
                          onClick={() => void openImagesModal(p)}
                        >
                          <ImageIcon />
                        </button>
                        <button
                          type="button"
                          className="pagesIconBtn pagesIconBtnDelete"
                          title="Delete"
                          aria-label={`Delete ${p.product_name}`}
                          onClick={() => void handleDeleteProduct(p)}
                          disabled={deletingProductId === p.id}
                        >
                          {deletingProductId === p.id ? <SpinnerIcon /> : <TrashIcon />}
                        </button>
                      </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cmsCatalogPagination" role="navigation" aria-label="Product list pages">
              <p className="cmsCatalogPaginationMeta">
                Showing{" "}
                <strong>
                  {products.length === 0
                    ? 0
                    : (productPage - 1) * PRODUCTS_PER_PAGE + 1}
                  –
                  {Math.min(productPage * PRODUCTS_PER_PAGE, products.length)}
                </strong>{" "}
                of <strong>{products.length}</strong>
                {totalProductPages > 1 ? (
                  <span className="cmsCatalogPaginationPageLabel">
                    {" "}
                    · Page {productPage} of {totalProductPages}
                  </span>
                ) : null}
              </p>
              <div className="cmsCatalogPaginationControls">
                <button
                  type="button"
                  className="cmsCatalogPaginationBtn"
                  disabled={productPage <= 1}
                  onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="cmsCatalogPaginationBtn"
                  disabled={productPage >= totalProductPages}
                  onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {subcategoryModal ? (
        <div
          className="pagesModalBackdrop"
          role="presentation"
          onMouseDown={() => setSubcategoryModal(null)}
        >
          <div
            className="pagesModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-subcat-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-subcat-title" className="pagesModalTitle">
              {subcategoryModal.mode === "create" ? "New subcategory" : "Edit subcategory"}
            </h2>
            {subcategoryModalError ? <div className="pagesTableError">{subcategoryModalError}</div> : null}
            <label className="pagesModalLabel" htmlFor="cms-subcat-parent">
              Parent category
            </label>
            <select
              id="cms-subcat-parent"
              className="cmsSelect cmsCatalogModalField"
              value={subcategoryParentCategoryId}
              onChange={(e) => setSubcategoryParentCategoryId(e.target.value)}
              disabled={savingSubcategory}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
            <label className="pagesModalLabel" htmlFor="cms-subcat-name">
              Subcategory name
            </label>
            <input
              id="cms-subcat-name"
              className="pagesModalInput"
              value={subcategoryNameDraft}
              onChange={(e) => setSubcategoryNameDraft(e.target.value)}
              disabled={savingSubcategory}
            />
            <label className="pagesModalLabel" htmlFor="cms-subcat-image">
              Subcategory image
            </label>
            <div className="cmsFileUploadRow">
              <input
                ref={subcategoryImageInputRef}
                id="cms-subcat-image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="cmsHiddenFile"
                onChange={(e) => setSubcategoryImageFileDraft(e.target.files?.[0] ?? null)}
                disabled={savingSubcategory}
              />
              <button
                type="button"
                className="cmsFilePickBtn"
                onClick={() => subcategoryImageInputRef.current?.click()}
                disabled={savingSubcategory}
              >
                Choose image
              </button>
              <span className="cmsFileNameText" title={subcategoryImageFileDraft?.name ?? "No file selected"}>
                {subcategoryImageFileDraft?.name ?? "No file selected"}
              </span>
            </div>
            {subcategoryModal.mode === "edit" && subcategoryModal.subcategory.image_url ? (
              <div className="cmsSingleImagePreviewWrap">
                <p className="cmsMeta">Current image</p>
                <button
                  type="button"
                  className="cmsSingleImagePreviewBtn"
                  onClick={() => setSingleImagePreviewUrl(resolveMediaUrl(subcategoryModal.subcategory.image_url!))}
                  title="Click to enlarge"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS media */}
                  <img
                    src={resolveMediaUrl(subcategoryModal.subcategory.image_url)}
                    alt="Current subcategory"
                    className="cmsSingleImagePreviewThumb"
                  />
                </button>
              </div>
            ) : null}
            <div className="pagesModalFooter">
              <button
                type="button"
                className="dashboardBtnGhost"
                onClick={() => setSubcategoryModal(null)}
                disabled={savingSubcategory}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pagesModalSave"
                onClick={() => void saveSubcategoryModal()}
                disabled={savingSubcategory}
              >
                {savingSubcategory ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {categoryModal ? (
        <div className="pagesModalBackdrop" role="presentation" onMouseDown={() => setCategoryModal(null)}>
          <div
            className="pagesModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-cat-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-cat-title" className="pagesModalTitle">
              {categoryModal.mode === "create" ? "New category" : "Edit category"}
            </h2>
            {categoryModalError ? <div className="pagesTableError">{categoryModalError}</div> : null}
            <label className="pagesModalLabel" htmlFor="cms-cat-name">
              Category name
            </label>
            <input
              id="cms-cat-name"
              className="pagesModalInput"
              value={categoryNameDraft}
              onChange={(e) => setCategoryNameDraft(e.target.value)}
              disabled={savingCategory}
            />
            <label className="pagesModalLabel" htmlFor="cms-cat-image">
              Category image
            </label>
            <div className="cmsFileUploadRow">
              <input
                ref={categoryImageInputRef}
                id="cms-cat-image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="cmsHiddenFile"
                onChange={(e) => setCategoryImageFileDraft(e.target.files?.[0] ?? null)}
                disabled={savingCategory}
              />
              <button
                type="button"
                className="cmsFilePickBtn"
                onClick={() => categoryImageInputRef.current?.click()}
                disabled={savingCategory}
              >
                Choose image
              </button>
              <span className="cmsFileNameText" title={categoryImageFileDraft?.name ?? "No file selected"}>
                {categoryImageFileDraft?.name ?? "No file selected"}
              </span>
            </div>
            {categoryModal.mode === "edit" && categoryModal.category.image_url ? (
              <div className="cmsSingleImagePreviewWrap">
                <p className="cmsMeta">Current image</p>
                <button
                  type="button"
                  className="cmsSingleImagePreviewBtn"
                  onClick={() => setSingleImagePreviewUrl(resolveMediaUrl(categoryModal.category.image_url!))}
                  title="Click to enlarge"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS media */}
                  <img
                    src={resolveMediaUrl(categoryModal.category.image_url)}
                    alt="Current category"
                    className="cmsSingleImagePreviewThumb"
                  />
                </button>
              </div>
            ) : null}
            <div className="pagesModalFooter">
              <button
                type="button"
                className="dashboardBtnGhost"
                onClick={() => setCategoryModal(null)}
                disabled={savingCategory}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pagesModalSave"
                onClick={() => void saveCategoryModal()}
                disabled={savingCategory}
              >
                {savingCategory ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewProductId ? (
        <div
          className="pagesModalBackdrop"
          role="presentation"
          onMouseDown={() => setViewProductId(null)}
        >
          <div
            className="pagesModal cmsCatalogProductViewModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-prod-view-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-prod-view-title" className="pagesModalTitle">
              {viewProductLoading ? "Loading…" : viewProductDetail?.product_name ?? "Product"}
            </h2>
            {viewProductLoading ? (
              <p className="cmsEmptyHint">Loading product…</p>
            ) : viewProductError ? (
              <div className="pagesTableError">{viewProductError}</div>
            ) : viewProductDetail ? (
              <div className="cmsProductViewBody">
                <div className="cmsProductViewGrid">
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">ID</div>
                    <div className="cmsProductViewValue pagesTableMono">{viewProductDetail.id}</div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Category</div>
                    <div className="cmsProductViewValue">{viewProductDetail.category_name ?? "—"}</div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Subcategory</div>
                    <div className="cmsProductViewValue">{viewProductDetail.subcategory_name ?? "—"}</div>
                  </div>
                  <div className="cmsProductViewField cmsProductViewFieldFull">
                    <div className="cmsProductViewLabel">Description</div>
                    <div className="cmsProductViewValue cmsProductViewDescription">
                      {viewProductDetail.description?.trim()
                        ? viewProductDetail.description
                        : "—"}
                    </div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Original price</div>
                    <div className="cmsProductViewValue pagesTableMono">
                      {formatPrice(viewProductDetail.original_price)}
                    </div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Offer price</div>
                    <div className="cmsProductViewValue pagesTableMono">
                      {formatPrice(viewProductDetail.offer_price)}
                    </div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Classification</div>
                    <div className="cmsProductViewValue">
                      {classificationLabel(viewProductDetail.classification)}
                    </div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Flags</div>
                    <div className="cmsProductViewValue cmsCatalogFlags">
                      {viewProductDetail.is_new_product ? (
                        <span className="cmsCatalogBadge">New</span>
                      ) : null}
                      {viewProductDetail.is_popular_product ? (
                        <span className="cmsCatalogBadge">Popular</span>
                      ) : null}
                      {!viewProductDetail.is_new_product && !viewProductDetail.is_popular_product
                        ? "—"
                        : null}
                    </div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Created</div>
                    <div className="cmsProductViewValue cmsProductViewDate">
                      {formatProductDate(viewProductDetail.created_at)}
                    </div>
                  </div>
                  <div className="cmsProductViewField">
                    <div className="cmsProductViewLabel">Updated</div>
                    <div className="cmsProductViewValue cmsProductViewDate">
                      {formatProductDate(viewProductDetail.updated_at)}
                    </div>
                  </div>
                </div>
                <h3 className="cmsProductViewImagesTitle">Images</h3>
                {viewProductImagesLoading ? (
                  <p className="cmsEmptyHint">Loading images…</p>
                ) : viewProductImages.length === 0 ? (
                  <p className="cmsEmptyHint">No images for this product.</p>
                ) : (
                  <ul className="cmsProductViewImageList">
                    {viewProductImages.map((img) => (
                      <li key={img.id} className="cmsProductViewImageItem">
                        <a
                          href={resolveMediaUrl(img.image_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cmsProductViewImageLink"
                          title="Open full size"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- CMS URL */}
                          <img
                            src={resolveMediaUrl(img.image_url)}
                            alt=""
                            className="cmsProductViewImageThumb"
                            loading="lazy"
                          />
                        </a>
                        <code className="cmsProductViewImagePath">{img.image_url}</code>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            <div className="pagesModalFooter">
              <button
                type="button"
                className="dashboardBtnGhost"
                onClick={() => setViewProductId(null)}
              >
                Close
              </button>
              {viewProductDetail ? (
                <button
                  type="button"
                  className="pagesModalSave"
                  onClick={() => {
                    const d = viewProductDetail;
                    setViewProductId(null);
                    openEditProduct(d);
                  }}
                >
                  Edit product
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {productModal ? (
        <div className="pagesModalBackdrop" role="presentation" onMouseDown={closeProductModal}>
          <div
            className="pagesModal cmsCatalogProductModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-prod-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-prod-title" className="pagesModalTitle">
              {productModal.mode === "create" ? "New product" : "Edit product"}
            </h2>
            <div className="cmsCatalogFormGrid">
              <label className="cmsLabel">
                Name
                <input
                  className="cmsInput"
                  value={productDraft.product_name}
                  onChange={(e) => setProductDraft((d) => ({ ...d, product_name: e.target.value }))}
                  disabled={savingProduct}
                />
              </label>
              <label className="cmsLabel cmsCatalogFullRow">
                Subcategory
                <select
                  className="cmsSelect"
                  value={productDraft.subcategory_id}
                  onChange={(e) => setProductDraft((d) => ({ ...d, subcategory_id: e.target.value }))}
                  disabled={savingProduct}
                >
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {categories.find((c) => c.id === s.category_id)?.category_name ?? "?"} ›{" "}
                      {s.subcategory_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cmsLabel cmsCatalogFullRow">
                Description
                <textarea
                  className="cmsTextarea"
                  rows={3}
                  value={productDraft.description}
                  onChange={(e) => setProductDraft((d) => ({ ...d, description: e.target.value }))}
                  disabled={savingProduct}
                />
              </label>
              <label className="cmsLabel">
                Original price
                <input
                  className="cmsInput"
                  inputMode="decimal"
                  placeholder="e.g. 99.99"
                  value={productDraft.original_price}
                  onChange={(e) => setProductDraft((d) => ({ ...d, original_price: e.target.value }))}
                  disabled={savingProduct}
                />
              </label>
              <label className="cmsLabel">
                Offer price
                <input
                  className="cmsInput"
                  inputMode="decimal"
                  placeholder="e.g. 79.99"
                  value={productDraft.offer_price}
                  onChange={(e) => setProductDraft((d) => ({ ...d, offer_price: e.target.value }))}
                  disabled={savingProduct}
                />
              </label>
              <label className="cmsLabel">
                Classification
                <select
                  className="cmsSelect"
                  value={productDraft.classification}
                  onChange={(e) => setProductDraft((d) => ({ ...d, classification: e.target.value }))}
                  disabled={savingProduct}
                >
                  {CLASSIFICATION_OPTIONS.map((o) => (
                    <option key={o.value || "none"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cmsLabel cmsCatalogCheckboxRow">
                <input
                  type="checkbox"
                  checked={productDraft.is_new_product}
                  onChange={(e) => setProductDraft((d) => ({ ...d, is_new_product: e.target.checked }))}
                  disabled={savingProduct}
                />
                New product
              </label>
              <label className="cmsLabel cmsCatalogCheckboxRow">
                <input
                  type="checkbox"
                  checked={productDraft.is_popular_product}
                  onChange={(e) => setProductDraft((d) => ({ ...d, is_popular_product: e.target.checked }))}
                  disabled={savingProduct}
                />
                Popular product
              </label>
              {productModal.mode === "create" ? (
                <div className="cmsCatalogFullRow cmsProductCreateImages">
                  <p className="cmsMeta">
                    Images (optional) — JPG / PNG, multiple files. They upload right after the product is created.
                  </p>
                  <div className="cmsImgActionsRow cmsProductCreateImagesActions">
                    <input
                      ref={productCreateImagesInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      className="cmsHiddenFile"
                      disabled={savingProduct}
                      onChange={(e) => onProductCreateImagesSelected(e.target.files, e.target)}
                    />
                    <button
                      type="button"
                      className="cmsBtnGhostSm"
                      disabled={savingProduct}
                      onClick={() => productCreateImagesInputRef.current?.click()}
                    >
                      Add images
                    </button>
                  </div>
                  {productCreatePendingImages.length > 0 ? (
                    <ul className="cmsProductCreateImageList">
                      {productCreatePendingImages.map((f, i) => (
                        <li key={`${i}-${f.name}-${f.size}`} className="cmsProductCreateImageRow">
                          <span className="cmsProductCreateImageName">{f.name}</span>
                          <button
                            type="button"
                            className="cmsBtnDangerSm"
                            disabled={savingProduct}
                            onClick={() => removeProductCreatePendingImage(i)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="pagesModalFooter">
              <button
                type="button"
                className="dashboardBtnGhost"
                onClick={closeProductModal}
                disabled={savingProduct}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pagesModalSave"
                onClick={() => void saveProductModal()}
                disabled={savingProduct}
              >
                {savingProduct
                  ? "Saving…"
                  : productModal.mode === "create" && productCreatePendingImages.length > 0
                    ? "Save & upload"
                    : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {imagesModalProduct ? (
        <div
          className="pagesModalBackdrop"
          role="presentation"
          onMouseDown={() => setImagesModalProduct(null)}
        >
          <div
            className="pagesModal cmsCatalogImagesModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-img-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-img-title" className="pagesModalTitle">
              Images — {imagesModalProduct.product_name}
            </h2>
            <p className="cmsMeta">JPG / PNG, max 1 MB each. Multiple files allowed.</p>
            <label className="cmsBtnPrimarySm cmsCatalogUploadBtn">
              <span>{uploadingImages ? "Uploading…" : "Upload images"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                className="cmsCatalogFileInputOverlay"
                disabled={uploadingImages}
                onChange={(e) => void onPickProductImages(e.target.files, e.target)}
              />
            </label>
            {imagesLoading ? (
              <p className="cmsEmptyHint">Loading images…</p>
            ) : imagesList.length === 0 ? (
              <p className="cmsEmptyHint">No images yet.</p>
            ) : (
              <ul className="cmsCatalogImageGrid">
                {imagesList.map((img) => (
                  <li key={img.id} className="cmsCatalogImageTile">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS URL */}
                    <img src={resolveMediaUrl(img.image_url)} alt="" className="cmsCatalogImageThumb" />
                    <code className="cmsCatalogImagePath">{img.image_url}</code>
                    <button
                      type="button"
                      className="pagesIconBtn pagesIconBtnDelete cmsCatalogImageDelete"
                      title="Remove"
                      aria-label="Remove image"
                      onClick={() => void handleDeleteProductImage(img)}
                      disabled={deletingImageId === img.id}
                    >
                      {deletingImageId === img.id ? <SpinnerIcon /> : <TrashIcon />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="pagesModalFooter">
              <button type="button" className="pagesModalSave" onClick={() => setImagesModalProduct(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {singleImagePreviewUrl ? (
        <div
          className="cmsImageLightboxBackdrop"
          role="presentation"
          onMouseDown={() => setSingleImagePreviewUrl(null)}
        >
          <div className="cmsImageLightbox" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cmsImageLightboxClose"
              aria-label="Close image preview"
              onClick={() => setSingleImagePreviewUrl(null)}
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS media */}
            <img src={singleImagePreviewUrl} alt="Preview" className="cmsImageLightboxImg" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
