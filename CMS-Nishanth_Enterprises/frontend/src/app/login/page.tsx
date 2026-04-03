"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/LoginCard";
import { login, publicHealth, setAuthSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [canLogin, setCanLogin] = useState(false);
  const [headerMessage, setHeaderMessage] = useState("Server not ready");
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("cms_theme");
    const initialTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runHealthCheck() {
      try {
        await publicHealth();
        if (cancelled) return;
        setCanLogin(true);
        setHeaderMessage("Ready to login");
      } catch (_err) {
        if (cancelled) return;
        setCanLogin(false);
        setHeaderMessage("Server not ready");
      }
    }

    // On page load: enable login when API is reachable (public /api/health).
    runHealthCheck();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canLogin || loginLoading) return;

    setLoginLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(email, password);
      setAuthSession(result.token, {
        email: result.user.email,
        username: result.user.username
      });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(message);
    } finally {
      setLoginLoading(false);
    }
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("cms_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  return (
    <div className="pageShell">
      <div className="loginThemeBar">
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
      </div>
      <LoginCard
        headerMessage={headerMessage}
        subtitle="Secure access to Nishanth Enterprises CMS"
        email={email}
        password={password}
        canLogin={canLogin}
        loginLoading={loginLoading}
        errorMessage={errorMessage}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
      />
    </div>
  );
}

