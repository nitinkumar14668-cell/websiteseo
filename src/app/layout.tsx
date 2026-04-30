import "./globals.css";
import React from "react";

export const metadata = {
  title: "SEO Master Pro",
  description:
    "Live Website SEO Analysis, Error Fixing, Ranking Check, and 1v1 Comparison tool powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#0A0A0B] text-slate-200">
        {children}
      </body>
    </html>
  );
}
