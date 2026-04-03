"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { CatalogDashboardSummary } from "@/lib/api";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--cardBorder)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 12,
  padding: "8px 12px"
};

const AXIS_TICK = { fill: "var(--chart-axis)", fontSize: 11 };

function KpiIconCategories() {
  return (
    <svg className="dashboardKpiIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z"
        fill="currentColor"
        opacity={0.85}
      />
    </svg>
  );
}

function KpiIconSubcategories() {
  return (
    <svg className="dashboardKpiIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
        fill="currentColor"
        opacity={0.85}
      />
    </svg>
  );
}

function KpiIconProducts() {
  return (
    <svg className="dashboardKpiIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h10l1 3v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9l1-3zm2 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

type Props = {
  catalog: CatalogDashboardSummary;
};

export default function DashboardAnalytics({ catalog }: Props) {
  const byCategory = useMemo(
    () =>
      catalog.products_by_category.map((r) => ({
        name:
          r.category_name.length > 16 ? `${r.category_name.slice(0, 14)}…` : r.category_name,
        fullName: r.category_name,
        products: r.product_count
      })),
    [catalog.products_by_category]
  );

  const structureData = useMemo(
    () => [
      { name: "Categories", value: catalog.category_count },
      { name: "Subcategories", value: catalog.subcategory_count },
      { name: "Products", value: catalog.product_count }
    ],
    [catalog.category_count, catalog.subcategory_count, catalog.product_count]
  );

  const spotlightData = useMemo(() => {
    const f = catalog.product_flags;
    return [
      { name: "New only", value: f.new_only },
      { name: "Popular only", value: f.popular_only },
      { name: "New & popular", value: f.both },
      { name: "Standard listing", value: f.standard }
    ].filter((d) => d.value > 0);
  }, [catalog.product_flags]);

  const hasCategories = byCategory.length > 0;
  const hasSpotlight = spotlightData.length > 0;

  return (
    <div className="dashboardAnalytics">
      <div className="dashboardKpiDeck">
        <div className="dashboardKpiTile dashboardKpiTileA">
          <div className="dashboardKpiTileTop">
            <KpiIconCategories />
            <span className="dashboardKpiLabel">Categories</span>
          </div>
          <div className="dashboardKpiValue">{catalog.category_count}</div>
          <p className="dashboardKpiHint">Top-level catalog groups</p>
        </div>
        <div className="dashboardKpiTile dashboardKpiTileB">
          <div className="dashboardKpiTileTop">
            <KpiIconSubcategories />
            <span className="dashboardKpiLabel">Subcategories</span>
          </div>
          <div className="dashboardKpiValue">{catalog.subcategory_count}</div>
          <p className="dashboardKpiHint">Nested under categories</p>
        </div>
        <div className="dashboardKpiTile dashboardKpiTileC">
          <div className="dashboardKpiTileTop">
            <KpiIconProducts />
            <span className="dashboardKpiLabel">Products</span>
          </div>
          <div className="dashboardKpiValue">{catalog.product_count}</div>
          <p className="dashboardKpiHint">
            <Link href="/dashboard/cms/products" className="dashboardKpiLink">
              Manage catalog →
            </Link>
          </p>
        </div>
      </div>

      <div className="dashboardChartsGrid">
        <section className="dashboardChartCard">
          <div className="dashboardChartCardHead">
            <h3 className="dashboardChartTitle">Products by category</h3>
            <p className="dashboardChartSubtitle">Inventory distribution across your categories</p>
          </div>
          <div className="dashboardChartBody">
            {!hasCategories ? (
              <p className="dashboardChartEmpty">Add categories to see this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={AXIS_TICK}
                    interval={0}
                    angle={-26}
                    textAnchor="end"
                    height={72}
                  />
                  <YAxis tick={AXIS_TICK} allowDecimals={false} width={36} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [value ?? "—", "Products"]}
                    labelFormatter={(label, payload) => {
                      const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                      return row?.fullName ?? String(label ?? "");
                    }}
                  />
                  <Bar dataKey="products" name="Products" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="dashboardChartCard">
          <div className="dashboardChartCardHead">
            <h3 className="dashboardChartTitle">Product spotlight</h3>
            <p className="dashboardChartSubtitle">How products are tagged as new or popular</p>
          </div>
          <div className="dashboardChartBody dashboardChartBodyPie">
            {!hasSpotlight ? (
              <p className="dashboardChartEmpty">No products yet — add items to populate this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={spotlightData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {spotlightData.map((_, i) => (
                      <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => <span style={{ color: "var(--text)" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="dashboardChartCard dashboardChartCardWide">
          <div className="dashboardChartCardHead">
            <h3 className="dashboardChartTitle">Catalog scale</h3>
            <p className="dashboardChartSubtitle">Relative size of each layer in your catalog</p>
          </div>
          <div className="dashboardChartBody">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                layout="vertical"
                data={structureData}
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} width={100} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {structureData.map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
