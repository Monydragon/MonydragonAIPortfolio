import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { APP_VERSION, LAST_UPDATED } from "@/lib/version";
import FloatingAuthButton from "@/components/auth/FloatingAuthButton";
import VisitorTrackerWrapper from "@/components/analytics/VisitorTrackerWrapper";

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
    <html lang="en" className="scroll-smooth">
      <body 
        className="antialiased bg-white dark:bg-gray-950"
        suppressHydrationWarning
      >
        <SessionProvider>
          <VisitorTrackerWrapper />
          <Header />
          <main className="min-h-screen">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <FloatingAuthButton />
          <Footer version={APP_VERSION} lastUpdated={LAST_UPDATED} />
        </SessionProvider>
      </body>
    </html>
  );
}

