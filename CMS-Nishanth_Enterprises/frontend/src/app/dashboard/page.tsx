"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import {
  fetchCatalogDashboardSummary,
  fetchCatalogProducts,
  getStoredToken,
  type CatalogProduct,
  type CatalogDashboardSummary
} from "@/lib/api";

function formatPrice(v: string | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return v;
}

function formatWhen(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [catalog, setCatalog] = useState<CatalogDashboardSummary | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [listModal, setListModal] = useState<null | "new" | "popular">(null);
  const [listModalLoading, setListModalLoading] = useState(false);
  const [listModalItems, setListModalItems] = useState<CatalogProduct[]>([]);
  const [listModalError, setListModalError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setCatalogLoading(false);
      return;
    }
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data = await fetchCatalogDashboardSummary(token);
      setCatalog(data);
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : "Could not load catalog stats");
      setCatalog(null);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function openFullList(kind: "new" | "popular") {
    const token = getStoredToken();
    if (!token) return;
    setListModal(kind);
    setListModalLoading(true);
    setListModalError(null);
    setListModalItems([]);
    try {
      const data = await fetchCatalogProducts(token, {
        isNewProduct: kind === "new" ? true : undefined,
        isPopularProduct: kind === "popular" ? true : undefined
      });
      setListModalItems(data);
    } catch (e) {
      setListModalError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setListModalLoading(false);
    }
  }

  function closeListModal() {
    setListModal(null);
    setListModalItems([]);
    setListModalError(null);
  }

  function renderProductMiniRow(p: CatalogProduct) {
    return (
      <div key={p.id} className="dashboardPreviewRow">
        <span className="dashboardPreviewName">{p.product_name}</span>
        <span className="dashboardPreviewMeta">
          {p.category_name ?? "—"} › {p.subcategory_name ?? "—"}
        </span>
        <span className="dashboardPreviewMeta">
          {formatPrice(p.offer_price ?? p.original_price)}
        </span>
      </div>
    );
  }

  return (
    <div className="dashboardWelcome dashboardPage">
      <h2 className="dashboardSectionTitle">Catalog insights</h2>
      <p className="dashboardSectionMeta">
        Edit listings in{" "}
        <Link href="/dashboard/cms/products" className="dashboardInlineLink">
          Products
        </Link>
        .
      </p>

      {catalogError ? <div className="pagesTableError">{catalogError}</div> : null}

      {catalogLoading ? (
        <p className="dashboardSectionMeta">Loading catalog analytics…</p>
      ) : catalog ? (
        <div className="dashboardInsightsShell">
          <div className="dashboardInsightsMain">
            <DashboardAnalytics catalog={catalog} />
          </div>
          <aside className="dashboardInsightsAside" aria-label="Product highlights">
            <div className="dashboardAsideHeader">
              <h3 className="dashboardAsideTitle">Highlights</h3>
              <p className="dashboardAsideMeta">
                Up to five per list — <strong>View all</strong> opens the full table.
              </p>
            </div>
            <div className="dashboardAsideStack">
              <section className="dashboardPreviewPanel dashboardPreviewPanelAside">
                <div className="dashboardPreviewHeader">
                  <h3 className="dashboardPreviewTitle">New products</h3>
                  <button
                    type="button"
                    className="dashboardTextLink"
                    onClick={() => void openFullList("new")}
                  >
                    View all
                  </button>
                </div>
                {catalog.new_products_preview.length === 0 ? (
                  <p className="dashboardPreviewEmpty">No products marked as new.</p>
                ) : (
                  <div className="dashboardPreviewList dashboardPreviewListAside">
                    {catalog.new_products_preview.map(renderProductMiniRow)}
                  </div>
                )}
              </section>

              <section className="dashboardPreviewPanel dashboardPreviewPanelAside">
                <div className="dashboardPreviewHeader">
                  <h3 className="dashboardPreviewTitle">Popular products</h3>
                  <button
                    type="button"
                    className="dashboardTextLink"
                    onClick={() => void openFullList("popular")}
                  >
                    View all
                  </button>
                </div>
                {catalog.popular_products_preview.length === 0 ? (
                  <p className="dashboardPreviewEmpty">No products marked as popular.</p>
                ) : (
                  <div className="dashboardPreviewList dashboardPreviewListAside">
                    {catalog.popular_products_preview.map(renderProductMiniRow)}
                  </div>
                )}
              </section>
            </div>
          </aside>
        </div>
      ) : null}

      {listModal ? (
        <div className="pagesModalBackdrop" role="presentation" onMouseDown={closeListModal}>
          <div
            className="pagesModal dashboardProductListModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-prod-list-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="dash-prod-list-title" className="pagesModalTitle">
              {listModal === "new" ? "All new products" : "All popular products"}
            </h2>
            {listModalLoading ? (
              <p className="dashboardPreviewEmpty">Loading…</p>
            ) : listModalError ? (
              <p className="pagesTableError">{listModalError}</p>
            ) : listModalItems.length === 0 ? (
              <p className="dashboardPreviewEmpty">No products in this list.</p>
            ) : (
              <div className="dashboardModalTableScroll">
                <table className="dashboardModalTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Orig</th>
                      <th>Offer</th>
                      <th>Type</th>
                      <th>Img</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listModalItems.map((p) => (
                      <tr key={p.id}>
                        <td className="pagesTableMono">{p.id}</td>
                        <td>{p.product_name}</td>
                        <td className="pagesTableMuted">{p.category_name ?? "—"}</td>
                        <td className="pagesTableMuted">{p.subcategory_name ?? "—"}</td>
                        <td className="pagesTableMono">{formatPrice(p.original_price)}</td>
                        <td className="pagesTableMono">{formatPrice(p.offer_price)}</td>
                        <td>{p.classification ?? "—"}</td>
                        <td className="dashboardModalTableCenter">{p.image_count ?? 0}</td>
                        <td className="pagesTableMuted dashboardModalTableNowrap">
                          {formatWhen(p.updated_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagesModalFooter">
              <button type="button" className="pagesModalSave" onClick={closeListModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
