"use client";

import React from "react";
import { useParams } from "next/navigation";

const SECTION_TITLES: Record<string, string> = {
  products: "Products",
  "about-us": "About Us",
  "contact-us": "Contact Us",
  settings: "Settings",
  "header-footer": "Header & Footer"
};

export default function DashboardSectionPage() {
  const params = useParams<{ section?: string }>();
  const section = params?.section ?? "";
  const sectionTitle = SECTION_TITLES[section] ?? "Section";

  return (
    <div className="dashboardWelcome">
      <h1 className="dashboardWelcomeTitle">{sectionTitle}</h1>
      <p className="dashboardWelcomeMeta">Now you&apos;re in {sectionTitle} menu.</p>
    </div>
  );
}
