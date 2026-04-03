"use client";

import React from "react";

export default function LoginCard(props: {
  headerMessage: string;
  subtitle: string;
  email: string;
  password: string;
  canLogin: boolean;
  loginLoading: boolean;
  errorMessage?: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const {
    headerMessage,
    subtitle,
    email,
    password,
    canLogin,
    loginLoading,
    errorMessage,
    onEmailChange,
    onPasswordChange,
    onSubmit
  } = props;

  return (
    <div className="loginCard">
      <div className="loginHeader">
        <div className="loginHeaderTitle">{headerMessage}</div>
        <div className="loginHeaderSubtitle">{subtitle}</div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="formRow">
          <div className="fieldLabel">Email</div>
          <input
            className="field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            disabled={loginLoading}
          />
        </div>

        <div className="formRow">
          <div className="fieldLabel">Password</div>
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            disabled={loginLoading}
          />
        </div>

        <button className="btn btnPrimary" type="submit" disabled={!canLogin || loginLoading}>
          {loginLoading ? "Signing in..." : "Login"}
        </button>

        {errorMessage ? <div className="errorText">{errorMessage}</div> : null}
      </form>
    </div>
  );
}

