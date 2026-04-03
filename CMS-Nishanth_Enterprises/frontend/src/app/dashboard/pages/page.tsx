"use client";

import React, { useCallback, useEffect, useState } from "react";
import { fetchPages, getStoredToken, type CmsPage } from "@/lib/api";
import { useRouter } from "next/navigation";

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DashboardPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPages(token);
      setPages(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pages");
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="pagesTableWrap">
      <h1 className="dashboardWelcomeTitle">Pages</h1>
      <p className="dashboardWelcomeMeta">List of CMS pages registered (read-only).</p>

      {error ? <div className="pagesTableError">{error}</div> : null}

      <div className="pagesTableCard">
        {loading ? (
          <div className="pagesTableLoading">Loading pages…</div>
        ) : pages.length === 0 ? (
          <div className="pagesTableEmpty">No pages yet. Create pages via the API or database.</div>
        ) : (
          <div className="pagesTableScroll">
            <table className="pagesTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Page name</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((row) => (
                  <tr key={row.id}>
                    <td className="pagesTableMono">{row.id}</td>
                    <td>{row.page_name}</td>
                    <td className="pagesTableMuted">{formatDt(row.created_at)}</td>
                    <td className="pagesTableMuted">{formatDt(row.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
