import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "CMS Login",
  description: "Secure access to Nishanth Enterprises CMS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

