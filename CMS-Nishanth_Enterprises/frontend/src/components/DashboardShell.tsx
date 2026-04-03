"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAuthSession,
  dbHealthCheck,
  fetchProfile,
  getStoredToken,
  type ProfileResponse
} from "@/lib/api";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/cms/home", label: "Home" },
  { href: "/dashboard/cms/products", label: "Products" },
  { href: "/dashboard/cms/about_us", label: "About Us" },
  { href: "/dashboard/cms/contact_us", label: "Contact Us" },
  { href: "/dashboard/cms/header_footer", label: "Header & Footer" },
  { href: "/dashboard/pages", label: "Pages" },
  { href: "/dashboard/settings", label: "Settings" }
];

const CMS_PATH_LABELS: Record<string, string> = {
  home: "Home",
  products: "Products",
  about_us: "About Us",
  contact_us: "Contact Us",
  header_footer: "Header & Footer"
};

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [ready, setReady] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [dashHealth, setDashHealth] = useState<"checking" | "ok" | "error">("checking");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("cms_theme");
    const initialTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const loadProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await fetchProfile(token);
      setProfile(data);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not load profile");
    } finally {
      setProfileLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!profileOpen) return;
    void loadProfile();
  }, [profileOpen, loadProfile]);

  useEffect(() => {
    if (!ready || pathname !== "/dashboard") return;
    const token = getStoredToken();
    if (!token) return;
    let cancelled = false;
    setDashHealth("checking");
    void (async () => {
      try {
        const h = await dbHealthCheck(token);
        if (cancelled) return;
        setDashHealth(h.status === "ok" ? "ok" : "error");
      } catch {
        if (!cancelled) setDashHealth("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const el = panelRef.current;
      if (el && !el.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [profileOpen]);

  function logout() {
    clearAuthSession();
    setProfileOpen(false);
    router.replace("/login");
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("cms_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  const cmsMatch = pathname?.match(/^\/dashboard\/cms\/([^/]+)$/);
  const currentSection = cmsMatch
    ? (CMS_PATH_LABELS[cmsMatch[1]] ?? cmsMatch[1])
    : (nav.find((item) => item.href === pathname)?.label ?? "Dashboard");

  if (!ready) {
    return (
      <div className="dashboardLoading">
        <div className="dashboardLoadingText">Loading…</div>
      </div>
    );
  }

  return (
    <div className="dashboardRoot">
      <aside className="dashboardSidebar" aria-label="Main navigation">
        <div className="dashboardBrand">Nishanth CMS</div>
        <nav className="dashboardNav">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dashboardNavLink${active ? " dashboardNavLinkActive" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="dashboardMain">
        <header className="dashboardTopbar">
          <div className="dashboardTopbarLead">
            <span className="dashboardTopbarTitle">{currentSection}</span>
            {pathname === "/dashboard" ? (
              <span
                className={`dashboardHealthDot${
                  dashHealth === "ok"
                    ? " dashboardHealthDotOk"
                    : dashHealth === "error"
                      ? " dashboardHealthDotBad"
                      : " dashboardHealthDotPending"
                }`}
                role="img"
                aria-label={
                  dashHealth === "ok"
                    ? "Healthy"
                    : dashHealth === "error"
                      ? "Unavailable"
                      : "Checking"
                }
              />
            ) : null}
          </div>
          <div className="dashboardTopbarActions" ref={panelRef}>
            <span className="loginThemeLabel">Theme</span>
            <button
              type="button"
              className={`themeToggle${theme === "light" ? " themeToggleOn" : ""}`}
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === "light"}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              <span className="themeToggleTrack">
                <span className="themeToggleThumb" />
              </span>
              <span className="themeToggleText">{theme === "light" ? "Light" : "Dark"}</span>
            </button>
            <button
              type="button"
              className="dashboardProfileBtn"
              onClick={() => setProfileOpen((o) => !o)}
              aria-expanded={profileOpen}
              aria-haspopup="dialog"
              aria-label="Profile and settings"
            >
              <ProfileIcon />
            </button>

            {profileOpen ? (
              <div className="dashboardProfilePanel" role="dialog" aria-label="Your profile">
                <div className="dashboardProfilePanelTitle">Profile</div>
                <p className="dashboardProfileHint">View only — details cannot be changed here.</p>

                {profileLoading ? (
                  <div className="dashboardProfileStatus">Loading profile…</div>
                ) : profileError ? (
                  <div className="dashboardProfileError">{profileError}</div>
                ) : profile ? (
                  <div className="dashboardProfileFields">
                    <div className="dashboardReadonlyField">
                      <span className="dashboardReadonlyLabel">Email</span>
                      <input className="dashboardReadonlyInput" readOnly value={profile.email} tabIndex={-1} />
                    </div>
                    <div className="dashboardReadonlyField">
                      <span className="dashboardReadonlyLabel">Username</span>
                      <input className="dashboardReadonlyInput" readOnly value={profile.username} tabIndex={-1} />
                    </div>
                    <div className="dashboardReadonlyField">
                      <span className="dashboardReadonlyLabel">Password</span>
                      <input
                        className="dashboardReadonlyInput"
                        readOnly
                        value={profile.passwordMasked}
                        tabIndex={-1}
                        aria-describedby="profile-password-note"
                      />
                      <p id="profile-password-note" className="dashboardPasswordNote">
                        {profile.passwordNote}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="dashboardProfileFooter">
                  <button type="button" className="dashboardBtnGhost" onClick={() => setProfileOpen(false)}>
                    Close
                  </button>
                  <button type="button" className="dashboardBtnDanger" onClick={logout}>
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <main className="dashboardContent">{children}</main>
      </div>
    </div>
  );
}
