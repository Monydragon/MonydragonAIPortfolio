import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { APP_VERSION, LAST_UPDATED } from "@/lib/version";

export const metadata: Metadata = {
  title: "Mony Dragon - AI-First Developer Portfolio",
  description: "Portfolio showcasing AI-first development workflows, architecture, and interactive projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer version={APP_VERSION} lastUpdated={LAST_UPDATED} />
      </body>
    </html>
  );
}

